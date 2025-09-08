import { Prisma } from "@prisma/client";

export interface Preferences {
  mealType?: string[];
  mealOccasion?: string[];
  cookingEquipment?: string[];
  cookingTime?: string[];
  skillLevel?: string[];
  nutrition?: string[];
  cuisine?: string[];
  spiceLevel?: string[];
  meat?: string[];
  vegetables?: string[];
  servings?: number | null;
}

export interface ChatResponse {
  reply: string;
  conversationId: string | null;
}

export interface ChatRequest {
  userMessage: string;
  preferences: Preferences;
}

export interface UserModelMessage {
  role: "user" | "model";
  parts: {
    text: string;
  }[];
}

export interface RenameChatRequest {
  newTitle: string;
}

