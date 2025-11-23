import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { Prisma } from '@prisma/client';
import { ChatRepository } from '../repositories/chat.repository';
import { GoalAwareMealService } from './goal-aware-meal.service';
import { buildPreferenceSummary } from '../utils/buildPreferenceSummary';
import { parseRecipeFromAI } from '../utils/recipeParser';
import { Owner, ownerWhereOptimized } from '../utils/owner.util';
import {
  ChatRequest,
  ChatResponse,
  UserModelMessage,
  Preferences,
} from '../types/ChatTypes';
import { GEMINI_MODEL } from '../constants/ai.constants';

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

@Injectable()
export class ChatService {
  private ai: GoogleGenAI;

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly goalService: GoalAwareMealService,
  ) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  /**
   * Generate AI response with timeout and retry logic
   */
  private async generateResponseWithTimeout(
    systemInstruction: string,
    userMessage: string,
    history: any[] = [],
    retryCount = 0,
  ): Promise<string> {
    const timeoutMs = 25000; // 25 second timeout
    const maxRetries = 2;

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });

    try {
      const chat = this.ai.chats.create({
        model: GEMINI_MODEL,
        history,
        config: { systemInstruction },
      });

      const aiPromise = chat.sendMessage({ message: userMessage });
      const response = await Promise.race([aiPromise, timeoutPromise]);
      return (response as any).text ?? 'Failed to retrieve model response';
    } catch (error) {
      console.warn(`AI request attempt ${retryCount + 1} failed:`, error);

      if (
        retryCount < maxRetries &&
        error instanceof Error &&
        (error.message === 'Request timeout' ||
          (error as any).code === 'DEADLINE_EXCEEDED')
      ) {
        console.log(
          `Retrying AI request (attempt ${retryCount + 2}/${maxRetries + 1})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        return this.generateResponseWithTimeout(
          systemInstruction,
          userMessage,
          history,
          retryCount + 1,
        );
      }

      throw error;
    }
  }

  /**
   * Generate a title for a conversation
   */
  private async generateTitle(
    userMessage: string,
    preferencesSummary: string,
  ): Promise<string | undefined> {
    try {
      const titleQuery = await this.ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `User input: ${userMessage} ${preferencesSummary}`,
        config: {
          systemInstruction:
            `Return only 2 to 3 plain words summarizing the main dish or request. ` +
            `Output only the clean title.`,
        },
      });
      return titleQuery.text?.trim();
    } catch (titleError) {
      console.warn('Failed to generate title:', titleError);
      return undefined;
    }
  }

  /**
   * Build system instruction with preferences and goals
   */
  private async buildSystemInstruction(
    preferences: Preferences,
    owner: Owner,
  ): Promise<string> {
    const preferencesSummary = buildPreferenceSummary(preferences);
    let fullSystemInstruction = geminiCookAssistantPrompt;

    if (preferencesSummary.length > 0) {
      fullSystemInstruction += `\n\nUser Preferences:\n${preferencesSummary}`;
    }

    // Add goal context for authenticated users
    if (!owner.isGuest && owner.userId) {
      try {
        const goalContext = await this.goalService.getGoalContext(
          owner.userId,
          '',
        );
        if (goalContext.hasGoals && goalContext.goalMessage) {
          fullSystemInstruction += `\n\nUSER GOALS: ${goalContext.goalMessage}`;
        }
      } catch (error) {
        console.warn('Failed to get goal context for chat:', error);
      }
    }

    return fullSystemInstruction;
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    chatRequest: ChatRequest,
    owner: Owner,
  ): Promise<ChatResponse> {
    const rawInput = (chatRequest.userMessage ?? '').trim();

    if (!rawInput) {
      throw new HttpException('Message cannot be empty', HttpStatus.BAD_REQUEST);
    }

    if (rawInput.length > 1000) {
      throw new HttpException(
        'Message is too long (max 1000 characters)',
        HttpStatus.BAD_REQUEST,
      );
    }

    const preferencesSummary = buildPreferenceSummary(chatRequest.preferences);
    const fullSystemInstruction = await this.buildSystemInstruction(
      chatRequest.preferences,
      owner,
    );

    let modelResponse: string;
    let title: string | undefined;

    // Generate AI response
    try {
      modelResponse = await this.generateResponseWithTimeout(
        fullSystemInstruction,
        rawInput,
      );

      // Generate title
      title = await this.generateTitle(rawInput, preferencesSummary);
    } catch (aiError) {
      console.error('AI service error:', aiError);
      throw new HttpException(
        'AI cooking assistant is temporarily unavailable. Please try again in a few moments.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Save to database
    try {
      const conversation = await this.chatRepository.createConversation({
        title: title ?? modelResponse.substring(0, 30) + '...',
        ...ownerWhereOptimized(owner),
      });

      const userModelConversation: UserModelMessage[] = [
        { role: 'user', parts: [{ text: rawInput }] },
        { role: 'model', parts: [{ text: modelResponse }] },
      ];

      await this.chatRepository.createChatMessage({
        conversation_id: conversation.id,
        history: userModelConversation as unknown as Prisma.InputJsonValue,
        messages: [
          { role: 'user', text: rawInput },
          { role: 'model', text: modelResponse },
        ],
      });

      return { reply: modelResponse, conversationId: conversation.id };
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new HttpException(
        'Failed to save conversation. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send message to existing conversation
   */
  async sendMessage(
    conversationId: string,
    chatRequest: ChatRequest,
    owner: Owner,
  ): Promise<ChatResponse> {
    const rawInput = (chatRequest.userMessage ?? '').trim();

    if (!rawInput) {
      throw new HttpException('Message cannot be empty', HttpStatus.BAD_REQUEST);
    }

    if (rawInput.length > 1000) {
      throw new HttpException(
        'Message is too long (max 1000 characters)',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!conversationId) {
      throw new HttpException(
        'Conversation ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Get conversation history
    let conversationHistory: any[] = [];
    let conversationMessages: Prisma.InputJsonValue[] = [];

    try {
      // Verify conversation exists and belongs to user
      const conversation = await this.chatRepository.findConversationById(
        conversationId,
        ownerWhereOptimized(owner),
      );

      if (!conversation) {
        throw new HttpException(
          'Conversation not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      const messagesQuery = await this.chatRepository.findChatMessage(conversationId);

      if (messagesQuery) {
        if (Array.isArray(messagesQuery.history)) {
          conversationHistory = messagesQuery.history as any[];
        }
        if (Array.isArray(messagesQuery.messages)) {
          conversationMessages = messagesQuery.messages as any[];
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error finding chat:', error);
      throw new HttpException(
        'Failed to retrieve conversation history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Generate AI response
    const fullSystemInstruction = await this.buildSystemInstruction(
      chatRequest.preferences,
      owner,
    );

    let modelResponse: string;

    try {
      modelResponse = await this.generateResponseWithTimeout(
        fullSystemInstruction,
        rawInput,
        conversationHistory,
      );
    } catch (aiError) {
      console.error('AI service error:', aiError);
      throw new HttpException(
        'AI cooking assistant is temporarily unavailable. Please try again in a few moments.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Update conversation in database
    try {
      const userMessage = {
        role: 'user',
        parts:
          conversationHistory.length > 0 && conversationHistory[0]?.parts
            ? [...conversationHistory[0].parts, { text: rawInput }]
            : [{ text: rawInput }],
      };

      const modelMessage = {
        role: 'model',
        parts:
          conversationHistory.length > 1 && conversationHistory[1]?.parts
            ? [...conversationHistory[1].parts, { text: modelResponse }]
            : [{ text: modelResponse }],
      };

      const updatedMessages = [userMessage, modelMessage];

      await this.chatRepository.updateChatMessage(conversationId, {
        history: updatedMessages as unknown as Prisma.InputJsonValue,
        messages: [
          ...conversationMessages,
          { role: 'user', text: rawInput },
          { role: 'model', text: modelResponse },
        ],
      });

      return { reply: modelResponse, conversationId };
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new HttpException(
        'Failed to save message. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user conversations
   */
  async getUserConversations(owner: Owner): Promise<any[]> {
    try {
      const conversations = await this.chatRepository.findUserConversations(
        ownerWhereOptimized(owner),
      );
      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new HttpException(
        'Failed to fetch conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Rename a conversation
   */
  async renameConversation(
    conversationId: string,
    newTitle: string,
    owner: Owner,
  ): Promise<any> {
    if (!conversationId) {
      throw new HttpException(
        'Conversation ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!newTitle || typeof newTitle !== 'string') {
      throw new HttpException('New title is required', HttpStatus.BAD_REQUEST);
    }

    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      throw new HttpException('Title cannot be empty', HttpStatus.BAD_REQUEST);
    }

    if (trimmedTitle.length > 100) {
      throw new HttpException(
        'Title is too long (max 100 characters)',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const renamed = await this.chatRepository.updateConversation(
        conversationId,
        ownerWhereOptimized(owner),
        { title: trimmedTitle },
      );
      return renamed;
    } catch (prismaError: any) {
      if (prismaError.code === 'P2025') {
        throw new HttpException(
          'Conversation not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to rename conversation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string, owner: Owner): Promise<void> {
    if (!conversationId) {
      throw new HttpException(
        'Conversation ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify conversation exists and belongs to user
    const conversation = await this.chatRepository.findConversationById(
      conversationId,
      ownerWhereOptimized(owner),
    );

    if (!conversation) {
      throw new HttpException(
        'Conversation not found or access denied',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      await this.chatRepository.deleteConversationWithMessages(conversationId);
    } catch (deleteError) {
      console.error('Error deleting conversation:', deleteError);
      throw new HttpException(
        'Failed to delete conversation. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(
    conversationId: string,
    owner: Owner,
  ): Promise<any> {
    if (!conversationId) {
      throw new HttpException(
        'Conversation ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const chat = await this.chatRepository.findConversationWithMessages(
        conversationId,
        ownerWhereOptimized(owner),
      );

      if (!chat) {
        throw new HttpException(
          'Conversation not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at,
        messages: chat.ChatMessage && chat.ChatMessage.length > 0 ? chat.ChatMessage[0].messages : [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Database error:', error);
      throw new HttpException(
        'Failed to retrieve conversation. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate a recipe for a specific meal slot
   */
  async generateMealRecipe(
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    preferences: string | undefined,
    dietaryRestrictions: string[] | undefined,
    day: string | undefined,
    owner: Owner,
  ): Promise<any> {
    // Get goal context for meal generation
    let goalContext = {
      hasGoals: false,
      goalMessage: 'Generate a balanced, nutritious meal.',
    };

    if (!owner.isGuest && owner.userId && day) {
      try {
        goalContext = await this.goalService.getGoalContext(owner.userId, day);
      } catch (error) {
        console.warn('Failed to get goal context:', error);
      }
    } else if (day) {
      // For guests or when no authenticated goals exist, apply default high-calorie meal generation
      goalContext = {
        hasGoals: true,
        goalMessage:
          'The user wants substantial, high-calorie meals. CRITICAL: This meal MUST contain approximately 800-900 calories. This is NOT optional - it\'s required for proper meal planning. SERVING SIZE CONSTRAINT: Always set servings = 1. To reach the calorie target, use calorie-dense ingredients (nuts, oils, dairy, proteins), larger portions, and multiple dishes. Examples: avocado toast + protein smoothie + fruit, or salmon + quinoa + vegetables with olive oil. The meal should be filling and substantial for ONE person.',
      };
    }

    // Build meal-specific prompt
    const dietaryInfo = dietaryRestrictions?.length
      ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}. `
      : '';

    const userPrefs = preferences ? `User preferences: ${preferences}. ` : '';

    const goalInfo =
      goalContext.hasGoals && goalContext.goalMessage
        ? `${goalContext.goalMessage} `
        : '';

    const mealPrompt = `${goalInfo}Generate a calorie-rich, substantial ${mealType} recipe for 1 serving. ${dietaryInfo}${userPrefs}Create multiple dishes or components for this meal to increase calories (e.g., for breakfast: protein smoothie + avocado toast + nuts, for lunch: hearty salad + protein + healthy fats, etc.). Use calorie-dense ingredients like nuts, oils, cheese, proteins, whole grains. MANDATORY: Always set servings to 1 and create filling, high-calorie portions for ONE person. Make it nutritious and appropriate for ${mealType}.

CRITICAL NUTRITION REQUIREMENT: You MUST include a **Nutrition** section with EXACT calorie and macro information. Format it EXACTLY as:

### Nutrition (per serving)
**Total per serving:** [calories] cal, [protein]g protein, [carbs]g carbs, [fat]g fat

Example: **Total per serving:** 650 cal, 35g protein, 48g carbs, 22g fat

Without accurate nutrition data, the recipe cannot be saved. This is MANDATORY.`;

    console.log('=== DEBUG: Full prompt sent to AI ===');
    console.log('Goal context:', goalContext);
    console.log('Final meal prompt:', mealPrompt);
    console.log('=== End DEBUG ===');

    // Generate recipe with validation
    const parsedRecipe = await this.generateRecipeWithValidation(mealPrompt);

    // Create recipe in database
    const recipe = await this.chatRepository.createRecipe({
      title: parsedRecipe.title,
      content_json: parsedRecipe.content_json,
      nutrition: parsedRecipe.nutrition,
      tags: parsedRecipe.tags,
    });

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
  }

  /**
   * Generate recipe with validation and retry logic
   */
  private async generateRecipeWithValidation(
    mealPrompt: string,
    attemptCount = 0,
  ): Promise<any> {
    const timeoutMs = 25000; // 25 second timeout
    const maxAttempts = 3; // Allow 3 total attempts

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });

    try {
      const chat = this.ai.chats.create({
        model: GEMINI_MODEL,
        history: [],
        config: {
          systemInstruction: geminiCookAssistantPrompt,
        },
      });

      const aiPromise = chat.sendMessage({
        message: mealPrompt,
      });

      const response = (await Promise.race([aiPromise, timeoutPromise])) as any;
      const text = response.text;

      if (!text || text.trim().length === 0) {
        throw new Error('AI service returned empty response');
      }

      // Parse the AI response to extract recipe components
      const parsedRecipe = parseRecipeFromAI(text);

      // Validate nutrition data exists and has all required fields
      const nutrition = parsedRecipe.nutrition;
      if (
        !nutrition ||
        typeof nutrition.calories !== 'number' ||
        nutrition.calories <= 0 ||
        typeof nutrition.protein !== 'number' ||
        typeof nutrition.carbs !== 'number' ||
        typeof nutrition.fat !== 'number'
      ) {
        console.warn(
          `Attempt ${attemptCount + 1}: Missing or invalid nutrition data:`,
          nutrition,
        );

        if (attemptCount < maxAttempts - 1) {
          console.log(
            `Retrying recipe generation due to missing nutrition (attempt ${attemptCount + 2}/${maxAttempts})...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
          return this.generateRecipeWithValidation(mealPrompt, attemptCount + 1);
        } else {
          throw new Error(
            'Failed to generate recipe with valid nutrition data after multiple attempts',
          );
        }
      }

      console.log(
        `Successfully parsed recipe with nutrition: ${nutrition.calories} cal`,
      );
      return parsedRecipe;
    } catch (error) {
      console.warn(`Recipe generation attempt ${attemptCount + 1} failed:`, error);

      if (
        attemptCount < maxAttempts - 1 &&
        error instanceof Error &&
        (error.message === 'Request timeout' ||
          (error as any).code === 'DEADLINE_EXCEEDED')
      ) {
        console.log(
          `Retrying due to timeout (attempt ${attemptCount + 2}/${maxAttempts})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        return this.generateRecipeWithValidation(mealPrompt, attemptCount + 1);
      }

      throw error;
    }
  }

  /**
   * Transcribe audio to text using Gemini
   */
  async transcribeAudio(
    audio: Express.Multer.File,
  ): Promise<{ text: string }> {
    if (!audio) {
      throw new HttpException('Audio file is required', HttpStatus.BAD_REQUEST);
    }

    // Check file size (20MB limit for inline audio)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (audio.size > maxSize) {
      throw new HttpException(
        'Audio file is too large (max 20MB)',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate MIME type
    const allowedMimeTypes = [
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/aiff',
      'audio/aac',
      'audio/ogg',
      'audio/flac',
    ];

    if (!allowedMimeTypes.includes(audio.mimetype)) {
      throw new HttpException(
        `Unsupported audio format: ${audio.mimetype}. Supported formats: WAV, MP3, WEBM, AIFF, AAC, OGG, FLAC`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Convert buffer to base64
    const base64Audio = audio.buffer.toString('base64');

    // Determine MIME type
    let mimeType = audio.mimetype;
    if (mimeType === 'audio/webm') {
      mimeType = 'audio/webm';
    }

    try {
      // Use Gemini to transcribe audio
      const response = await this.ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          'Transcribe the speech in this audio file. Automatically detect the language (English, French, or any other language) and transcribe it accurately in that language. Return ONLY the transcribed text without any additional commentary, translation, or formatting. Keep the original language of the speech.',
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
        ],
      });

      const transcribedText = response.text?.trim() || '';

      if (!transcribedText) {
        throw new Error('No transcription returned from AI');
      }

      return { text: transcribedText };
    } catch (aiError) {
      console.error('AI transcription error:', aiError);
      throw new HttpException(
        'Speech transcription service is temporarily unavailable. Please try again.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
