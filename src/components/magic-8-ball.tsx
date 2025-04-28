"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { injected } from "wagmi/connectors";

import { useMagic8Ball } from "@/hooks";
import { assertNotUndefined, cn, MAGIC_8_BALL_ANSWERS } from "@/utils";
import { Button, TextInput } from "./";
import { useConnect } from "wagmi";
import { StatusList } from "./status-list";

export const Magic8Ball = () => {
  const { connect } = useConnect();
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuestion, setSubmittedQuestion] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [displayedAnswer, setDisplayedAnswer] = useState("");

  const {
    activeStep,
    askQuestion,
    error,
    isConnected,
    maxQuestionLength,
    outcomeIndex,
    reset,
  } = useMagic8Ball();

  const hasOutcomeIndex = outcomeIndex !== undefined;
  const fullAnswer = hasOutcomeIndex
    ? `\n\n🔮 ${MAGIC_8_BALL_ANSWERS[outcomeIndex]}`
    : "";

  useLayoutEffect(() => {
    if (!hasOutcomeIndex) {
      setDisplayedAnswer("");
      return;
    }

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullAnswer.length) {
        setDisplayedAnswer(
          fullAnswer.slice(0, currentIndex) +
            (currentIndex < fullAnswer.length ? "▌" : "")
        );
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, [hasOutcomeIndex, fullAnswer]);

  const textInputValue = useMemo(() => {
    if (hasOutcomeIndex) {
      return question + displayedAnswer;
    }
    return question;
  }, [hasOutcomeIndex, question, displayedAnswer]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (isSubmitting || submittedQuestion) return;

    if (!question.trim()) {
      alert("Question required");
      inputRef.current?.focus();
      return;
    }

    if (!isConnected) {
      alert("Please connect your wallet first");
      connect({ connector: injected() });
      return;
    }

    try {
      setIsSubmitting(true);
      const requestId = await askQuestion(question); // this triggers the wallet
      assertNotUndefined(requestId, "Request ID is undefined");
      setSubmittedQuestion(true);
    } catch (error) {
      console.error("Transaction was rejected or failed:", error);
      setSubmittedQuestion(false);
      // TODO UI error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSubmittedQuestion(false);
    setQuestion("");
    setDisplayedAnswer("");
    inputRef.current?.focus();
  };

  const formStyles = cn(
    "mt-auto flex flex-col gap-7 transition-position duration-2000 ease-out relative",
    {
      "-translate-y-10": submittedQuestion,
    }
  );

  // using `filter-opacity` and `transition-all` to avoid clashing with internal styles.
  const fadeOutStyles = cn("filter-[opacity(100%)]", {
    "transition-all duration-2000 ease-out filter-[opacity(0%)]":
      submittedQuestion,
  });

  const fadeInStyles = cn("filter-[opacity(0%)]", {
    "transition-all duration-2000 ease-out filter-[opacity(100%)]":
      submittedQuestion,
  });

  return (
    <div className="max-w-xl mx-auto flex flex-col flex-1 w-full gap-7 relative">
      <form
        onSubmit={handleSubmit}
        onReset={handleReset}
        className={formStyles}
      >
        <TextInput
          ref={inputRef}
          label="Type your question"
          value={textInputValue}
          maxLength={maxQuestionLength}
          disabled={isSubmitting || submittedQuestion}
          onChange={(e) => setQuestion(e.target.value)}
          autoComplete="off"
          required
          onEnter={() => handleSubmit()}
          labelClassName={fadeOutStyles}
          maxLengthClassName={fadeOutStyles}
        />

        <div
          className={cn(
            "flex flex-row gap-5 justify-center",
            submittedQuestion && fadeOutStyles,
            hasOutcomeIndex && displayedAnswer === fullAnswer && fadeInStyles
          )}
        >
          {hasOutcomeIndex ? (
            <Button
              type="button"
              size="large"
              disabled={isSubmitting || submittedQuestion}
            >
              View history
            </Button>
          ) : (
            <Button
              type="submit"
              size="large"
              disabled={isSubmitting || submittedQuestion}
            >
              {isSubmitting || submittedQuestion
                ? "Waiting for approval..."
                : "Ask the Magic 8 Ball"}
            </Button>
          )}

          {hasOutcomeIndex && (
            <Button
              type="reset"
              size="large"
              variant="outlined"
              disabled={!submittedQuestion}
            >
              Ask another question
            </Button>
          )}
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <StatusList
        activeStep={activeStep}
        className={cn(
          activeStep === "completed" ? fadeOutStyles : fadeInStyles,
          "mt-auto ease-in"
        )}
      />
    </div>
  );
};
