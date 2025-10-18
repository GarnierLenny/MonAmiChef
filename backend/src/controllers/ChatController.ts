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
  Response,
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
import { resolveOptimizedOwner, ownerWhereOptimized } from '../utils/optimizedOwner';
import {
  APIError,
  NotFoundError,
  ServiceUnavailableError,
  ValidationError,
  InternalServerError,
  handleControllerError,
  type ErrorResponse
} from '../types/ErrorTypes';
import { GoalAwareMealService } from '../services/GoalAwareMealService';

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
      - **Ingredients** (bulleted list with ONLY ingredient names and quantities in metric format - NO preparation instructions like "diced", "chopped", "minced", etc. Example: "200g tomatoes" NOT "200g tomatoes, diced")
      - **Instructions** (numbered, 5–10 tight steps - this is where you include ALL preparation details like chopping, dicing, mincing, etc.)
      - **Tips/Variations** (bulleted, 3 items)
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
  @Response<ErrorResponse>(400, "Bad Request")
  @Response<ErrorResponse>(500, "Internal Server Error")
  @Response<ErrorResponse>(503, "Service Unavailable")
  public async createConversation(
    @Request() request: any,
    @Body() body: ChatRequest,
  ): Promise<ChatResponse> {
    try {
      // Validate input
      const rawInput = (body.userMessage ?? "").trim();
      if (!rawInput) {
        throw new ValidationError("Message cannot be empty");
      }

      if (rawInput.length > 1000) {
        throw new ValidationError("Message is too long (max 1000 characters)");
      }

      const preferencesSummary = buildPreferenceSummary(body.preferences);
      const hasPrefs = preferencesSummary.length > 0;

      // ✅ Resolve identity (creates guest + sets cookie if needed)
      const owner = await resolveOptimizedOwner(request, request.res, this);

      let fullSystemInstruction = geminiCookAssistantPrompt;
      if (hasPrefs) {
        fullSystemInstruction += `\n\nUser Preferences:\n${preferencesSummary}`;
      }

      // Add goal context for authenticated users
      if (!owner.isGuest && owner.userId) {
        const goalService = new GoalAwareMealService();
        try {
          const goalContext = await goalService.getGoalContext(owner.userId, "");
          if (goalContext.hasGoals && goalContext.goalMessage) {
            fullSystemInstruction += `\n\nUSER GOALS: ${goalContext.goalMessage}`;
          }
        } catch (error) {
          console.warn('Failed to get goal context for chat:', error);
        }
      }

      let modelResponse: string;
      let title: string | undefined;

      // Generate AI response with timeout and retry
      const generateResponseWithTimeout = async (retryCount = 0): Promise<any> => {
        const timeoutMs = 25000; // 25 second timeout
        const maxRetries = 2;

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });

        try {
          const chat = ai.chats.create({
            model: GEMINI_MODEL,
            history: [],
            config: { systemInstruction: fullSystemInstruction },
          });

          const aiPromise = chat.sendMessage({ message: rawInput });
          const response = await Promise.race([aiPromise, timeoutPromise]);
          return response;
        } catch (error) {
          console.warn(`AI request attempt ${retryCount + 1} failed:`, error);

          if (retryCount < maxRetries && (error instanceof Error && (error.message === 'Request timeout' || (error as any).code === 'DEADLINE_EXCEEDED'))) {
            console.log(`Retrying AI request (attempt ${retryCount + 2}/${maxRetries + 1})...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            return generateResponseWithTimeout(retryCount + 1);
          }

          throw error;
        }
      };

      try {
        const response = await generateResponseWithTimeout();
        modelResponse = response.text ?? "Failed to retrieve model response";

        // Generate title with timeout and fallback
        try {
          const titleQuery = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `User input: ${rawInput} ${preferencesSummary}`,
            config: {
              systemInstruction:
                `Return only 2 to 3 plain words summarizing the main dish or request. ` +
                `Output only the clean title.`,
            },
          });
          title = titleQuery.text?.trim();
        } catch (titleError) {
          console.warn("Failed to generate title:", titleError);
          // Continue without title - will use fallback
        }
      } catch (aiError) {
        console.error("AI service error:", aiError);
        throw new ServiceUnavailableError("AI cooking assistant is temporarily unavailable. Please try again in a few moments.");
      }

      try {
        const conversation = await prisma.conversation.create({
          data: {
            title: title ?? modelResponse.substring(0, 30) + "...",
            ...ownerWhereOptimized(owner),
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
      } catch (dbError) {
        console.error("Database error:", dbError);
        throw new InternalServerError("Failed to save conversation. Please try again.");
      }
    } catch (error) {
      if (error instanceof APIError) {
        this.setStatus(error.statusCode);
        throw error;
      }
      
      const errorResponse = handleControllerError(error, request.path);
      this.setStatus(errorResponse.statusCode);
      throw new APIError(errorResponse.statusCode, errorResponse.message);
    }
  }

  @Post("conversations/:conversationId")
  @Security("optionalAuth")
  @Response<ErrorResponse>(400, "Bad Request")
  @Response<ErrorResponse>(404, "Not Found")
  @Response<ErrorResponse>(500, "Internal Server Error")
  @Response<ErrorResponse>(503, "Service Unavailable")
  public async sendMessage(@Request() request: any, @Path("conversationId") conversationId: string, @Body() body: ChatRequest): Promise<ChatResponse> {
    try {
      // Validate input
      const rawInput = (body.userMessage ?? "").trim();
      if (!rawInput) {
        throw new ValidationError("Message cannot be empty");
      }

      if (rawInput.length > 1000) {
        throw new ValidationError("Message is too long (max 1000 characters)");
      }

      if (!conversationId) {
        throw new ValidationError("Conversation ID is required");
      }

      const preferencesSummary = buildPreferenceSummary(body.preferences);
      const hasPrefs = preferencesSummary.length > 0;

      let conversationHistory = [];
      let conversationMessages: Prisma.InputJsonValue[] = [];
      let owner;

      // Get conversation history with proper error handling
      try {
        owner = await resolveOptimizedOwner(request, request.res, this);
        
        // Verify conversation exists and belongs to user
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            ...ownerWhereOptimized(owner),
          },
        });

        if (!conversation) {
          throw new NotFoundError("Conversation not found or access denied");
        }

        const messagesQuery = await prisma.chatMessage.findFirst({
          where: {
            conversation_id: conversationId,
          },
          select: {
            messages: true,
            history: true,
          },
        });

        if (messagesQuery) {
          if (Array.isArray(messagesQuery.history)) {
            conversationHistory = messagesQuery.history as any[];
          }
          if (Array.isArray(messagesQuery.messages)) {
            conversationMessages = messagesQuery.messages as any[];
          }
        }
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }
        console.error("Error finding chat:", error);
        throw new InternalServerError("Failed to retrieve conversation history");
      }

      // Generate AI response
      let modelResponse: string;

      let fullSystemInstruction = geminiCookAssistantPrompt;
      if (hasPrefs) {
        fullSystemInstruction += `\n\nUser Preferences:\n${preferencesSummary}`;
      }

      // Add goal context for authenticated users
      if (owner && !owner.isGuest && owner.userId) {
        const goalService = new GoalAwareMealService();
        try {
          const goalContext = await goalService.getGoalContext(owner.userId, "");
          if (goalContext.hasGoals && goalContext.goalMessage) {
            fullSystemInstruction += `\n\nUSER GOALS: ${goalContext.goalMessage}`;
          }
        } catch (error) {
          console.warn('Failed to get goal context for chat:', error);
        }
      }

      // Generate AI response with timeout and retry
      const generateResponseWithTimeout = async (retryCount = 0): Promise<any> => {
        const timeoutMs = 25000; // 25 second timeout
        const maxRetries = 2;

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });

        try {
          const chat = ai.chats.create({
            model: GEMINI_MODEL,
            history: conversationHistory,
            config: {
              systemInstruction: fullSystemInstruction,
            },
          });

          const aiPromise = chat.sendMessage({ message: rawInput });
          const response = await Promise.race([aiPromise, timeoutPromise]);
          return response;
        } catch (error) {
          console.warn(`AI request attempt ${retryCount + 1} failed:`, error);

          if (retryCount < maxRetries && (error instanceof Error && (error.message === 'Request timeout' || (error as any).code === 'DEADLINE_EXCEEDED'))) {
            console.log(`Retrying AI request (attempt ${retryCount + 2}/${maxRetries + 1})...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            return generateResponseWithTimeout(retryCount + 1);
          }

          throw error;
        }
      };

      try {
        const response = await generateResponseWithTimeout();
        modelResponse = response.text ?? "Failed to retrieve model response";
      } catch (aiError) {
        console.error("AI service error:", aiError);
        throw new ServiceUnavailableError("AI cooking assistant is temporarily unavailable. Please try again in a few moments.");
      }

      // Update conversation in database
      try {
        // Handle conversation history updates safely
        const userMessage = {
          role: "user",
          parts: conversationHistory.length > 0 && conversationHistory[0]?.parts 
            ? [...conversationHistory[0].parts, { text: rawInput }]
            : [{ text: rawInput }],
        };
        
        const modelMessage = {
          role: "model",
          parts: conversationHistory.length > 1 && conversationHistory[1]?.parts 
            ? [...conversationHistory[1].parts, { text: modelResponse }]
            : [{ text: modelResponse }],
        };

        const updatedMessages = [userMessage, modelMessage];

        await prisma.chatMessage.update({
          where: {
            conversation_id: conversationId,
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
      } catch (dbError) {
        console.error("Database error:", dbError);
        throw new InternalServerError("Failed to save message. Please try again.");
      }
    } catch (error) {
      if (error instanceof APIError) {
        this.setStatus(error.statusCode);
        throw error;
      }
      
      const errorResponse = handleControllerError(error, request.path);
      this.setStatus(errorResponse.statusCode);
      throw new APIError(errorResponse.statusCode, errorResponse.message);
    }
  }

  // Get user conversations
  @Get("conversations")
  @Security("optionalAuth")
  @Response<ErrorResponse>(500, "Internal Server Error")
  public async getUserConversations(
    @Request() request: express.Request,
  ): Promise<any[]> {
    try {
      const owner = await resolveOptimizedOwner(request, request.res, this);
      
      const conversations = await prisma.conversation.findMany({
        where: {
          ...ownerWhereOptimized(owner),
        },
        select: {
          id: true,
          created_at: true,
          title: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 100, // Limit to prevent performance issues
      });
      
      return conversations;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      
      if (error instanceof APIError) {
        this.setStatus(error.statusCode);
        throw error;
      }
      
      const errorResponse = handleControllerError(error, request.path);
      this.setStatus(errorResponse.statusCode);
      throw new APIError(errorResponse.statusCode, errorResponse.message);
    }
  }

  // Rename a chat
  @Patch("conversations/:conversationId")
  @Security("optionalAuth")
  @Response<ErrorResponse>(400, "Bad Request")
  @Response<ErrorResponse>(404, "Not Found")
  @Response<ErrorResponse>(500, "Internal Server Error")
  public async renameUserChat(
    @Request() request: express.Request,
    @Body() body: RenameChatRequest,
    @Path("conversationId") conversationId: string,
  ) {
    try {
      // Validate input
      if (!conversationId) {
        throw new ValidationError("Conversation ID is required");
      }

      if (!body.newTitle || typeof body.newTitle !== 'string') {
        throw new ValidationError("New title is required");
      }

      const newTitle = body.newTitle.trim();
      if (!newTitle) {
        throw new ValidationError("Title cannot be empty");
      }

      if (newTitle.length > 100) {
        throw new ValidationError("Title is too long (max 100 characters)");
      }

      const owner = await resolveOptimizedOwner(request, request.res, this);
      
      try {
        const renamed = await prisma.conversation.update({
          where: {
            id: conversationId,
            ...ownerWhereOptimized(owner),
          },
          data: {
            title: newTitle,
          },
        });
        return renamed;
      } catch (prismaError: any) {
        if (prismaError.code === 'P2025') {
          throw new NotFoundError("Conversation not found or access denied");
        }
        throw prismaError;
      }
    } catch (error) {
      console.error("Error renaming conversation:", error);
      
      if (error instanceof APIError) {
        this.setStatus(error.statusCode);
        throw error;
      }
      
      const errorResponse = handleControllerError(error, request.path);
      this.setStatus(errorResponse.statusCode);
      throw new APIError(errorResponse.statusCode, errorResponse.message);
    }
  }

  // Delete a chat
  @Delete("conversations/:conversationId")
  @Security("optionalAuth")
  @SuccessResponse(204, "No Content")
  @Response<ErrorResponse>(400, "Bad Request")
  @Response<ErrorResponse>(404, "Not Found")
  @Response<ErrorResponse>(500, "Internal Server Error")
  public async deleteUserChat(
    @Request() request: express.Request,
    @Path("conversationId") conversationId: string,
  ) {
    try {
      // Validate input
      if (!conversationId) {
        throw new ValidationError("Conversation ID is required");
      }

      const owner = await resolveOptimizedOwner(request, request.res, this);

      // Verify conversation exists and belongs to user before deletion
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          ...ownerWhereOptimized(owner),
        },
      });

      if (!conversation) {
        throw new NotFoundError("Conversation not found or access denied");
      }

      try {
        // Delete in transaction for data integrity
        await prisma.$transaction(async (tx) => {
          // Delete messages first (foreign key constraint)
          await tx.chatMessage.deleteMany({
            where: {
              conversation_id: conversationId,
            },
          });

          // Then delete conversation
          await tx.conversation.delete({
            where: {
              id: conversationId,
            },
          });
        });

        this.setStatus(204);
        return;
      } catch (deleteError) {
        console.error("Error deleting conversation:", deleteError);
        throw new InternalServerError("Failed to delete conversation. Please try again.");
      }
    } catch (error) {
      if (error instanceof APIError) {
        this.setStatus(error.statusCode);
        throw error;
      }
      
      const errorResponse = handleControllerError(error, request.path);
      this.setStatus(errorResponse.statusCode);
      throw new APIError(errorResponse.statusCode, errorResponse.message);
    }
  }

  // Get chat
  @Get("conversations/:conversationId/messages")
  @Security("optionalAuth")
  @Response<ErrorResponse>(400, "Bad Request")
  @Response<ErrorResponse>(404, "Not Found")
  @Response<ErrorResponse>(500, "Internal Server Error")
  public async getUserChatFromId(
    @Request() request: express.Request,
    @Path("conversationId") conversationId: string,
  ): Promise<any> {
    try {
      // Validate input
      if (!conversationId) {
        throw new ValidationError("Conversation ID is required");
      }

      const owner = await resolveOptimizedOwner(request, request.res, this);
    
      try {
        const chat = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            ...ownerWhereOptimized(owner),
          },
          select: {
            id: true,
            created_at: true,
            title: true,
            ChatMessage: {
              select: { 
                messages: true, 
                created_at: true 
              },
            },
          },
          orderBy: {
            created_at: "asc",
          },
        });

        if (!chat) {
          throw new NotFoundError("Conversation not found or access denied");
        }

        return {
          id: chat.id,
          title: chat.title,
          created_at: chat.created_at,
          messages: chat.ChatMessage?.messages ?? [],
        };
      } catch (dbError) {
        if (dbError instanceof APIError) {
          throw dbError;
        }
        console.error("Database error:", dbError);
        throw new InternalServerError("Failed to retrieve conversation. Please try again.");
      }
    } catch (error) {
      if (error instanceof APIError) {
        this.setStatus(error.statusCode);
        throw error;
      }
      
      const errorResponse = handleControllerError(error, request.path);
      this.setStatus(errorResponse.statusCode);
      throw new APIError(errorResponse.statusCode, errorResponse.message);
    }
  }

  /**
   * Generate a recipe for a specific meal slot
   */
  @Post("generate-meal-recipe")
  @Security("optionalAuth")
  @Response<ErrorResponse>(400, "Bad Request")
  @Response<ErrorResponse>(500, "Internal Server Error")
  @Response<ErrorResponse>(503, "Service Unavailable")
  public async generateMealRecipe(
    @Request() request: express.Request,
    @Body() body: {
      mealType: "breakfast" | "lunch" | "dinner" | "snack";
      preferences?: string;
      dietaryRestrictions?: string[];
      day?: string;
    }
  ): Promise<{
    recipe: {
      id: string;
      title: string;
      content_json: any;
      nutrition: any;
      tags: string[];
      created_at: string;
    };
  }> {
    try {
      // Validate input
      if (!body.mealType || !["breakfast", "lunch", "dinner", "snack"].includes(body.mealType)) {
        throw new ValidationError("Invalid meal type. Must be: breakfast, lunch, dinner, or snack");
      }

      const owner = await resolveOptimizedOwner(request, request.res, this);

      // Get goal context for meal generation
      const goalService = new GoalAwareMealService();
      let goalContext = { hasGoals: false, goalMessage: "Generate a balanced, nutritious meal." };

      if (!owner.isGuest && owner.userId && body.day) {
        try {
          goalContext = await goalService.getGoalContext(owner.userId, body.day);
        } catch (error) {
          console.warn('Failed to get goal context:', error);
          // Continue without goal context if service fails
        }
      } else if (body.day) {
        // For guests or when no authenticated goals exist, apply default high-calorie meal generation
        goalContext = {
          hasGoals: true,
          goalMessage: "The user wants substantial, high-calorie meals. CRITICAL: This meal MUST contain approximately 800-900 calories. This is NOT optional - it's required for proper meal planning. SERVING SIZE CONSTRAINT: Always set servings = 1. To reach the calorie target, use calorie-dense ingredients (nuts, oils, dairy, proteins), larger portions, and multiple dishes. Examples: avocado toast + protein smoothie + fruit, or salmon + quinoa + vegetables with olive oil. The meal should be filling and substantial for ONE person."
        };
      }

      // Build meal-specific prompt
      const dietaryInfo = body.dietaryRestrictions?.length
        ? `Dietary restrictions: ${body.dietaryRestrictions.join(", ")}. `
        : "";

      const userPrefs = body.preferences
        ? `User preferences: ${body.preferences}. `
        : "";

      const goalInfo = goalContext.hasGoals && goalContext.goalMessage
        ? `${goalContext.goalMessage} `
        : "";

      const mealPrompt = `${goalInfo}Generate a calorie-rich, substantial ${body.mealType} recipe for 1 serving. ${dietaryInfo}${userPrefs}Create multiple dishes or components for this meal to increase calories (e.g., for breakfast: protein smoothie + avocado toast + nuts, for lunch: hearty salad + protein + healthy fats, etc.). Use calorie-dense ingredients like nuts, oils, cheese, proteins, whole grains. MANDATORY: Always set servings to 1 and create filling, high-calorie portions for ONE person. Make it nutritious and appropriate for ${body.mealType}.

CRITICAL NUTRITION REQUIREMENT: You MUST include a **Nutrition** section with EXACT calorie and macro information. Format it EXACTLY as:

### Nutrition (per serving)
**Total per serving:** [calories] cal, [protein]g protein, [carbs]g carbs, [fat]g fat

Example: **Total per serving:** 650 cal, 35g protein, 48g carbs, 22g fat

Without accurate nutrition data, the recipe cannot be saved. This is MANDATORY.`;

      console.log('=== DEBUG: Full prompt sent to AI ===');
      console.log('Goal context:', goalContext);
      console.log('Final meal prompt:', mealPrompt);
      console.log('=== End DEBUG ===');

      // Use Gemini to generate the recipe with timeout and retry, including nutrition validation
      const generateRecipeWithValidation = async (attemptCount = 0): Promise<any> => {
        const timeoutMs = 25000; // 25 second timeout
        const maxAttempts = 3; // Allow 3 total attempts

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });

        try {
          const chat = ai.chats.create({
            model: GEMINI_MODEL,
            history: [],
            config: {
              systemInstruction: geminiCookAssistantPrompt,
            },
          });

          const aiPromise = chat.sendMessage({
            message: mealPrompt,
          });

          const response = await Promise.race([aiPromise, timeoutPromise]) as any;
          const text = response.text;

          if (!text || text.trim().length === 0) {
            throw new Error('AI service returned empty response');
          }

          // Parse the AI response to extract recipe components
          const { parseRecipeFromAI } = require('../utils/recipeParser');
          const parsedRecipe = parseRecipeFromAI(text);

          // Validate nutrition data exists and has all required fields
          const nutrition = parsedRecipe.nutrition;
          if (!nutrition ||
              typeof nutrition.calories !== 'number' ||
              nutrition.calories <= 0 ||
              typeof nutrition.protein !== 'number' ||
              typeof nutrition.carbs !== 'number' ||
              typeof nutrition.fat !== 'number') {

            console.warn(`Attempt ${attemptCount + 1}: Missing or invalid nutrition data:`, nutrition);

            if (attemptCount < maxAttempts - 1) {
              console.log(`Retrying recipe generation due to missing nutrition (attempt ${attemptCount + 2}/${maxAttempts})...`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
              return generateRecipeWithValidation(attemptCount + 1);
            } else {
              throw new Error('Failed to generate recipe with valid nutrition data after multiple attempts');
            }
          }

          console.log(`Successfully parsed recipe with nutrition: ${nutrition.calories} cal`);
          return parsedRecipe;

        } catch (error) {
          console.warn(`Recipe generation attempt ${attemptCount + 1} failed:`, error);

          if (attemptCount < maxAttempts - 1 &&
              (error instanceof Error &&
               (error.message === 'Request timeout' ||
                (error as any).code === 'DEADLINE_EXCEEDED'))) {
            console.log(`Retrying due to timeout (attempt ${attemptCount + 2}/${maxAttempts})...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            return generateRecipeWithValidation(attemptCount + 1);
          }

          throw error;
        }
      };

      const parsedRecipe = await generateRecipeWithValidation();

      // Create recipe in database
      const recipe = await prisma.recipe.create({
        data: {
          title: parsedRecipe.title,
          content_json: parsedRecipe.content_json as any,
          nutrition: parsedRecipe.nutrition as any,
          tags: parsedRecipe.tags,
        },
      });


      this.setStatus(201);
      return {
        recipe: {
          id: recipe.id,
          title: recipe.title,
          content_json: recipe.content_json as any,
          nutrition: recipe.nutrition as any,
          tags: recipe.tags,
          created_at: recipe.created_at.toISOString(),
        },
      };
    } catch (error) {
      console.error("Error generating meal recipe:", error);
      const errorResponse = handleControllerError(error, request.path);
      this.setStatus(errorResponse.statusCode);
      throw new APIError(errorResponse.statusCode, errorResponse.message);
    }
  }
}
