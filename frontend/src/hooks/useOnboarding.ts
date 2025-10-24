import { useState, useEffect } from 'react';
import {
  loadOnboardingState,
  saveOnboardingState,
  markWelcomeModalSeen,
  markTourCompleted,
  markTourSkipped,
  markFeatureDiscovered,
  resetOnboarding,
  shouldShowOnboarding,
  hasCompletedOnboarding,
  type OnboardingState,
} from '../lib/onboarding-state';

/**
 * Custom hook for managing onboarding state
 */
export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(loadOnboardingState());
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Check on mount if we should show onboarding
  useEffect(() => {
    const { showWelcomeModal: shouldShowModal, shouldStartTour } = shouldShowOnboarding();

    if (shouldShowModal) {
      setShowWelcomeModal(true);
    } else if (shouldStartTour) {
      setShowTour(true);
    }
  }, []);

  const completeWelcomeModal = (startTour: boolean = false) => {
    markWelcomeModalSeen();
    setShowWelcomeModal(false);
    setState(loadOnboardingState());

    if (startTour) {
      // Small delay to let modal close animation finish
      setTimeout(() => setShowTour(true), 300);
    }
  };

  const completeTour = () => {
    markTourCompleted();
    setShowTour(false);
    setState(loadOnboardingState());
  };

  const skipTour = (atStep: number) => {
    markTourSkipped(atStep);
    setShowTour(false);
    setState(loadOnboardingState());
  };

  const discoverFeature = (feature: string) => {
    markFeatureDiscovered(feature);
    setState(loadOnboardingState());
  };

  const restartTour = () => {
    resetOnboarding();
    setState(loadOnboardingState());
    setShowWelcomeModal(true);
  };

  const updateState = (updates: Partial<OnboardingState>) => {
    saveOnboardingState(updates);
    setState(loadOnboardingState());
  };

  return {
    state,
    showWelcomeModal,
    showTour,
    setShowTour,
    completeWelcomeModal,
    completeTour,
    skipTour,
    discoverFeature,
    restartTour,
    updateState,
    isOnboardingComplete: hasCompletedOnboarding(),
  };
}
