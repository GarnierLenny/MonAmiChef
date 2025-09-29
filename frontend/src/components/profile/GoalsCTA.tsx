import { Target, Calculator, ArrowRight } from "lucide-react";

interface GoalsCTAProps {
  onSetGoals: () => void;
}

export const GoalsCTA = ({ onSetGoals }: GoalsCTAProps) => {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 shadow-sm border border-orange-100">
      <div className="text-center">
        {/* Icon with animated background */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-orange-100 to-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
            <Target className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Set Your Nutrition Goals
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Track your daily calories and macros to achieve your health goals.
          Use our calorie calculator to get personalized recommendations.
        </p>

        {/* CTA Button */}
        <button
          onClick={onSetGoals}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Calculator className="w-5 h-5" />
          Calculate Your Goals
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Benefits list */}
        <div className="mt-6 pt-6 border-t border-orange-200">
          <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Get personalized calorie recommendations</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>Track your daily nutrition progress</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Achieve your health and fitness goals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};