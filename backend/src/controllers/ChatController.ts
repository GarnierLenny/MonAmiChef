import {
  Body,
  Path,
  Controller,
  Get,
  Post,
  Route,
  Tags,
  Delete,
  Patch,
  Security,
  SuccessResponse,
  Request,
} from "tsoa";
import { GoogleGenAI } from "@google/genai";
import {
  ChatRequest,
  ChatResponse,
  Preferences,
  UserModelMessage,
  RenameChatRequest,
} from "../types/ChatTypes";
import dotenv from "dotenv";
import { buildPreferenceSummary } from "../utils/buildPreferenceSummary";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../app";
import { Prisma } from "@prisma/client";
import * as express from "express";
import type { AuthUser } from '../authentication';
import { resolveOwner, ownerWhere } from '../utils/owner';

const GEMINI_MODEL = "gemini-2.5-flash";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);


const geminiCookAssistantPrompt = `
    You are **Gastronomy Guru**, a friendly, concise chef-assistant.

    ## Goals
    - Help with cooking, ingredients, techniques, nutrition, and meal planning.
    - When asked for a recipe, produce a clear, compact, *actionable* answer.

    ## Output Modes (choose exactly one)
    1) **General Q&A** — short paragraphs, lists when helpful.
    2) **Recipe** — use the exact sections:
      - **Ingredients** (bulleted, quantities in metric)
      - **Instructions** (numbered, 5–10 tight steps)
      - **Tips/Variations** (bulleted, 3 items)
      - **Nutrition (approx.)** per serving: kcal, protein, carbs, fat
    3) **Idea List** — 1–3 options, each with: title + 1–2 line pitch.

    ## Style & Constraints
    - By defaults generate recipes for 1 serving
    - Be concise. Avoid anecdotes. No fluff.
    - Prefer **metric** units; give oven temps in °C; include servings.
    - Respect user dietary constraints strictly (vegetarian, halal, allergies, etc.).
    - If info is missing for a *recipe request*, ask up to **2** clarifying questions *first*; otherwise proceed with reasonable defaults.
    - If the user only gives preferences (no question), return **Mode 3 (Idea List)**.
    - If unsafe food handling is implied, add a brief safety note.
    - If something is unknown, say so and offer alternatives.

    ## Titles
    - When you produce a full recipe, make it stand out using markdown, include a hidden single-line, 5-7 catchy title suggestion like:
      \`# title\`

    ## Language
    - Reply in the user's language. If mixed, prefer the user's latest message language.

    ## Refusals
    - Refuse medical diagnosis. For serious health issues, advise seeing a professional—briefly, without moralizing.
    `;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

