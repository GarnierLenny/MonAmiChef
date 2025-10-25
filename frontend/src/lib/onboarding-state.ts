// Onboarding state management and localStorage utilities

export interface OnboardingState {
  welcomeModalSeen: boolean;
  tourCompleted: boolean;
  tourSkipped: boolean;
  currentStep: number;
  featuresDiscovered: string[];
  lastSeenDate: string;
  skipCount: number;
  version: string;
}

const STORAGE_KEY = 'monamichef_onboarding_v1';
const CURRENT_VERSION = '1.0.0';

const defaultState: OnboardingState = {
  welcomeModalSeen: false,
  tourCompleted: false,
  tourSkipped: false,
  currentStep: 0,
  featuresDiscovered: [],
  lastSeenDate: new Date().toISOString(),
  skipCount: 0,
  version: CURRENT_VERSION,
};

/**
 * Load onboarding state from localStorage
 */
export function loadOnboardingState(): OnboardingState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;

    const parsed = JSON.parse(stored) as OnboardingState;

    // Reset if version mismatch (for future updates)
    if (parsed.version !== CURRENT_VERSION) {
      return defaultState;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load onboarding state:', error);
    return defaultState;
  }
}

/**
 * Save onboarding state to localStorage
 */
export function saveOnboardingState(state: Partial<OnboardingState>): void {
  try {
    const current = loadOnboardingState();
    const updated = {
      ...current,
      ...state,
      lastSeenDate: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save onboarding state:', error);
  }
}

/**
 * Mark welcome modal as seen
 */
export function markWelcomeModalSeen(): void {
  saveOnboardingState({ welcomeModalSeen: true });
}

/**
 * Mark tour as completed
 */
export function markTourCompleted(): void {
  saveOnboardingState({
    tourCompleted: true,
    currentStep: 0
  });
}

/**
 * Mark tour as skipped
 */
export function markTourSkipped(atStep: number): void {
  const current = loadOnboardingState();
  saveOnboardingState({
    tourSkipped: true,
    currentStep: atStep,
    skipCount: current.skipCount + 1
  });
}

/**
 * Track feature discovery
 */
export function markFeatureDiscovered(feature: string): void {
  const current = loadOnboardingState();
  if (!current.featuresDiscovered.includes(feature)) {
    saveOnboardingState({
      featuresDiscovered: [...current.featuresDiscovered, feature],
    });
  }
}

/**
 * Reset onboarding (for "Restart Tour" feature)
 */
export function resetOnboarding(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
}

/**
 * Check if user should see onboarding
 */
export function shouldShowOnboarding(): {
  showWelcomeModal: boolean;
  shouldStartTour: boolean;
} {
  const state = loadOnboardingState();

  return {
    showWelcomeModal: !state.welcomeModalSeen,
    shouldStartTour: state.welcomeModalSeen && !state.tourCompleted && !state.tourSkipped,
  };
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(): boolean {
  const state = loadOnboardingState();
  return state.welcomeModalSeen && state.tourCompleted;
}

/**
 * Get onboarding analytics data
 */
export function getOnboardingAnalytics(): {
  completed: boolean;
  skipped: boolean;
  skipCount: number;
  featuresDiscoveredCount: number;
  daysSinceFirstSeen: number;
} {
  const state = loadOnboardingState();
  const firstSeen = new Date(state.lastSeenDate);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24));

  return {
    completed: state.tourCompleted,
    skipped: state.tourSkipped,
    skipCount: state.skipCount,
    featuresDiscoveredCount: state.featuresDiscovered.length,
    daysSinceFirstSeen: daysSince,
  };
}
