import { useState } from "react";
import {
  CalendarDays,
  Utensils,
  Plus,
  ChefHat,
  ShoppingCart,
  Target,
  Trash2,
  X,
} from "lucide-react";

interface MealPlanningViewProps {
  currentSubView: string;
}

export default function MealPlanningView({
  currentSubView,
}: MealPlanningViewProps) {
  const [weekPlan, setWeekPlan] = useState<{
    [key: string]: { breakfast?: string; lunch?: string; dinner?: string };
  }>({});
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const mealTypes = ["breakfast", "lunch", "dinner"];

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const clearSelectedMeals = () => {
    const newPlan = { ...weekPlan };
    selectedDays.forEach((day) => {
      delete newPlan[day];
    });
    setWeekPlan(newPlan);
    setSelectedDays([]);
  };

  const deleteMeal = (day: string, mealType: string) => {
    setWeekPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: undefined,
      },
    }));
  };

  const generateWeekPlan = () => {
    const sampleMeals = {
      breakfast: [
        "Avocado Toast",
        "Greek Yogurt Bowl",
        "Oatmeal with Berries",
        "Scrambled Eggs",
        "Smoothie Bowl",
      ],
      lunch: [
        "Caesar Salad",
        "Grilled Chicken Wrap",
        "Quinoa Bowl",
        "Soup & Sandwich",
        "Pasta Salad",
      ],
      dinner: [
        "Grilled Salmon",
        "Chicken Stir Fry",
        "Beef Tacos",
        "Vegetable Curry",
        "Pizza Night",
      ],
    };

    const newPlan: {
      [key: string]: { breakfast?: string; lunch?: string; dinner?: string };
    } = {};

    daysOfWeek.forEach((day) => {
      newPlan[day] = {
        breakfast:
          sampleMeals.breakfast[
            Math.floor(Math.random() * sampleMeals.breakfast.length)
          ],
        lunch:
          sampleMeals.lunch[
            Math.floor(Math.random() * sampleMeals.lunch.length)
          ],
        dinner:
          sampleMeals.dinner[
            Math.floor(Math.random() * sampleMeals.dinner.length)
          ],
      };
    });

    setWeekPlan(newPlan);
  };

  const renderWeeklyPlanner = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
              <CalendarDays className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Weekly Meal Planner
              </h2>
              <p className="text-gray-600">
                Plan your meals for the entire week
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {selectedDays.length > 0 && (
              <>
                <button
                  onClick={() => {
                    /* Show grocery list logic */
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 flex items-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>See Groceries</span>
                </button>

                <button
                  onClick={() => {
                    /* Show macros logic */
                  }}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 flex items-center space-x-2"
                >
                  <Target className="w-4 h-4" />
                  <span>See Macros</span>
                </button>

                <button
                  onClick={clearSelectedMeals}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Meals</span>
                </button>
              </>
            )}

            <button
              onClick={generateWeekPlan}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Utensils className="w-5 h-5" />
              <span>Generate Week Plan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className={`bg-gradient-to-b from-orange-50 to-green-50 rounded-xl p-4 border-2 transition-all duration-200 ${
                selectedDays.includes(day)
                  ? "border-orange-400 shadow-lg"
                  : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{day}</h3>
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => toggleDaySelection(day)}
                  className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                />
              </div>

              <div className="space-y-3">
                {mealTypes.map((mealType) => (
                  <div
                    key={mealType}
                    className="bg-white rounded-lg p-3 min-h-[80px]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-700 capitalize">
                        {mealType}
                      </h4>
                      {weekPlan[day]?.[
                        mealType as keyof (typeof weekPlan)[string]
                      ] && (
                        <button
                          onClick={() => deleteMeal(day, mealType)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {weekPlan[day]?.[
                      mealType as keyof (typeof weekPlan)[string]
                    ] ? (
                      <p className="text-sm text-gray-600">
                        {
                          weekPlan[day][
                            mealType as keyof (typeof weekPlan)[string]
                          ]
                        }
                      </p>
                    ) : (
                      <button className="w-full h-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlanWeek = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Generate 7-Day Plan
            </h2>
            <p className="text-gray-600">
              Let AI create a complete meal plan for you
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Preferences
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>No restrictions</option>
                <option>Vegetarian</option>
                <option>Vegan</option>
                <option>Keto</option>
                <option>Mediterranean</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cooking Time Preference
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>Any time</option>
                <option>Quick meals (under 30 min)</option>
                <option>Medium prep (30-60 min)</option>
                <option>Elaborate cooking (60+ min)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>Any budget</option>
                <option>Budget-friendly</option>
                <option>Moderate</option>
                <option>Premium ingredients</option>
              </select>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                What you'll get:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">
                    21 complete meals (7 days × 3 meals)
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Detailed shopping list</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Nutritional breakdown</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Prep time estimates</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Recipe variations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={generateWeekPlan}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-3 mx-auto text-lg font-semibold"
          >
            <ChefHat className="w-6 h-6" />
            <span>Generate My 7-Day Plan</span>
          </button>
        </div>
      </div>
    </div>
  );

  switch (currentSubView) {
    case "weekly-planner":
      return renderWeeklyPlanner();
    case "plan-week":
      return renderPlanWeek();
    default:
      return renderWeeklyPlanner();
  }
}
