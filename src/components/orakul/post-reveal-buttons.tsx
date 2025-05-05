"use client";

import { cn } from "@/utils";
import { Button } from "../button";

interface PostRevealButtonsProps {
  hasSubmitted: boolean;
  onReset: () => void;
  isPostReveal: boolean;
}

export const PostRevealButtons = ({
  hasSubmitted,
  onReset,
  isPostReveal,
}: PostRevealButtonsProps) => {
  return (
    <div
      className={cn(
        "flex gap-5 justify-center fixed bottom-8 left-0 right-0 !delay-2000",
        {
          "z-1 fade-in": isPostReveal,
          "z-0 fade-out !delay-0": !isPostReveal,
        }
      )}
    >
      <Button type="button" size="large" disabled>
        View history
      </Button>
      <Button
        type="reset"
        size="large"
        variant="outlined"
        disabled={!hasSubmitted}
        onClick={onReset}
      >
        Ask another question
      </Button>
    </div>
  );
};
