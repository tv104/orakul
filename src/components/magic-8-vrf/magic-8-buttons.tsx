"use client";

import { cn } from "@/utils";
import { Button } from "../button";
import { useMagic8VRFContext } from "@/providers";

interface Magic8ButtonsProps {
  submittedQuestion: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

export const Magic8Buttons = ({
  submittedQuestion,
  isSubmitting,
  onSubmit,
  onReset,
}: Magic8ButtonsProps) => {
  const { outcomeIndex } = useMagic8VRFContext();
  const hasOutcomeIndex = outcomeIndex !== undefined;

  return (
    <div
      className={cn("flex flex-row gap-5 justify-center", {
        "fade-out": submittedQuestion,
        "fade-in": hasOutcomeIndex,
      })}
    >
      {hasOutcomeIndex ? (
        <Button type="button" size="large" disabled>
          View history
        </Button>
      ) : (
        <Button
          type="submit"
          size="large"
          disabled={isSubmitting || submittedQuestion}
          onClick={onSubmit}
        >
          {isSubmitting || submittedQuestion
            ? "Waiting for approval..."
            : "Ask the Magic 8 VRF"}
        </Button>
      )}

      {hasOutcomeIndex && (
        <Button
          type="reset"
          size="large"
          variant="outlined"
          disabled={!submittedQuestion}
          onClick={onReset}
        >
          Ask another question
        </Button>
      )}
    </div>
  );
};
