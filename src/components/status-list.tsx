import { cn } from "@/utils";
import { useCallback } from "react";
import { StatusItem } from "./status-item";

const checklistSteps = {
  init: "Transaction lobbed into the mempool abyss",
  waiting_for_tx_mined: "Miners extracting MEV from your hopium",
  waiting_for_event_prediction_result:
    "Oracle hamsters running on their wheels...",
  completed: "", // intentionally left blank, like your wallet after gas fees
};
const stepOrder = Object.keys(checklistSteps);
export type StepKey = keyof typeof checklistSteps;

interface StatusListProps {
  activeStep: StepKey;
  className?: string;
  visible?: boolean;
}

export const StatusList = ({
  activeStep,
  className,
  visible,
}: StatusListProps) => {
  const getStepStatus = useCallback(
    (key: string) => {
      const activeIndex = stepOrder.indexOf(activeStep);
      const currentIndex = stepOrder.indexOf(key);

      return {
        isCompleted: key === "completed" ? true : currentIndex < activeIndex,
        isUpcoming: currentIndex > activeIndex,
      };
    },
    [activeStep]
  );

  return (
    <ol
      className={cn(
        "flex flex-col gap-0 w-full filter-opacity-0 ease-in transition-filter delay-300 duration-1000",
        { "fade-in": visible },
        className
      )}
    >
      {Object.entries(checklistSteps).map(([key, value]) => {
        const { isCompleted, isUpcoming } = getStepStatus(key);

        return (
          <StatusItem
            key={key}
            message={value}
            isCompleted={isCompleted}
            isUpcoming={isUpcoming}
          />
        );
      })}
    </ol>
  );
};
