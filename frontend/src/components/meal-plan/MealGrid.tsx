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
    <div className="hidden md:flex md:flex-1 flex-col overflow-hidden bg-orange-50">
      {/* Grid Header */}
      <div className="p-6 bg-gradient-to-r from-orange-50 via-orange-50 to-pink-50/30 border-b border-orange-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative bg-gradient-to-br from-orange-500 via-orange-500 to-pink-500 p-3.5 rounded-2xl shadow-lg shadow-orange-500/30">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl" />
              <Calendar className="w-8 h-8 text-white drop-shadow-md relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                Weekly Meal Plan
              </h1>
              <p className="text-gray-600 font-medium mt-0.5">
                Week of {format(currentWeek, "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onPreviousWeek}
              size="sm"
              className="bg-white hover:bg-orange-50 border-orange-200/50 text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:border-orange-300"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={onNextWeek}
              size="sm"
              className="bg-white hover:bg-orange-50 border-orange-200/50 text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:border-orange-300"
            >
              Next
            </Button>
            <Button
              onClick={onGeneratePlan}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Utensils className="w-4 h-4 mr-2 drop-shadow" />
              Generate Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Meal Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
        <div className="grid grid-cols-8 gap-4">
          {/* Header row */}
          <div className="col-span-1 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl py-3 shadow-sm border border-orange-100/50">
            <span className="text-sm font-semibold text-gray-700">Meals</span>
          </div>
          {DAYS_OF_WEEK.map((day, index) => {
            const dayDate = addDays(currentWeek, index);
            const isToday = format(new Date(), "yyyy-MM-dd") === format(dayDate, "yyyy-MM-dd");
            return (
              <div
                key={index}
                className={`text-center py-3 rounded-xl transition-all duration-200 ${
                  isToday
                    ? "bg-gradient-to-br from-orange-100 to-orange-50 shadow-md border-2 border-orange-300"
                    : "bg-white/60 backdrop-blur-sm shadow-sm border border-orange-100/50"
                }`}
              >
                <div className={`text-sm font-medium ${isToday ? "text-orange-600" : "text-gray-500"}`}>
                  {format(dayDate, "EEE")}
                </div>
                <div className={`text-lg font-bold ${isToday ? "text-orange-700" : "text-gray-900"}`}>
                  {format(dayDate, "d")}
                </div>
              </div>
            );
          })}

          {/* Grid rows */}
          {MEAL_SLOTS.map((meal, index) => (
            <>
              {/* Meal label */}
              <div key={index} className="flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-orange-100/50">
                <span className="text-sm font-semibold text-gray-700 capitalize">
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

