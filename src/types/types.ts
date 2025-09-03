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

interface ChatItem {
  id: string;
  title: string;
  //lastMessage: string;
  timestamp: Date;
}

export type HistoryActionPayload =
  | { type: "rename"; chatId: string; title: string }
  | { type: "delete"; chatId: string }
  | { type: "share"; chatId: string };
