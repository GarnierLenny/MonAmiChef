export interface Preferences {
  mealType: string[];
  mealOccasion: string[];
  cookingEquipment: string[];
  cookingTime: string[];
  skillLevel: string[];
  nutrition: string[];
  cuisine: string[];
  spiceLevel: string[];
  meat: string[];
  vegetables: string[];
  servings: number | null;
  cooks: number | null;
}

export interface ChatItem {
  id: string;
  title: string;
  //lastMessage: string;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  role: "user" | "model";
  timestamp: Date;
}

export type HistoryActionPayload =
  | { type: "rename"; chatId: string; title: string }
  | { type: "delete"; chatId: string }
  | { type: "share"; chatId: string };
