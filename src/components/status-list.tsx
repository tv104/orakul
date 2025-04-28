import { cn } from "@/utils";

export const checklistSteps = {
  init: "Transaction lobbed into the mempool abyss",
  waiting_for_tx_mined: "Consulting the blockchain oracles...",
  waiting_for_event_prediction_result: "Shaking the magic 8 ball...",
  completed: "", // intentionally left blank, like your wallet after gas fees
};
const stepOrder = Object.keys(checklistSteps);

interface StatusListProps {
  activeStep: keyof typeof checklistSteps;
  className?: string;
}

export const StatusList = ({ activeStep, className }: StatusListProps) => {
  return (
    <ol className={cn("flex flex-col gap-0 w-full", className)}>
      {Object.entries(checklistSteps).map(([key, value]) => {
        const isCompleted =
          key === "completed"
            ? true
            : stepOrder.indexOf(key) < stepOrder.indexOf(activeStep);
        const isUpcoming =
          stepOrder.indexOf(key) > stepOrder.indexOf(activeStep);

        return (
          value.length > 0 && (
            <li
              key={key}
              className={cn(
                "text-sm text-center opacity-100 transition-colors relative mx-auto duration-200",
                {
                  "text-green-400": isCompleted,
                  "text-gray-200": isUpcoming,
                }
              )}
            >
              <span className="inline-flex gap-2">
                {value}
                <span
                  className={cn(
                    "text-green-400 opacity-0 transition-opacity duration-200",
                    {
                      "opacity-100": isCompleted,
                    }
                  )}
                >
                  ✓
                </span>
              </span>
            </li>
          )
        );
      })}
    </ol>
  );
};
