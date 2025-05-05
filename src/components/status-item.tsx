import { cn } from "@/utils";
import { FC } from "react";

type StatusItemProps = {
  message: string;
  isCompleted: boolean;
  isUpcoming: boolean;
};

export const StatusItem: FC<StatusItemProps> = ({
  message,
  isCompleted,
  isUpcoming,
}) =>
  message.length > 0 && (
    <li
      className={cn(
        "text-sm text-shadow-sm/30 text-center opacity-100 transition-colors relative mx-auto duration-short",
        {
          "text-green-400": isCompleted,
          "text-gray-400": isUpcoming,
        }
      )}
    >
      <span className="inline-flex gap-2">
        {message}
        <span
          className={cn(
            "text-green-400 opacity-0 transition-opacity duration-short",
            {
              "opacity-100": isCompleted,
            }
          )}
        >
          ✓
        </span>
      </span>
    </li>
  );
