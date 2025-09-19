import type { MealSlot } from "@/components/meal-plan/constants";
import { MEAL_SLOTS } from "@/components/meal-plan/constants";

/**
 * Parse user input to determine which meal slots they want to modify
 * Returns an array of MealSlot types or all slots if none specified
 */
export function parseMealSlots(userInput: string): MealSlot[] {
  const input = userInput.toLowerCase();
  const targetSlots: Set<MealSlot> = new Set();

  console.log('=== PARSING MEAL SLOTS ===');
  console.log('Input:', userInput);
  console.log('Lowercase input:', input);

  // Direct meal slot keywords
  const mealKeywords: Record<string, MealSlot> = {
    // Direct matches
    breakfast: 'breakfast',
    lunch: 'lunch',
    dinner: 'dinner',

    // Time-based variations
    morning: 'breakfast',
    noon: 'lunch',
    evening: 'dinner',
    night: 'dinner',

    // Informal variations
    'break fast': 'breakfast',
    'break-fast': 'breakfast',
    brunch: 'lunch', // Could be breakfast or lunch, defaulting to lunch
    supper: 'dinner',
  };

  // Check for direct keyword matches
  for (const [keyword, mealSlot] of Object.entries(mealKeywords)) {
    if (input.includes(keyword)) {
      console.log(`Found keyword "${keyword}" -> ${mealSlot}`);
      targetSlots.add(mealSlot);
    }
  }

  // Handle phrases that indicate meal times
  const timePatterns: Array<{ pattern: RegExp; slot: MealSlot }> = [
    { pattern: /\b(in the )?morning\b/i, slot: 'breakfast' },
    { pattern: /\b(at|for) breakfast\b/i, slot: 'breakfast' },
    { pattern: /\bfirst meal\b/i, slot: 'breakfast' },

    { pattern: /\b(at|for) lunch\b/i, slot: 'lunch' },
    { pattern: /\bmid ?day\b/i, slot: 'lunch' },
    { pattern: /\bnoon time?\b/i, slot: 'lunch' },

    { pattern: /\b(at|for) dinner\b/i, slot: 'dinner' },
    { pattern: /\b(in the )?evening\b/i, slot: 'dinner' },
    { pattern: /\b(at )?night\b/i, slot: 'dinner' },
    { pattern: /\blast meal\b/i, slot: 'dinner' },
  ];

  for (const { pattern, slot } of timePatterns) {
    if (pattern.test(input)) {
      targetSlots.add(slot);
    }
  }

  // Handle multiple meals mentioned with conjunctions
  const conjunctionPatterns = [
    /\b(breakfast|morning)\s+(and|&|\+)\s+(lunch|noon|midday)/i,
    /\b(lunch|noon|midday)\s+(and|&|\+)\s+(dinner|evening|night)/i,
    /\b(breakfast|morning)\s+(and|&|\+)\s+(dinner|evening|night)/i,
  ];

  conjunctionPatterns.forEach(pattern => {
    const match = input.match(pattern);
    if (match) {
      const fullMatch = match[0].toLowerCase();
      // Re-parse the matched portion to extract both meals
      for (const [keyword, mealSlot] of Object.entries(mealKeywords)) {
        if (fullMatch.includes(keyword)) {
          targetSlots.add(mealSlot);
        }
      }
    }
  });

  // Convert Set to Array
  const result = Array.from(targetSlots);

  console.log('Parsed slots:', result);

  // More conservative fallback: if no specific meal slots were identified,
  // only target all slots if the input seems very general (no specific food mentioned)
  if (result.length === 0) {
    // Check if input seems like a general meal plan request
    const generalPhrases = /\b(meal plan|menu|all meals|everything|today|week)\b/i;
    const hasSpecificFood = /\b(chicken|beef|fish|pasta|rice|eggs|salad|soup|pizza|burger|sandwich)\b/i;

    if (generalPhrases.test(userInput) || !hasSpecificFood.test(userInput)) {
      console.log('No specific slots found, defaulting to all slots');
      return [...MEAL_SLOTS];
    } else {
      // User mentioned specific food but no meal time - be more conservative
      // Try to infer from common patterns or ask for clarification
      console.log('Specific food mentioned but no meal time - defaulting to lunch');
      return ['lunch']; // Most common meal for specific food requests
    }
  }

  return result;
}

/**
 * Generate examples for the UI to help users understand the format
 */
export const MEAL_SLOT_EXAMPLES = [
  "I want pasta for lunch",
  "Something healthy for breakfast",
  "Indian food for dinner",
  "Light breakfast and lunch",
  "More protein in the morning",
  "Vegetarian dinner tonight",
] as const;

/**
 * Check if input specifies any meal slots
 */
export function hasSpecificMealSlots(userInput: string): boolean {
  const parsed = parseMealSlots(userInput);
  return parsed.length < MEAL_SLOTS.length;
}

/**
 * Get a human-readable description of which slots will be affected
 */
export function describeMealSlots(slots: MealSlot[]): string {
  if (slots.length === MEAL_SLOTS.length) {
    return "all meals";
  }

  if (slots.length === 1) {
    return slots[0];
  }

  if (slots.length === 2) {
    return `${slots[0]} and ${slots[1]}`;
  }

  return slots.slice(0, -1).join(", ") + `, and ${slots[slots.length - 1]}`;
}