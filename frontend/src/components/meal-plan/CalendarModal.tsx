import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { cn } from "@/lib/utils";
import { calculateDayProgress } from "./utils";
import type { MealPlan } from "./constants";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  currentDate: Date;
  mealPlan: MealPlan;
}

interface DayProgressData {
  percentage: number;
  hasData: boolean;
}

export const CalendarModal = ({
  isOpen,
  onClose,
  onDateSelect,
  currentDate,
  mealPlan,
}: CalendarModalProps) => {
  const [viewDate, setViewDate] = useState(currentDate);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const handlePreviousMonth = () => {
    setViewDate(subMonths(viewDate, 1));
  };

  const handleNextMonth = () => {
    setViewDate(addMonths(viewDate, 1));
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onClose();
  };

  const getDayProgress = (date: Date): DayProgressData => {
    const dayName = format(date, "EEEE");
    const dayData = mealPlan[dayName];

    // Check if this date is within the current week of the meal plan
    // The meal plan is weekly-based, so we should only show progress for the current week
    const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const dateWeekStart = startOfWeek(date, { weekStartsOn: 1 });
    const isInCurrentWeek =
      currentWeekStart.getTime() === dateWeekStart.getTime();

    if (!dayData || Object.keys(dayData).length === 0 || !isInCurrentWeek) {
      return { percentage: 0, hasData: false };
    }

    const progress = calculateDayProgress(mealPlan, dayName);
    return {
      percentage: progress.calories.percentage,
      hasData: true,
    };
  };

  const getProgressColor = (percentage: number, hasData: boolean) => {
    if (!hasData) return "border-gray-200";

    if (percentage >= 80 && percentage <= 120) {
      return "border-green-500 bg-white";
    } else if (percentage < 80) {
      return "border-yellow-500 bg-white";
    } else {
      return "border-red-500 bg-white";
    }
  };

  const getProgressRing = (percentage: number, hasData: boolean) => {
    if (!hasData) return null;

    const clampedPercentage = Math.min(percentage, 100);
    const circumference = 2 * Math.PI * 8; // radius = 8 (reduced from 12)
    const strokeDasharray = `${(clampedPercentage / 100) * circumference} ${circumference}`;

    let strokeColor = "#10b981"; // green
    if (percentage < 80)
      strokeColor = "#f59e0b"; // yellow
    else if (percentage > 120) strokeColor = "#ef4444"; // red

    return (
      <svg
        className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] transform -rotate-90"
        viewBox="0 0 20 20"
      >
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1.5"
        />
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // Calculate month summary
  const monthSummary = days
    .filter((day) => isSameMonth(day, viewDate))
    .reduce(
      (acc, day) => {
        const progress = getDayProgress(day);
        if (progress.hasData) {
          acc.totalDays++;
          if (progress.percentage >= 80 && progress.percentage <= 120) {
            acc.onTargetDays++;
          }
          acc.totalCalories += calculateDayProgress(
            mealPlan,
            format(day, "EEEE"),
          ).calories.used;
        }
        return acc;
      },
      { totalDays: 0, onTargetDays: 0, totalCalories: 0 },
    );

  const avgCalories =
    monthSummary.totalDays > 0
      ? Math.round(monthSummary.totalCalories / monthSummary.totalDays)
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-11/12 rounded-md mx-auto max-h-[90vh] overflow-hidden border-none shadow-lg focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Button>

            <h2 className="text-lg font-semibold text-gray-900">
              {format(viewDate, "MMMM yyyy")}
            </h2>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>

        </DialogHeader>

        <div className="py-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const progress = getDayProgress(day);
              const isCurrentMonth = isSameMonth(day, viewDate);
              const isSelected = isSameDay(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div key={day.toString()} className="flex justify-center">
                  <button
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "relative h-12 w-12 z-10 rounded-full transition-all duration-200 hover:scale-105",
                      isCurrentMonth ? "text-gray-900" : "text-gray-300",
                      isSelected && "text-orange-500",
                      isToday && "text-green-500",
                    )}
                  >
                    {/* Day number */}
                    <span className="text-sm font-medium">
                      {format(day, "d")}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
