import { Preferences } from "../types/ChatTypes";

export function buildPreferenceSummary(prefs: Preferences) {
  const summaries = [];

  // Categorical preferences
  const categoricalFields = [
    "mealType",
    "mealOccasion",
    "cookingEquipment",
    "cookingTime",
    "skillLevel",
    "nutrition",
    "cuisine",
    "spiceLevel",
    "meat",
    "vegetables",
  ];
  categoricalFields.forEach((field) => {
    const value = prefs[field as keyof Preferences];
    if (Array.isArray(value) && value.length > 0) {
      const label = field.replace(/([A-Z])/g, " $1").toLowerCase();
      summaries.push(`for ${label}: ${value.join(", ")}`);
    }
  });

  // Numeric preferences
  if (prefs.servings !== null) {
    summaries.push(`for ${prefs.servings} serving(s)`);
  }

  return summaries.length > 0
    ? `I have the following preferences: ${summaries.join(", ")}.`
    : "";
}
