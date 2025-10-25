import { DriveStep, Config } from "driver.js";
import i18n from "./i18n";

/**
 * Driver.js theme configuration matching MonAmiChef brand
 */
export const getDriverTheme = (): Partial<Config> => ({
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
  nextBtnText: i18n.t('onboarding.tour.nextBtn'),
  prevBtnText: i18n.t('onboarding.tour.prevBtn'),
  doneBtnText: i18n.t('onboarding.tour.doneBtn'),

  // Styling
  popoverClass: "monamichef-driver-popover",
  progressText: i18n.t('onboarding.tour.progress'),
});

/**
 * Tour steps for the guided onboarding
 */
export const getTourSteps = (): DriveStep[] => [
  {
    element: ".chat-input-container",
    popover: {
      title: i18n.t('onboarding.tour.step1.title'),
      description: i18n.t('onboarding.tour.step1.description'),
      side: "top",
      align: "center",
    },
  },
  {
    element: ".preferences-sidebar, [data-preferences-button]",
    popover: {
      title: i18n.t('onboarding.tour.step2.title'),
      description: i18n.t('onboarding.tour.step2.description'),
      side: "right",
      align: "start",
    },
  },
  {
    element: '[href="/meal-plan-chat"], [data-meal-plan-link]',
    popover: {
      title: i18n.t('onboarding.tour.step3.title'),
      description: i18n.t('onboarding.tour.step3.description'),
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[href="/grocery-list"], [data-grocery-list-link]',
    popover: {
      title: i18n.t('onboarding.tour.step4.title'),
      description: i18n.t('onboarding.tour.step4.description'),
      side: "bottom",
      align: "center",
    },
  },
  {
    element: ".chat-history-sidebar, [data-chat-history]",
    popover: {
      title: i18n.t('onboarding.tour.step5.title'),
      description: i18n.t('onboarding.tour.step5.description'),
      side: "left",
      align: "start",
    },
  },
];

/**
 * Alternative tour steps for mobile view
 */
export const getMobileTourSteps = (): DriveStep[] => [
  {
    element: ".chat-input-container",
    popover: {
      title: i18n.t('onboarding.mobileTour.step1.title'),
      description: i18n.t('onboarding.mobileTour.step1.description'),
      side: "top",
      align: "center",
    },
  },
  {
    element: "[data-preferences-button], .mobile-preferences-button",
    popover: {
      title: i18n.t('onboarding.mobileTour.step2.title'),
      description: i18n.t('onboarding.mobileTour.step2.description'),
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "[data-mobile-menu], .mobile-menu-button",
    popover: {
      title: i18n.t('onboarding.mobileTour.step3.title'),
      description: i18n.t('onboarding.mobileTour.step3.description'),
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
