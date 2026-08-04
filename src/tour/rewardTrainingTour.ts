import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const REWARD_TRAINING_TOUR_KEY = "kult_reward_training_tour_done";

export function hasCompletedRewardTrainingTour(): boolean {
  try {
    return sessionStorage.getItem(REWARD_TRAINING_TOUR_KEY) === "1";
  } catch {
    return false;
  }
}

export function markRewardTrainingTourDone() {
  try {
    sessionStorage.setItem(REWARD_TRAINING_TOUR_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Focused trip for users arriving from daily rewards (Day 2 / Day 5). */
export function startRewardTrainingTour(onOpenFundWallet: () => void) {
  if (hasCompletedRewardTrainingTour()) return;

  const instance = driver({
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayColor: "#03070d",
    overlayOpacity: 0.82,
    stagePadding: 10,
    stageRadius: 18,
    showButtons: ["next", "previous", "close"],
    showProgress: true,
    progressText: "{{current}} / {{total}}",
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Open wallet",
    popoverClass: "kult-driver-popover",
    steps: [
      {
        element: "[data-tour='training-reward-banner']",
        popover: {
          title: "Free training unlocked",
          description:
            "You claimed a daily training reward. Queue a custom job here to level up your agent's game sense.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "[data-tour='training-create-custom-job']",
        popover: {
          title: "Create custom job",
          description:
            "Pick an agent below, then tap Create custom job to start a free training run for your fighter.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "[data-tour='training-fund-wallet']",
        popover: {
          title: "Fund your agent wallet",
          description:
            "Training uses $ARENA from your on-chain wallet on 0G Chain. ARENA lives directly in your wallet, there is no deposit or withdrawal flow here. Tap Open wallet to view balance and activity.",
          side: "bottom",
          align: "start",
        },
      },
    ],
    onNextClick: (_element, _step, { driver: driverObj }) => {
      const isLast = !driverObj.getNextStep();
      if (isLast) {
        markRewardTrainingTourDone();
        onOpenFundWallet();
        driverObj.destroy();
        return;
      }
      driverObj.moveNext();
    },
    onDestroyed: () => {
      markRewardTrainingTourDone();
    },
  });

  window.setTimeout(() => instance.drive(), 400);
}
