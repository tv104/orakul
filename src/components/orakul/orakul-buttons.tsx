"use client";

import { cn } from "@/utils";
import { Button } from "../button";
import { useOrakulContext } from "@/providers";

interface OrakulButtonsProps {
  submittedQuestion: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

export const OrakulButtons = ({
  submittedQuestion,
  isSubmitting,
  onSubmit,
  onReset,
}: OrakulButtonsProps) => {
  const { outcomeIndex } = useOrakulContext();
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
            : "Consult the Orakul"}
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
