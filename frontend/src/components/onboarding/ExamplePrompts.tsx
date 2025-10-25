import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ExamplePrompt {
  icon: string;
  text: string;
  category: "fast" | "healthy" | "ingredient" | "easy" | "cuisine" | "family";
}

interface ExamplePromptsProps {
  onPromptClick: (prompt: string) => void;
  mini?: boolean;
}

const categoryColors: Record<ExamplePrompt["category"], string> = {
  fast: "from-orange-100 to-orange-50 hover:from-orange-200 hover:to-orange-100 border-orange-200",
  healthy:
    "from-green-100 to-green-50 hover:from-green-200 hover:to-green-100 border-green-200",
  ingredient:
    "from-yellow-100 to-yellow-50 hover:from-yellow-200 hover:to-yellow-100 border-yellow-200",
  easy: "from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 border-blue-200",
  cuisine:
    "from-red-100 to-red-50 hover:from-red-200 hover:to-red-100 border-red-200",
  family:
    "from-purple-100 to-purple-50 hover:from-purple-200 hover:to-purple-100 border-purple-200",
};

export default function ExamplePrompts({
  onPromptClick,
  mini = false,
}: ExamplePromptsProps) {
  const { t } = useTranslation();

  const prompts: ExamplePrompt[] = [
    {
      icon: "⚡",
      text: t("onboarding.examplePrompts.quickDinner"),
      category: "fast",
    },
    {
      icon: "🥗",
      text: t("onboarding.examplePrompts.healthyVegetarian"),
      category: "healthy",
    },
    {
      icon: "🍗",
      text: t("onboarding.examplePrompts.chickenRecipes"),
      category: "ingredient",
    },
    {
      icon: "🍝",
      text: t("onboarding.examplePrompts.easyPasta"),
      category: "easy",
    },
    {
      icon: "🌶️",
      text: t("onboarding.examplePrompts.spicyAsian"),
      category: "cuisine",
    },
    {
      icon: "🥘",
      text: t("onboarding.examplePrompts.familyMeals"),
      category: "family",
    },
  ];

  // Always show only 4 prompts
  const displayPrompts = mini ? prompts.slice(0, 3) : prompts.slice(0, 4);

  return (
    <div className={`${mini ? "space-y-2" : "space-y-3"}`}>
      {/* Scrollable container for mobile, grid for desktop */}
      <div className={`${mini ? "space-y-2" : ""}`}>
        {/* Mobile: Horizontal scroll - hide scrollbar */}
        <div
          className={`md:hidden ${mini ? "" : "overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar"}`}
        >
          <div
            className={`flex ${mini ? "flex-col space-y-2" : "gap-2.5 min-w-max"}`}
          >
            {displayPrompts.map((prompt, index) => (
              <PromptButton
                key={prompt.text}
                prompt={prompt}
                index={index}
                onPromptClick={onPromptClick}
                categoryColors={categoryColors}
                mini={mini}
              />
            ))}
          </div>
        </div>

        {/* Desktop: 2x2 Grid */}
        <div
          className={`hidden md:grid ${mini ? "grid-cols-1 gap-2" : "grid-cols-2 gap-2.5 max-w-3xl mx-auto"}`}
        >
          {displayPrompts.map((prompt, index) => (
            <PromptButton
              key={prompt.text}
              prompt={prompt}
              index={index}
              onPromptClick={onPromptClick}
              categoryColors={categoryColors}
              mini={mini}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Separate component for prompt buttons to keep code clean
function PromptButton({
  prompt,
  index,
  onPromptClick,
  categoryColors,
  mini = false,
}: {
  prompt: ExamplePrompt;
  index: number;
  onPromptClick: (text: string) => void;
  categoryColors: Record<ExamplePrompt["category"], string>;
  mini?: boolean;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onPromptClick(prompt.text)}
      className={`
        group relative
        bg-gradient-to-br ${categoryColors[prompt.category]}
        border
        rounded-lg
        ${mini ? "px-3 py-2 text-sm" : "px-3.5 py-2.5 md:px-4 md:py-3 text-sm md:text-base"}
        text-left
        shadow-sm hover:shadow-md
        transition-all duration-200
        ${mini ? "" : "min-w-[200px] md:min-w-0"}
      `}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`${mini ? "text-xl" : "text-xl md:text-2xl"} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}
        >
          {prompt.icon}
        </span>
        <span className="font-medium text-gray-800 group-hover:text-gray-900 leading-snug">
          {prompt.text}
        </span>
      </div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700" />
    </motion.button>
  );
}
