"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { injected } from "wagmi/connectors";
import { useConnect } from "wagmi";

import { assertNotUndefined, cn, MAGIC_8_VRF_TRANSLATIONS } from "@/utils";
import { Button, TextInput } from "./";

interface Magic8FormProps {
  isConnected: boolean;
  maxQuestionLength: number;
  outcomeIndex?: number;
  askQuestion: (question: string) => Promise<string | null>;
  reset: () => void;
  submittedQuestion: boolean;
  setSubmittedQuestion: (value: boolean) => void;
}

export const Magic8Form = ({
  isConnected,
  maxQuestionLength,
  outcomeIndex,
  askQuestion,
  reset,
  submittedQuestion,
  setSubmittedQuestion,
}: Magic8FormProps) => {
  const { connect } = useConnect();
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [displayedAnswer, setDisplayedAnswer] = useState("");

  const hasOutcomeIndex = outcomeIndex !== undefined;
  const fullAnswer = hasOutcomeIndex
    ? `\n\n🔮 ${MAGIC_8_VRF_TRANSLATIONS[outcomeIndex]}`
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
    "mt-auto flex flex-col gap-8 transition-position duration-2000 ease-out relative",
    {
      "-translate-y-10": submittedQuestion,
    }
  );

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} className={formStyles}>
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
        labelClassName={submittedQuestion ? "fade-out" : ""}
        maxLengthClassName={submittedQuestion ? "fade-out" : ""}
      />

      <div
        className={cn("flex flex-row gap-5 justify-center", {
          "fade-out": submittedQuestion,
          "fade-in": hasOutcomeIndex && displayedAnswer === fullAnswer,
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
          >
            Ask another question
          </Button>
        )}
      </div>
    </form>
  );
};