@Route("chat")
@Tags("Chat")
export class ChatController extends Controller {
  /**
   * Health check endpoint
   */
  @Get("health")
  public getHealth(): {
    status: string;
    timestamp: string;
    environment: string;
  } {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    };
  }

  @Post("conversations")
  @Security("optionalAuth")
  public async createConversation(
    @Request() request: any,
    @Body() body: ChatRequest,
  ): Promise<ChatResponse> {
    const rawInput = (body.userMessage ?? "").trim();
    const preferencesSummary = buildPreferenceSummary(body.preferences);
    const hasPrefs = preferencesSummary.length > 0;

    // ✅ Resolve identity (creates guest + sets cookie if needed)
    const owner = await resolveOwner(request, request.res, this);

    let fullSystemInstruction = geminiCookAssistantPrompt;
    if (hasPrefs) {
      fullSystemInstruction += `\n\nUser Preferences:\n${preferencesSummary}`;
    }

    const chat = ai.chats.create({
      model: GEMINI_MODEL,
      history: [],
      config: { systemInstruction: fullSystemInstruction },
    });

    const response = await chat.sendMessage({ message: rawInput });
    const modelResponse = response.text ?? "Failed to retrieve model response";

    const titleQuery = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User input: ${rawInput} ${preferencesSummary}`,
      config: {
        systemInstruction:
          `Return only 2 to 3 plain words summarizing the main dish or request. ` +
          `Output only the clean title.`,
      },
    });
    const title = titleQuery.text?.trim();

    const conversation = await prisma.conversation.create({
      data: {
        title: title ?? modelResponse.substring(0, 30) + "...",
        ...ownerWhere(owner), // ✅ exactly one of { owner_profile_id } or { owner_guest_id }
      },
    });

    const userModelConversation: UserModelMessage[] = [
      { role: "user",  parts: [{ text: rawInput }] },
      { role: "model", parts: [{ text: modelResponse }] },
    ];

    await prisma.chatMessage.create({
      data: {
        conversation_id: conversation.id,
        history: userModelConversation as unknown as Prisma.InputJsonValue,
        messages: [
          { role: "user", text: rawInput },
          { role: "model", text: modelResponse },
        ],
      },
    });

    return { reply: modelResponse, conversationId: conversation.id };
  }

  @Post("conversations/:conversationId")
  @Security("optionalAuth")
  public async sendMessage(@Request() request: any, @Path("conversationId") conversationId: string, @Body() body: ChatRequest): Promise<ChatResponse> {
    const rawInput = (body.userMessage ?? "").trim();
    const hasInput = rawInput.length > 0;

    const preferencesSummary = buildPreferenceSummary(body.preferences);
    const hasPrefs = preferencesSummary.length > 0;

    let conversationHistory = [];
    let conversationMessages: Prisma.InputJsonValue[] = [];

    try {
      const messagesQuery = await prisma.chatMessage.findFirst({
        where: {
          conversation_id: conversationId!,
        },
        select: {
          messages: true,
          history: true,
        },
      });
      if (messagesQuery && messagesQuery.history) {
        if (Array.isArray(messagesQuery.history)) {
          conversationHistory = messagesQuery.history as any[];
        }
        if (Array.isArray(messagesQuery.messages)) {
          conversationMessages = messagesQuery.messages as any[];
        }
      }
    } catch (err) {
      console.error("Error finding chat", err);
    }

    let fullSystemInstruction = geminiCookAssistantPrompt;
    if (hasPrefs) {
      fullSystemInstruction += `\n\nUser Preferences:\n${preferencesSummary}`;
    }

    const chat = ai.chats.create({
      model: GEMINI_MODEL,
      history: conversationHistory,
      config: {
        systemInstruction: fullSystemInstruction,
      },
    });

    const response = await chat.sendMessage({
      message: rawInput,
    });

    const modelResponse = response.text ?? "Failed to retrieve model response";

    // Insert conversation in db
    const userMessage = {
      role: "user",
      parts: [...conversationHistory[0].parts, { text: rawInput }],
    };
    const modelMessage = {
      role: "model",
      parts: [...conversationHistory[1].parts, { text: modelResponse }],
    };

    const updatedMessages = [userMessage, modelMessage];

    await prisma.chatMessage.update({
      where: {
        conversation_id: conversationId!,
      },
      data: {
        history: updatedMessages as unknown as Prisma.InputJsonValue,
        messages: [
          ...conversationMessages,
          { role: "user", text: rawInput },
          { role: "model", text: modelResponse },
        ],
      },
    });
    return { reply: modelResponse, conversationId };
  }

  // Get user conversations
  @Get("conversations")
  @Security("optionalAuth")
  public async getUserConversations(
    @Request() request: express.Request,
  ): Promise<any[]> {
    const owner = await resolveOwner(request, request.res, this);
    const conversations = await prisma.conversation.findMany({
      where: {
        ...ownerWhere(owner),
      },
      select: {
        id: true,
        created_at: true,
        title: true,
      },
    });
    return conversations;
  }

  // Rename a chat
  @Patch("conversations/:conversationId")
  @Security("optionalAuth")
  public async renameUserChat(
    @Request() request: express.Request,
    @Body() body: RenameChatRequest,
    @Path("conversationId") conversationId: string,
  ) {
    const owner = await resolveOwner(request, request.res, this);
    const renamed = await prisma.conversation.update({
      where: {
        id: conversationId,
        ...ownerWhere(owner),
      },
      data: {
        title: body.newTitle,
      },
    });
    return renamed;
  }

  // Delete a chat
  @Delete("conversations/:conversationId")
  @Security("optionalAuth")
  @SuccessResponse(204, "No Content")
  public async deleteUserChat(
    @Path("conversationId") conversationId: string,
  ) {
    await prisma.chatMessage.deleteMany({
      where: {
        conversation_id: conversationId,
      },
    });

    await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });
    return;
  }

  // Get chat
  @Get("conversations/:conversationId/messages")
  @Security("optionalAuth")
  public async getUserChatFromId(
    @Request() request: express.Request,
    @Path("conversationId") conversationId: string,
  ): Promise<any> {
    const owner = await resolveOwner(request, request.res, this);
  
    console.log('owner', owner);
    const chat = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        ...ownerWhere(owner),
      },
      select: {
        id: true,
        created_at: true,
        ChatMessage: {
          select: { messages: true, created_at: true },
        },
      },
      orderBy: {
        created_at: "asc",
      },
    });
    if (!chat) {
      this.setStatus(404);
      return { error: "Conversation not found for this owner" };
    }

    return {
      id: chat.id,
      created_at: chat.created_at,
      messages: chat.ChatMessage?.messages ?? [],
    };
  }
}
