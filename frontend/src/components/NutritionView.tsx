import React from "react";
import {
  Target,
  Zap,
  FileText,
  Mail,
  Download,
  Clock,
  Calculator,
  Weight,
  Bookmark,
  Eye,
  Users,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { healthApi } from "../lib/api/healthApi";
import type { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface BMIData {
  age: number;
  height: number;
  weight: number;
  gender: "male" | "female";
  activityLevel: string;
  heightUnit: "cm" | "ft";
  weightUnit: "kg" | "lbs";
}

interface NutritionViewProps {
  currentSubView: string;
  recipe?: any;
  session?: Session | null;
  user?: any;
}

export default function NutritionView({
  currentSubView,
  session,
  user,
}: NutritionViewProps) {
  const [bmiData, setBmiData] = React.useState<BMIData>({
    age: 25,
    height: 170,
    weight: 70,
    gender: "male",
    activityLevel: "moderate",
    heightUnit: "cm",
    weightUnit: "kg",
  });

  const [calculatedData, setCalculatedData] = React.useState<{
    bmi: number;
    bmr: number;
    dailyCalories: number;
    bmiCategory: string;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  } | null>(null);

  const [settingGoal, setSettingGoal] = React.useState<string | null>(null);
  const { toast } = useToast();
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const activityLevels = [
    {
      id: "sedentary",
      label: "Sedentary",
      description: "Little to no exercise",
      multiplier: 1.2,
    },
    {
      id: "light",
      label: "Lightly Active",
      description: "Light exercise 1-3 days/week",
      multiplier: 1.375,
    },
    {
      id: "moderate",
      label: "Moderately Active",
      description: "Moderate exercise 3-5 days/week",
      multiplier: 1.55,
    },
    {
      id: "very",
      label: "Very Active",
      description: "Hard exercise 6-7 days/week",
      multiplier: 1.725,
    },
    {
      id: "extra",
      label: "Extra Active",
      description: "Very hard exercise, physical job",
      multiplier: 1.9,
    },
  ];

  const convertHeight = (height: number, unit: "cm" | "ft") => {
    return unit === "cm" ? height : height * 30.48; // Convert feet to cm
  };

  const convertWeight = (weight: number, unit: "kg" | "lbs") => {
    return unit === "kg" ? weight : weight * 0.453592; // Convert lbs to kg
  };

  const formatHeight = (heightInCm: number, unit: "cm" | "ft") => {
    if (unit === "cm") {
      return `${Math.round(heightInCm)} cm`;
    } else {
      const feet = Math.floor(heightInCm / 30.48);
      const inches = Math.round((heightInCm / 30.48 - feet) * 12);
      return `${feet}'${inches}"`;
    }
  };

  const formatWeight = (weightInKg: number, unit: "kg" | "lbs") => {
    if (unit === "kg") {
      return `${Math.round(weightInKg * 10) / 10} kg`;
    } else {
      return `${Math.round(weightInKg * 2.20462 * 10) / 10} lbs`;
    }
  };

  const calculateBMI = () => {
    const heightInCm = convertHeight(bmiData.height, bmiData.heightUnit);
    const weightInKg = convertWeight(bmiData.weight, bmiData.weightUnit);
    const heightInM = heightInCm / 100;

    const bmi = weightInKg / (heightInM * heightInM);

    let bmiCategory = "";
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi < 25) bmiCategory = "Normal weight";
    else if (bmi < 30) bmiCategory = "Overweight";
    else bmiCategory = "Obese";

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (bmiData.gender === "male") {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * bmiData.age + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * bmiData.age - 161;
    }

    const activityMultiplier =
      activityLevels.find((level) => level.id === bmiData.activityLevel)
        ?.multiplier || 1.55;
    const dailyCalories = bmr * activityMultiplier;

    // Calculate recommended macros (protein: 25%, carbs: 45%, fat: 30%)
    const proteinCalories = dailyCalories * 0.25;
    const carbCalories = dailyCalories * 0.45;
    const fatCalories = dailyCalories * 0.3;

    const macros = {
      protein: Math.round(proteinCalories / 4), // 4 calories per gram of protein
      carbs: Math.round(carbCalories / 4), // 4 calories per gram of carbs
      fat: Math.round(fatCalories / 9), // 9 calories per gram of fat
    };
    setCalculatedData({
      bmi: Math.round(bmi * 10) / 10,
      bmr: Math.round(bmr),
      dailyCalories: Math.round(dailyCalories),
      bmiCategory,
      macros,
    });

    // Scroll to results after a short delay to allow state update
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleInputChange = (field: keyof BMIData, value: any) => {
    setBmiData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper function to calculate macros for a given calorie target
  const calculateMacrosForCalories = (calories: number) => {
    const protein = Math.round((calories * 0.25) / 4); // 25% of calories, 4 cal/gram
    const carbs = Math.round((calories * 0.45) / 4); // 45% of calories, 4 cal/gram
    const fat = Math.round((calories * 0.3) / 9); // 30% of calories, 9 cal/gram
    const fiber = Math.round((calories / 1000) * 14); // 14g per 1000 calories

    return { protein, carbs, fat, fiber };
  };

  // Function to set calorie and macro goals
  const setAsGoal = async (goalType: string, calories: number) => {
    if (!session) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to set your goals.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Registration Required",
        description: "Please create an account to set your nutrition goals.",
        variant: "destructive",
      });
      return;
    }

    setSettingGoal(goalType);

    try {
      const macros = calculateMacrosForCalories(calories);

      await healthApi.updateGoals({
        daily_calories_goal: calories,
        daily_protein_goal: macros.protein,
        daily_carbs_goal: macros.carbs,
        daily_fat_goal: macros.fat,
      });

      toast({
        title: "Goals Updated Successfully!",
        description: `Your daily calorie goal has been set to ${calories} calories with recommended macros.`,
      });
    } catch (error) {
      console.error("Failed to update goals:", error);

      // Provide more specific error messages based on the error type
      let title = "Failed to Update Goals";
      let description = "Please try again later.";

      if (error instanceof Error) {
        if (
          error.message.includes("401") ||
          error.message.includes("unauthorized")
        ) {
          title = "Authentication Error";
          description = "Please sign in again to set your goals.";
        } else if (
          error.message.includes("403") ||
          error.message.includes("forbidden")
        ) {
          title = "Permission Denied";
          description =
            "You don't have permission to update goals. Please make sure you're signed in as a registered user.";
        } else if (
          error.message.includes("400") ||
          error.message.includes("validation")
        ) {
          title = "Invalid Data";
          description =
            "The goal values are invalid. Please try different values.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          title = "Network Error";
          description = "Please check your internet connection and try again.";
        }
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    } finally {
      setSettingGoal(null);
    }
  };

  // Helper function to determine button state and text
  const getButtonState = () => {
    if (!session) {
      return { show: false, text: "", disabled: true };
    }
    if (!user) {
      return { show: true, text: "Sign Up to Set Goals", disabled: false };
    }
    return { show: true, text: "Set as Goal", disabled: false };
  };

  const renderSavedRecipesList = () => {
    // Get saved recipes from localStorage
    const getSavedRecipes = () => {
      try {
        // Add some dummy data for demonstration
        const dummyRecipes = [
          {
            id: "dummy-1",
            title: "Mediterranean Quinoa Bowl",
            ingredients: [
              "quinoa",
              "cherry tomatoes",
              "cucumber",
              "feta cheese",
              "olive oil",
              "lemon juice",
            ],
            instructions: [
              "Cook quinoa according to package directions",
              "Chop vegetables",
              "Mix everything together",
              "Drizzle with olive oil and lemon",
            ],
            prepTime: 15,
            cookTime: 20,
            servings: 4,
            nutrition: {
              calories: 320,
              protein: 12,
              carbs: 45,
              fat: 8,
              fiber: 6,
            },
            createdAt: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 2 days ago
          },
          {
            id: "dummy-2",
            title: "Spicy Korean BBQ Tacos",
            ingredients: [
              "beef bulgogi",
              "corn tortillas",
              "kimchi",
              "sriracha mayo",
              "green onions",
              "sesame seeds",
            ],
            instructions: [
              "Marinate beef in bulgogi sauce",
              "Grill beef until caramelized",
              "Warm tortillas",
              "Assemble tacos with toppings",
            ],
            prepTime: 25,
            cookTime: 15,
            servings: 6,
            nutrition: {
              calories: 285,
              protein: 18,
              carbs: 22,
              fat: 12,
              fiber: 3,
            },
            createdAt: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 5 days ago
          },
          {
            id: "dummy-3",
            title: "Creamy Mushroom Risotto",
            ingredients: [
              "arborio rice",
              "mixed mushrooms",
              "vegetable broth",
              "white wine",
              "parmesan cheese",
              "butter",
            ],
            instructions: [
              "Sauté mushrooms until golden",
              "Toast rice with onions",
              "Add wine and broth gradually",
              "Stir in cheese and butter",
            ],
            prepTime: 10,
            cookTime: 35,
            servings: 4,
            nutrition: {
              calories: 380,
              protein: 14,
              carbs: 52,
              fat: 16,
              fiber: 4,
            },
            createdAt: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 1 week ago
          },
          {
            id: "dummy-4",
            title: "Thai Green Curry with Chicken",
            ingredients: [
              "chicken breast",
              "green curry paste",
              "coconut milk",
              "thai basil",
              "bell peppers",
              "jasmine rice",
            ],
            instructions: [
              "Cut chicken into bite-sized pieces",
              "Fry curry paste until fragrant",
              "Add coconut milk and chicken",
              "Simmer with vegetables and basil",
            ],
            prepTime: 20,
            cookTime: 25,
            servings: 5,
            nutrition: {
              calories: 420,
              protein: 28,
              carbs: 35,
              fat: 18,
              fiber: 5,
            },
            createdAt: new Date(
              Date.now() - 10 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 10 days ago
          },
          {
            id: "dummy-5",
            title: "Classic Caesar Salad",
            ingredients: [
              "romaine lettuce",
              "parmesan cheese",
              "croutons",
              "caesar dressing",
              "anchovies",
              "lemon",
            ],
            instructions: [
              "Wash and chop romaine lettuce",
              "Make caesar dressing from scratch",
              "Toss lettuce with dressing",
              "Top with croutons and parmesan",
            ],
            prepTime: 15,
            cookTime: 0,
            servings: 3,
            nutrition: {
              calories: 180,
              protein: 8,
              carbs: 12,
              fat: 14,
              fiber: 4,
            },
            createdAt: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 2 weeks ago
          },
        ];

        // Store dummy recipes in localStorage if they don't exist
        dummyRecipes.forEach((recipe) => {
          const key = `recipe-${recipe.id}`;
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(recipe));
          }
        });

        const keys = Object.keys(localStorage).filter((key) =>
          key.startsWith("recipe-"),
        );
        const recipes = keys
          .map((key) => {
            try {
              return JSON.parse(localStorage.getItem(key) || "{}");
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        // Sort by creation date (newest first)
        return recipes.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      } catch {
        return [];
      }
    };

    const savedRecipes = getSavedRecipes();

    const removeRecipe = (recipeId: string) => {
      try {
        localStorage.removeItem(`recipe-${recipeId}`);
        // Force re-render by updating a state or triggering parent re-render
        window.location.reload();
      } catch (error) {
        console.error("Failed to remove recipe:", error);
      }
    };

    const openRecipe = (recipeId: string) => {
      window.open(`/recipe/${recipeId}`, "_blank");
    };

    if (savedRecipes.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-orange-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl">
              <Bookmark className="w-12 h-12 text-orange-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No Saved Recipes Yet
          </h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
            You haven't saved any recipes yet — start by saving one in chat!
          </p>
          <div className="mt-8">
            <button
              onClick={() => (window.location.href = "/")}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
            >
              🍳 Start Cooking
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-lg">
                <Bookmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Your Saved Recipes
                </h3>
                <p className="text-gray-600 text-sm">
                  {savedRecipes.length} recipe
                  {savedRecipes.length !== 1 ? "s" : ""} saved
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
              >
                {/* Left side - Recipe info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-4">
                    {/* Recipe title and basic info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-orange-700 transition-colors">
                        {recipe.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">
                            {(recipe.prepTime || 0) + (recipe.cookTime || 0)}{" "}
                            min
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Zap className="w-4 h-4 text-green-500" />
                          <span className="font-medium">
                            {recipe.nutrition?.calories || 0} cal
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">
                            Serves {recipe.servings || 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Macros section */}
                    <div className="hidden md:flex items-center space-x-3">
                      <div className="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-medium text-red-700">
                          {recipe.nutrition?.protein || 0}g protein
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-green-700">
                          {recipe.nutrition?.carbs || 0}g carbs
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs font-medium text-yellow-700">
                          {recipe.nutrition?.fat || 0}g fat
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-xs font-medium text-purple-700">
                          {recipe.nutrition?.fiber || 0}g fiber
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile macros - shown on smaller screens */}
                  <div className="md:hidden mt-3 flex flex-wrap gap-2">
                    <div className="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs font-medium text-red-700">
                        {recipe.nutrition?.protein || 0}g protein
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700">
                        {recipe.nutrition?.carbs || 0}g carbs
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs font-medium text-yellow-700">
                        {recipe.nutrition?.fat || 0}g fat
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-xs font-medium text-purple-700">
                        {recipe.nutrition?.fiber || 0}g fiber
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Action buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openRecipe(recipe.id)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-200 hover:scale-105"
                    title="View recipe"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecipe(recipe.id);
                    }}
                    className="p-2 bg-orange-100 hover:bg-red-100 text-orange-600 hover:text-red-600 rounded-lg transition-all duration-200 hover:scale-105"
                    title="Remove from saved recipes"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBMICalculator = () => (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-orange-50 to-amber-50">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="w-full p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 lg:space-y-10">
          {/* Header Section */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-orange-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-0.5">
                  Calorie Calculator
                </h1>
                <p className="text-neutral-500 text-xs sm:text-sm">
                  Calculate your personalized daily calorie needs
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-orange-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              Personal Information
            </h3>

            {/* Measurement System */}
            <div className="mb-8">
              <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-4">
                Measurement System
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    handleInputChange("heightUnit", "cm");
                    handleInputChange("weightUnit", "kg");
                  }}
                  className={`py-4 px-6 text-base font-semibold rounded-xl transition-all duration-200 ${
                    bmiData.heightUnit === "cm" && bmiData.weightUnit === "kg"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                      : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  Metric (kg/cm)
                </button>
                <button
                  onClick={() => {
                    handleInputChange("heightUnit", "ft");
                    handleInputChange("weightUnit", "lbs");
                  }}
                  className={`py-4 px-6 text-base font-semibold rounded-xl transition-all duration-200 ${
                    bmiData.heightUnit === "ft" && bmiData.weightUnit === "lbs"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                      : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  Imperial (lbs/ft)
                </button>
              </div>
            </div>

            {/* Age and Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-3">
                  Age <span className="text-neutral-400 font-normal">(years)</span>
                </label>
                <input
                  type="number"
                  value={bmiData.age}
                  onChange={(e) =>
                    handleInputChange("age", Number(e.target.value))
                  }
                  className="w-full h-14 px-5 text-lg font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  min="10"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-3">
                  Gender
                </label>
                <select
                  value={bmiData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full h-14 px-5 text-lg font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {/* Height and Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-3">
                  Height <span className="text-neutral-400 font-normal">({bmiData.heightUnit})</span>
                </label>
                <input
                  type="number"
                  value={bmiData.height}
                  onChange={(e) =>
                    handleInputChange("height", Number(e.target.value))
                  }
                  className="w-full h-14 px-5 text-lg font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-3">
                  Weight <span className="text-neutral-400 font-normal">({bmiData.weightUnit})</span>
                </label>
                <input
                  type="number"
                  value={bmiData.weight}
                  onChange={(e) =>
                    handleInputChange("weight", Number(e.target.value))
                  }
                  className="w-full h-14 px-5 text-lg font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Activity Level Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-md border border-orange-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              Activity Level
            </h3>
            <div className="space-y-4">
              {activityLevels.map((level) => (
                <label
                  key={level.id}
                  className={`flex items-start p-5 sm:p-6 rounded-xl cursor-pointer transition-all duration-200 ${
                    bmiData.activityLevel === level.id
                      ? "bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 shadow-sm"
                      : "bg-gray-50 border-2 border-gray-200 hover:border-orange-200 hover:bg-orange-50/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value={level.id}
                    checked={bmiData.activityLevel === level.id}
                    onChange={(e) =>
                      handleInputChange("activityLevel", e.target.value)
                    }
                    className="mt-1 mr-4 w-5 h-5 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-base sm:text-lg text-gray-900">{level.label}</div>
                    <div className="text-sm sm:text-base text-gray-600 mt-1.5">
                      {level.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateBMI}
            className="w-full h-16 sm:h-18 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg sm:text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <Calculator className="w-6 h-6" />
            Calculate My Calories
          </button>

          {/* Results Section */}
          {calculatedData && (
            <div
              ref={resultsRef}
              className="w-full space-y-8 lg:space-y-10"
            >
              {/* Results Header */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-md border border-green-100">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Your Personalized Results
                  </h2>
                </div>
                <p className="text-neutral-500 text-sm sm:text-base ml-[4.5rem]">
                  Based on your information and activity level
                </p>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                <div className="bg-gradient-to-br from-orange-100 to-pink-100 p-6 sm:p-8 rounded-2xl text-center border-2 border-orange-200 shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="text-4xl sm:text-5xl font-bold text-orange-600 mb-3">
                    {calculatedData.bmi}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                    BMI Score
                  </div>
                  <div className="text-sm sm:text-base text-gray-700 font-medium mb-3">
                    {calculatedData.bmiCategory}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 pt-3 border-t border-orange-200">
                    {formatHeight(
                      convertHeight(bmiData.height, bmiData.heightUnit),
                      bmiData.heightUnit,
                    )}{" "}
                    •{" "}
                    {formatWeight(
                      convertWeight(bmiData.weight, bmiData.weightUnit),
                      bmiData.weightUnit,
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 sm:p-8 rounded-2xl text-center border-2 border-blue-200 shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-3">
                    {calculatedData.bmr}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                    BMR
                  </div>
                  <div className="text-sm sm:text-base text-gray-700 font-medium mb-3">
                    Calories at rest
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 pt-3 border-t border-blue-200">
                    {bmiData.gender === "male" ? "Male" : "Female"} • {bmiData.age}{" "}
                    years
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 sm:p-8 rounded-2xl text-center border-2 border-green-200 shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-3">
                    {calculatedData.dailyCalories}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                    Daily Calories
                  </div>
                  <div className="text-sm sm:text-base text-gray-700 font-medium mb-3">
                    To maintain weight
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 pt-3 border-t border-green-200">
                    {
                      activityLevels.find(
                        (level) => level.id === bmiData.activityLevel,
                      )?.label
                    }
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 sm:p-8 rounded-2xl border-2 border-purple-200 shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="text-base sm:text-lg font-bold text-gray-800 mb-4">
                    Weight Goals
                  </div>
                  <div className="space-y-3 text-sm sm:text-base text-gray-700">
                    <div className="flex justify-between items-center">
                      <span>Lose 1 lb/week:</span>
                      <span className="font-bold text-red-600">
                        {calculatedData.dailyCalories - 500}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Gain 1 lb/week:</span>
                      <span className="font-bold text-blue-600">
                        {calculatedData.dailyCalories + 500}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Macro Recommendations */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-md border border-green-100">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Recommended Daily Macros
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-6">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base sm:text-lg font-bold text-gray-800">
                        Protein
                      </span>
                      <span className="text-sm sm:text-base text-gray-500 bg-white px-3 py-1 rounded-full font-semibold">
                        25%
                      </span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">
                      {calculatedData.macros.protein}g
                    </div>
                    <div className="text-sm sm:text-base text-gray-600">
                      {Math.round(calculatedData.macros.protein * 4)} calories
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base sm:text-lg font-bold text-gray-800">
                        Carbohydrates
                      </span>
                      <span className="text-sm sm:text-base text-gray-500 bg-white px-3 py-1 rounded-full font-semibold">
                        45%
                      </span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                      {calculatedData.macros.carbs}g
                    </div>
                    <div className="text-sm sm:text-base text-gray-600">
                      {Math.round(calculatedData.macros.carbs * 4)} calories
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base sm:text-lg font-bold text-gray-800">
                        Fats
                      </span>
                      <span className="text-sm sm:text-base text-gray-500 bg-white px-3 py-1 rounded-full font-semibold">
                        30%
                      </span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-amber-600 mb-2">
                      {calculatedData.macros.fat}g
                    </div>
                    <div className="text-sm sm:text-base text-gray-600">
                      {Math.round(calculatedData.macros.fat * 9)} calories
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 sm:p-6 rounded-xl border border-blue-200">
                  <p className="text-sm sm:text-base text-blue-900 leading-relaxed">
                    <strong className="font-bold">Tip:</strong> These macros are based on a balanced diet
                    approach (25% protein, 45% carbs, 30% fat). Adjust based on your
                    specific goals and dietary preferences.
                  </p>
                </div>
              </div>

              {/* Weight Goals Section */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200 mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Weight className="w-5 h-5 mr-2 text-purple-600" />
              Weight Goals & Calorie Targets (
              {bmiData.weightUnit === "kg" ? "kg" : "lbs"})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Aggressive Weight Loss */}
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-red-700">
                    Aggressive Loss
                  </span>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    -{bmiData.weightUnit === "kg" ? "0.9 kg" : "2 lbs"}/week
                  </span>
                </div>
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {calculatedData.dailyCalories - 1000}
                </div>
                <div className="text-xs text-gray-600 mb-2">calories/day</div>
                <div className="text-xs text-red-600 mb-3">
                  <strong>Deficit:</strong> -1000 cal/day
                </div>

                {/* Macros */}
                {(() => {
                  const macros = calculateMacrosForCalories(
                    calculatedData.dailyCalories - 1000,
                  );
                  return (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Protein:</span>
                        <span className="font-medium">{macros.protein}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Carbs:</span>
                        <span className="font-medium">{macros.carbs}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fat:</span>
                        <span className="font-medium">{macros.fat}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fiber:</span>
                        <span className="font-medium">{macros.fiber}g</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Set as Goal Button */}
                {(() => {
                  const buttonState = getButtonState();
                  if (!buttonState.show) return null;

                  return (
                    <button
                      onClick={() =>
                        setAsGoal(
                          "aggressive-loss",
                          calculatedData.dailyCalories - 1000,
                        )
                      }
                      disabled={settingGoal === "aggressive-loss"}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {settingGoal === "aggressive-loss" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Target className="w-3 h-3" />
                      )}
                      {buttonState.text}
                    </button>
                  );
                })()}
              </div>

              {/* Moderate Weight Loss */}
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-orange-700">
                    Moderate Loss
                  </span>
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    -{bmiData.weightUnit === "kg" ? "0.45 kg" : "1 lb"}/week
                  </span>
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {calculatedData.dailyCalories - 500}
                </div>
                <div className="text-xs text-gray-600 mb-2">calories/day</div>
                <div className="text-xs text-orange-600 mb-3">
                  <strong>Deficit:</strong> -500 cal/day
                </div>

                {/* Macros */}
                {(() => {
                  const macros = calculateMacrosForCalories(
                    calculatedData.dailyCalories - 500,
                  );
                  return (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Protein:</span>
                        <span className="font-medium">{macros.protein}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Carbs:</span>
                        <span className="font-medium">{macros.carbs}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fat:</span>
                        <span className="font-medium">{macros.fat}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fiber:</span>
                        <span className="font-medium">{macros.fiber}g</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Set as Goal Button */}
                {(() => {
                  const buttonState = getButtonState();
                  if (!buttonState.show) return null;

                  return (
                    <button
                      onClick={() =>
                        setAsGoal(
                          "moderate-loss",
                          calculatedData.dailyCalories - 500,
                        )
                      }
                      disabled={settingGoal === "moderate-loss"}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {settingGoal === "moderate-loss" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Target className="w-3 h-3" />
                      )}
                      {buttonState.text}
                    </button>
                  );
                })()}
              </div>

              {/* Slow Weight Loss */}
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-yellow-700">
                    Slow Loss
                  </span>
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                    -{bmiData.weightUnit === "kg" ? "0.23 kg" : "0.5 lb"}/week
                  </span>
                </div>
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {calculatedData.dailyCalories - 250}
                </div>
                <div className="text-xs text-gray-600 mb-2">calories/day</div>
                <div className="text-xs text-yellow-600 mb-3">
                  <strong>Deficit:</strong> -250 cal/day
                </div>

                {/* Macros */}
                {(() => {
                  const macros = calculateMacrosForCalories(
                    calculatedData.dailyCalories - 250,
                  );
                  return (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Protein:</span>
                        <span className="font-medium">{macros.protein}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Carbs:</span>
                        <span className="font-medium">{macros.carbs}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fat:</span>
                        <span className="font-medium">{macros.fat}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fiber:</span>
                        <span className="font-medium">{macros.fiber}g</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Set as Goal Button */}
                {(() => {
                  const buttonState = getButtonState();
                  if (!buttonState.show) return null;

                  return (
                    <button
                      onClick={() =>
                        setAsGoal(
                          "slow-loss",
                          calculatedData.dailyCalories - 250,
                        )
                      }
                      disabled={settingGoal === "slow-loss"}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600 text-white text-xs font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {settingGoal === "slow-loss" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Target className="w-3 h-3" />
                      )}
                      {buttonState.text}
                    </button>
                  );
                })()}
              </div>

              {/* Maintenance */}
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-green-700">
                    Maintenance
                  </span>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    0 {bmiData.weightUnit}/week
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {calculatedData.dailyCalories}
                </div>
                <div className="text-xs text-gray-600 mb-2">calories/day</div>
                <div className="text-xs text-green-600 mb-3">
                  <strong>Balance:</strong> Maintain current weight
                </div>

                {/* Macros */}
                {(() => {
                  const macros = calculateMacrosForCalories(
                    calculatedData.dailyCalories,
                  );
                  return (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Protein:</span>
                        <span className="font-medium">{macros.protein}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Carbs:</span>
                        <span className="font-medium">{macros.carbs}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fat:</span>
                        <span className="font-medium">{macros.fat}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fiber:</span>
                        <span className="font-medium">{macros.fiber}g</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Set as Goal Button */}
                {(() => {
                  const buttonState = getButtonState();
                  if (!buttonState.show) return null;

                  return (
                    <button
                      onClick={() =>
                        setAsGoal("maintenance", calculatedData.dailyCalories)
                      }
                      disabled={settingGoal === "maintenance"}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {settingGoal === "maintenance" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Target className="w-3 h-3" />
                      )}
                      {buttonState.text}
                    </button>
                  );
                })()}
              </div>

              {/* Slow Weight Gain */}
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-700">
                    Slow Gain
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    +{bmiData.weightUnit === "kg" ? "0.23 kg" : "0.5 lb"}/week
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {calculatedData.dailyCalories + 250}
                </div>
                <div className="text-xs text-gray-600 mb-2">calories/day</div>
                <div className="text-xs text-blue-600 mb-3">
                  <strong>Surplus:</strong> +250 cal/day
                </div>

                {/* Macros */}
                {(() => {
                  const macros = calculateMacrosForCalories(
                    calculatedData.dailyCalories + 250,
                  );
                  return (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Protein:</span>
                        <span className="font-medium">{macros.protein}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Carbs:</span>
                        <span className="font-medium">{macros.carbs}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fat:</span>
                        <span className="font-medium">{macros.fat}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fiber:</span>
                        <span className="font-medium">{macros.fiber}g</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Set as Goal Button */}
                {(() => {
                  const buttonState = getButtonState();
                  if (!buttonState.show) return null;

                  return (
                    <button
                      onClick={() =>
                        setAsGoal(
                          "slow-gain",
                          calculatedData.dailyCalories + 250,
                        )
                      }
                      disabled={settingGoal === "slow-gain"}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {settingGoal === "slow-gain" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Target className="w-3 h-3" />
                      )}
                      {buttonState.text}
                    </button>
                  );
                })()}
              </div>

              {/* Moderate Weight Gain */}
              <div className="bg-white p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-indigo-700">
                    Moderate Gain
                  </span>
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                    +{bmiData.weightUnit === "kg" ? "0.45 kg" : "1 lb"}/week
                  </span>
                </div>
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {calculatedData.dailyCalories + 500}
                </div>
                <div className="text-xs text-gray-600 mb-2">calories/day</div>
                <div className="text-xs text-indigo-600 mb-3">
                  <strong>Surplus:</strong> +500 cal/day
                </div>

                {/* Macros */}
                {(() => {
                  const macros = calculateMacrosForCalories(
                    calculatedData.dailyCalories + 500,
                  );
                  return (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Protein:</span>
                        <span className="font-medium">{macros.protein}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Carbs:</span>
                        <span className="font-medium">{macros.carbs}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fat:</span>
                        <span className="font-medium">{macros.fat}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Fiber:</span>
                        <span className="font-medium">{macros.fiber}g</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Set as Goal Button */}
                {(() => {
                  const buttonState = getButtonState();
                  if (!buttonState.show) return null;

                  return (
                    <button
                      onClick={() =>
                        setAsGoal(
                          "moderate-gain",
                          calculatedData.dailyCalories + 500,
                        )
                      }
                      disabled={settingGoal === "moderate-gain"}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {settingGoal === "moderate-gain" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Target className="w-3 h-3" />
                      )}
                      {buttonState.text}
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Weight Goals Information */}
            <div className="bg-white p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">
                Understanding Weight Goals
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <p className="mb-2">
                    <strong>Weight Loss:</strong>
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>
                      • 1 {bmiData.weightUnit === "kg" ? "kg" : "pound"} ={" "}
                      {bmiData.weightUnit === "kg" ? "7,700" : "3,500"} calories
                    </li>
                    <li>
                      • Safe loss:{" "}
                      {bmiData.weightUnit === "kg" ? "0.45-0.9 kg" : "1-2 lbs"}{" "}
                      per week
                    </li>
                    <li>• Combine diet + exercise for best results</li>
                    <li>
                      • Minimum: 1,200 cal/day (women) or 1,500 cal/day (men)
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="mb-2">
                    <strong>Weight Gain:</strong>
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• Focus on lean muscle gain</li>
                    <li>• Combine with strength training</li>
                    <li>• Choose nutrient-dense foods</li>
                    <li>• Monitor body composition, not just weight</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-800">
                  <strong>Important:</strong> These are general guidelines.
                  Individual results may vary based on metabolism, genetics,
                  medical conditions, and activity level. Consult a healthcare
                  provider before starting any weight management program.
                </p>
              </div>
              </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border border-orange-200">
                <div className="text-sm text-gray-700">
                  <strong>Note:</strong> These calculations are estimates based on
                  standard formulas. For personalized nutrition advice, consult with
                  a healthcare professional or registered dietitian.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCalorieEstimates = () => (
    <div className="md:max-w-6xl md:mx-auto md:p-6">
      <div className="md:bg-white md:rounded-2xl md:shadow-lg md:p-8">
        {renderBMICalculator()}
      </div>
    </div>
  );

  const renderMacroBreakdown = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
            <Bookmark className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Saved Recipes</h2>
            <p className="text-gray-600">Your collection of favorite recipes</p>
          </div>
        </div>

        {renderSavedRecipesList()}
      </div>
    </div>
  );

  const renderExportOptions = () => (
    <div className="max-w-4xl bg-blue-50 mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
            <Download className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Export Options</h2>
            <p className="text-gray-600">Share and save your recipes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button className="bg-gradient-to-r from-orange-100 to-red-100 p-8 rounded-xl hover:from-orange-200 hover:to-red-200 transition-all duration-200 text-left">
            <FileText className="w-12 h-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Export to PDF
            </h3>
            <p className="text-gray-600">
              Download a beautifully formatted PDF of your recipe
            </p>
          </button>

          <button className="bg-gradient-to-r from-green-100 to-emerald-100 p-8 rounded-xl hover:from-green-200 hover:to-emerald-200 transition-all duration-200 text-left">
            <Mail className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Email Recipe
            </h3>
            <p className="text-gray-600">
              Send the recipe directly to your email or share with friends
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  switch (currentSubView) {
    case "macros":
      return renderMacroBreakdown();
    case "calories":
      return renderCalorieEstimates();
    case "export-pdf":
    case "export-email":
      return renderExportOptions();
    default:
      return renderMacroBreakdown();
  }
}
