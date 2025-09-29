import { Button } from "@/components/ui/button";
import { Calendar, Utensils } from "lucide-react";
import { format, addDays } from "date-fns";
import { MealCard } from "./MealCard";
import {
  DAYS_OF_WEEK,
  MEAL_SLOTS,
  type MealPlan,
  type MealSlot,
} from "./constants";

interface MealGridProps {
  currentWeek: Date;
  mealPlan: MealPlan;
  onSlotClick: (day: string, meal: MealSlot) => void;
  onRemoveMeal: (day: string, meal: MealSlot) => void;
  onGeneratePlan: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  selectedMeals?: Set<string>;
  onMealSelection?: (day: string, mealSlot: MealSlot) => void;
}

export const MealGrid = ({
  currentWeek,
  mealPlan,
  onSlotClick,
  onRemoveMeal,
  onGeneratePlan,
  onPreviousWeek,
  onNextWeek,
  selectedMeals = new Set(),
  onMealSelection,
}: MealGridProps) => {
  return (
    <div className="hidden md:flex md:flex-1 flex-col overflow-hidden">
      {/* Grid Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Weekly Meal Plan
              </h1>
              <p className="text-gray-600">
                Week of {format(currentWeek, "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onPreviousWeek} size="sm">
              Previous
            </Button>
            <Button variant="outline" onClick={onNextWeek} size="sm">
              Next
            </Button>
            <Button
              onClick={onGeneratePlan}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              <Utensils className="w-4 h-4 mr-2" />
              Generate Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Meal Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-8 gap-4">
          {/* Header row */}
          <div className="col-span-1 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">Meals</span>
          </div>
          {DAYS_OF_WEEK.map((day, index) => {
            const dayDate = addDays(currentWeek, index);
            return (
              <div key={index} className="text-center">
                <div className="text-sm text-gray-500">
                  {format(dayDate, "EEE")}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {format(dayDate, "d")}
                </div>
              </div>
            );
          })}

          {/* Grid rows */}
          {MEAL_SLOTS.map((meal, index) => (
            <>
              {/* Meal label */}
              <div key={index} className="flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {meal}
                </span>
              </div>

              {/* Meal slots for each day */}
              {DAYS_OF_WEEK.map((day, index) => {
                const slotKey = `${day}-${meal}`;
                return (
                  <MealCard
                    key={index}
                    meal={mealPlan[day]?.[meal]}
                    mealSlot={meal}
                    onClick={() => onSlotClick(day, meal)}
                    onRemove={() => onRemoveMeal(day, meal)}
                    isDesktop
                    isSelected={selectedMeals.has(slotKey)}
                    onMealSelection={() => onMealSelection?.(day, meal)}
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

