import { useCallback, useEffect, useRef } from 'react';
import { driver, type DriveStep, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { getDriverTheme, getTourSteps, getMobileTourSteps } from '../lib/driver-config';
import { markTourCompleted, markTourSkipped } from '../lib/onboarding-state';

interface UseDriverOptions {
  onComplete?: () => void;
  onSkip?: (stepIndex: number) => void;
  isMobile?: boolean;
}

/**
 * Custom hook for managing Driver.js guided tour
 */
export function useDriver(options: UseDriverOptions = {}) {
  const { onComplete, onSkip, isMobile = false } = options;
  const driverRef = useRef<Driver | null>(null);

  // Cleanup driver on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  /**
   * Start the guided tour
   */
  const startTour = useCallback(() => {
    // Choose steps based on device
    const steps = isMobile ? getMobileTourSteps() : getTourSteps();

    // Destroy existing driver if any
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    // Create new driver instance
    const driverObj = driver({
      ...getDriverTheme(),
      steps,
      onDestroyed: (element, step, options) => {
        const currentStep = options.state?.activeIndex ?? 0;
        const totalSteps = steps.length;

        // Check if tour was completed or skipped
        if (currentStep >= totalSteps - 1) {
          // Tour completed
          markTourCompleted();
          if (onComplete) {
            onComplete();
          }
        } else {
          // Tour skipped
          markTourSkipped(currentStep);
          if (onSkip) {
            onSkip(currentStep);
          }
        }
      },
      onPopoverRender: (popover, { config, state }) => {
        // Add custom class for styling
        popover.wrapper.classList.add('monamichef-driver-wrapper');

        // Add confetti on last step
        if (state.activeIndex === (steps.length - 1)) {
          popover.title.innerHTML += ' 🎉';
        }
      },
    });

    driverRef.current = driverObj;
    driverObj.drive();
  }, [isMobile, onComplete, onSkip]);

  /**
   * Move to next step
   */
  const moveNext = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.moveNext();
    }
  }, []);

  /**
   * Move to previous step
   */
  const movePrevious = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.movePrevious();
    }
  }, []);

  /**
   * Move to specific step
   */
  const moveTo = useCallback((stepIndex: number) => {
    if (driverRef.current) {
      driverRef.current.moveTo(stepIndex);
    }
  }, []);

  /**
   * Destroy the tour
   */
  const destroyTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
  }, []);

  /**
   * Highlight a single element (for feature hints)
   */
  const highlight = useCallback((step: DriveStep) => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    const driverObj = driver({
      ...getDriverTheme(),
      showButtons: ['close'],
      showProgress: false,
      steps: [step],
    });

    driverRef.current = driverObj;
    driverObj.drive();
  }, []);

  return {
    startTour,
    moveNext,
    movePrevious,
    moveTo,
    destroyTour,
    highlight,
    isActive: !!driverRef.current,
  };
}

/**
 * Hook for showing contextual feature hints
 */
export function useFeatureHint() {
  const { highlight } = useDriver();

  const showHint = useCallback(
    (element: string, title: string, description: string, side: 'top' | 'right' | 'bottom' | 'left' = 'top') => {
      highlight({
        element,
        popover: {
          title,
          description,
          side,
        },
      });
    },
    [highlight]
  );

  return { showHint };
}
