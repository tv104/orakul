"use client";

import { cn } from "@/utils";
import { Button } from "../button";

interface OrakulButtonsProps {
  hasSubmitted: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onReset: () => void;
  isPostReveal: boolean;
}

export const OrakulButtons = ({
  hasSubmitted,
  isSubmitting,
  onSubmit,
  onReset,
  isPostReveal,
}: OrakulButtonsProps) => {
  return (
    <div
      className={cn("flex flex-row gap-5 justify-center", {
        "fade-out": hasSubmitted,
        "fade-in": isPostReveal,
      })}
    >
      {isPostReveal ? (
        <Button type="button" size="large" disabled>
          View history
        </Button>
      ) : (
        <Button
          type="submit"
          size="large"
          disabled={isSubmitting || hasSubmitted}
          onClick={onSubmit}
        >
          Ask
        </Button>
      )}

      {isPostReveal && (
        <Button
          type="reset"
          size="large"
          variant="outlined"
          disabled={!hasSubmitted}
          onClick={onReset}
        >
          Ask another question
        </Button>
      )}
    </div>
  );
};
