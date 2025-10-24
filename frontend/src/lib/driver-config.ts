import { DriveStep, Config } from "driver.js";

/**
 * Driver.js theme configuration matching MonAmiChef brand
 */
export const driverTheme: Partial<Config> = {
  showProgress: true,
  showButtons: ["next", "previous", "close"],
  allowClose: true,

  // Overlay configuration - light overlay so highlighted element is fully visible
  overlayColor: "#000",
  overlayOpacity: 0.5,

  // Stage/highlight configuration - larger padding and smoother corners
  stagePadding: 8,
  stageRadius: 10,

  // Popover configuration - add padding from screen edges
  popoverOffset: 12,
  padding: 32, // Minimum distance from viewport edges (increased to prevent edge sticking)

  smoothScroll: true,
  animate: true,

  // Button text customization
  nextBtnText: "Next →",
  prevBtnText: "← Previous",
  doneBtnText: "Done! 🎉",

  // Styling
  popoverClass: "monamichef-driver-popover",
  progressText: "{{current}} of {{total}}",
};

/**
 * Tour steps for the guided onboarding
 */
export const tourSteps: DriveStep[] = [
  {
    element: ".chat-input-container",
    popover: {
      title: "Start a Conversation",
      description:
        'Tell me what you\'re craving or what ingredients you have. Try asking: "Quick dinner for 2" or "What can I make with chicken?"',
      side: "top",
      align: "center",
    },
  },
  {
    element: ".preferences-sidebar, [data-preferences-button]",
    popover: {
      title: "Customize Your Recipes",
      description:
        "Filter recipes by cuisine, cooking time, skill level, dietary preferences, and more. Make every recipe perfect for you!",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[href="/meal-plan-chat"], [data-meal-plan-link]',
    popover: {
      title: "Weekly Meal Planning",
      description:
        "Generate complete meal plans for your week in seconds. Click here to start planning!",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[href="/grocery-list"], [data-grocery-list-link]',
    popover: {
      title: "Smart Grocery Lists",
      description:
        "Automatically generate organized grocery lists from your meal plans. Never forget an ingredient!",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: ".chat-history-sidebar, [data-chat-history]",
    popover: {
      title: "Conversation History",
      description:
        "All your conversations are automatically saved here. Rename, delete, or continue any chat anytime.",
      side: "left",
      align: "start",
    },
  },
];

/**
 * Alternative tour steps for mobile view
 */
export const mobileTourSteps: DriveStep[] = [
  {
    element: ".chat-input-container",
    popover: {
      title: "Start Chatting",
      description:
        'Ask me anything about cooking! Try: "Easy pasta recipes" or "Healthy dinner ideas"',
      side: "top",
      align: "center",
    },
  },
  {
    element: "[data-preferences-button], .mobile-preferences-button",
    popover: {
      title: "Set Your Preferences",
      description:
        "Tap the settings icon to customize recipes by cuisine, time, and dietary needs.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "[data-mobile-menu], .mobile-menu-button",
    popover: {
      title: "Explore Features",
      description:
        "Open the menu to access meal planning, grocery lists, and saved recipes.",
      side: "bottom",
      align: "start",
    },
  },
];

/**
 * Feature hints configuration for contextual help
 */
export interface FeatureHint {
  id: string;
  element: string;
  title: string;
  description: string;
  placement: "top" | "right" | "bottom" | "left";
  showOnce: boolean;
  triggerEvent?: "hover" | "click" | "auto";
}

export const featureHints: FeatureHint[] = [
  {
    id: "save-recipe",
    element: ".save-recipe-button",
    title: "Save This Recipe",
    description: "Click the heart to save this recipe to your collection",
    placement: "left",
    showOnce: true,
    triggerEvent: "hover",
  },
  {
    id: "meal-plan-generate",
    element: "[data-generate-meal-button]",
    title: "Generate Meal",
    description: "Click any meal slot to generate a personalized recipe",
    placement: "top",
    showOnce: true,
    triggerEvent: "auto",
  },
  {
    id: "guest-signup-prompt",
    element: "[data-auth-button]",
    title: "Save Your Progress",
    description:
      "Sign up to save recipes, meal plans, and access them from any device",
    placement: "bottom",
    showOnce: false,
    triggerEvent: "auto",
  },
];
