// Constants and types for meal planning
export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const MEAL_SLOTS = ["breakfast", "lunch", "dinner"] as const;

export type MealSlot = (typeof MEAL_SLOTS)[number];

export interface Meal {
  id: string;
  title: string;
  image: string;
  description: string;
  servings: number;
  cookingTime: number;
  calories: number;
  grade: "A" | "B" | "C" | "D";
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface MealPlan {
  [day: string]: {
    [K in MealSlot]?: Meal;
  };
}

// Daily nutrition goals
export const DAILY_GOALS = {
  calories: 2000,
  protein: 150, // grams
  carbs: 250, // grams
  fat: 65, // grams
};

// Fake meal data for development
export const FAKE_MEALS = {
  breakfast: [
    {
      id: "b1",
      title: "Overnight Oats with Berries & Nuts",
      image: "🥣",
      description: "Steel-cut oats with fresh berries and almonds",
      servings: 1,
      cookingTime: 20,
      calories: 320,
      grade: "A" as const,
      macros: { protein: 20, carbs: 45, fat: 10 },
    },
    {
      id: "b2",
      title: "Greek Yogurt Bowl",
      image: "🥣",
      description: "Greek yogurt with berries and granola",
      servings: 1,
      cookingTime: 5,
      calories: 280,
      grade: "A" as const,
      macros: { protein: 18, carbs: 35, fat: 8 },
    },
    {
      id: "b3",
      title: "Avocado Toast with Eggs",
      image: "🥑",
      description: "Whole grain toast with fresh avocado and poached eggs",
      servings: 1,
      cookingTime: 15,
      calories: 420,
      grade: "B" as const,
      macros: { protein: 22, carbs: 28, fat: 18 },
    },
    {
      id: "b4",
      title: "Scrambled Eggs with Herbs",
      image: "🍳",
      description: "Fluffy scrambled eggs with fresh herbs",
      servings: 1,
      cookingTime: 10,
      calories: 250,
      grade: "A" as const,
      macros: { protein: 20, carbs: 5, fat: 15 },
    },
    {
      id: "b5",
      title: "Smoothie Bowl",
      image: "🥤",
      description: "Tropical smoothie bowl with coconut toppings",
      servings: 1,
      cookingTime: 8,
      calories: 350,
      grade: "B" as const,
      macros: { protein: 12, carbs: 55, fat: 12 },
    },
  ],
  lunch: [
    {
      id: "l1",
      title: "Mediterranean Quinoa Bowl",
      image: "🥗",
      description: "Quinoa with fresh vegetables and feta",
      servings: 1,
      cookingTime: 25,
      calories: 450,
      grade: "A" as const,
      macros: { protein: 18, carbs: 52, fat: 16 },
    },
    {
      id: "l2",
      title: "Grilled Chicken Wrap",
      image: "🌯",
      description: "Lean chicken with fresh vegetables in whole wheat wrap",
      servings: 1,
      cookingTime: 15,
      calories: 380,
      grade: "A" as const,
      macros: { protein: 32, carbs: 35, fat: 12 },
    },
    {
      id: "l3",
      title: "Asian Buddha Bowl",
      image: "🍲",
      description: "Brown rice with tofu and mixed vegetables",
      servings: 1,
      cookingTime: 30,
      calories: 420,
      grade: "A" as const,
      macros: { protein: 22, carbs: 48, fat: 14 },
    },
    {
      id: "l4",
      title: "Turkey & Avocado Sandwich",
      image: "🥪",
      description: "Lean turkey with avocado on whole grain bread",
      servings: 1,
      cookingTime: 10,
      calories: 390,
      grade: "B" as const,
      macros: { protein: 28, carbs: 32, fat: 16 },
    },
    {
      id: "l5",
      title: "Mediterranean Pasta Salad",
      image: "🍝",
      description: "Whole wheat pasta with olives and vegetables",
      servings: 1,
      cookingTime: 20,
      calories: 410,
      grade: "B" as const,
      macros: { protein: 15, carbs: 58, fat: 14 },
    },
  ],
  dinner: [
    {
      id: "d1",
      title: "Grilled Salmon with Vegetables",
      image: "🐟",
      description: "Atlantic salmon with roasted seasonal vegetables",
      servings: 1,
      cookingTime: 35,
      calories: 520,
      grade: "A" as const,
      macros: { protein: 42, carbs: 18, fat: 28 },
    },
    {
      id: "d2",
      title: "Chicken Stir Fry",
      image: "🍜",
      description: "Lean chicken with mixed vegetables and brown rice",
      servings: 1,
      cookingTime: 25,
      calories: 480,
      grade: "A" as const,
      macros: { protein: 38, carbs: 45, fat: 15 },
    },
    {
      id: "d3",
      title: "Lean Beef Tacos",
      image: "🌮",
      description: "Grass-fed beef with fresh toppings in corn tortillas",
      servings: 2,
      cookingTime: 20,
      calories: 650,
      grade: "B" as const,
      macros: { protein: 35, carbs: 48, fat: 22 },
    },
    {
      id: "d4",
      title: "Vegetable Curry with Rice",
      image: "🍛",
      description: "Coconut curry with mixed vegetables and brown rice",
      servings: 1,
      cookingTime: 40,
      calories: 420,
      grade: "A" as const,
      macros: { protein: 16, carbs: 62, fat: 12 },
    },
    {
      id: "d5",
      title: "Margherita Pizza",
      image: "🍕",
      description: "Homemade thin crust with fresh mozzarella and basil",
      servings: 2,
      cookingTime: 45,
      calories: 780,
      grade: "C" as const,
      macros: { protein: 28, carbs: 85, fat: 32 },
    },
  ],
};