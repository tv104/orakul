"use client";

import { useState } from "react";

import { useMagic8VRF } from "@/hooks";
import { cn } from "@/utils";
import { StatusList } from "./status-list";
import { Magic8Form } from "./magic-8-form";

export const Magic8VRF = () => {
  const [submittedQuestion, setSubmittedQuestion] = useState(false);

  const {
    activeStep,
    askQuestion,
    error,
    isConnected,
    maxQuestionLength,
    outcomeIndex,
    reset,
  } = useMagic8VRF();

  return (
    <div className="max-w-xl mx-auto flex flex-col flex-1 w-full gap-7 relative">
      <Magic8Form
        isConnected={isConnected}
        maxQuestionLength={maxQuestionLength}
        outcomeIndex={outcomeIndex}
        askQuestion={askQuestion}
        reset={reset}
        submittedQuestion={submittedQuestion}
        setSubmittedQuestion={setSubmittedQuestion}
      />

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <StatusList
        activeStep={activeStep}
        className={cn(
          "filter-opacity-0 mt-auto",
          activeStep === "completed"
            ? "fade-out"
            : submittedQuestion
            ? "fade-in"
            : "",
          "ease-in"
        )}
      />
    </div>
  );
};
