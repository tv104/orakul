"use client";

import { useRef, useState } from "react";
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

  const {
    activeStep,
    askQuestion,
    error,
    isConnected,
    maxQuestionLength,
    outcomeIndex,
  } = useMagic8Ball();

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

  const formStyles = cn(
    "flex flex-col gap-5 transition-position duration-2000 ease-out relative",
    {
      "-translate-y-10": submittedQuestion,
    }
  );

  // using `filter-opacity` and `transition-all` to avoid clashing with internal opacity.
  const fadeOutStyles = cn("filter-[opacity(100%)]", {
    "transition-all duration-2000 ease-out filter-[opacity(0%)]":
      submittedQuestion,
  });

  const fadeInStyles = cn("filter-[opacity(0%)]", {
    "transition-all duration-2000 ease-out filter-[opacity(100%)]":
      submittedQuestion,
  });

  return (
    <div className="max-w-xl mx-auto flex flex-col flex-1 w-full gap-5 justify-center relative">
      <form onSubmit={handleSubmit} className={formStyles}>
        <TextInput
          ref={inputRef}
          label="Type your question"
          value={question}
          maxLength={maxQuestionLength}
          disabled={isSubmitting || submittedQuestion}
          onChange={(e) => setQuestion(e.target.value)}
          autoComplete="off"
          required
          onEnter={() => handleSubmit()}
          labelClassName={fadeOutStyles}
          maxLengthClassName={fadeOutStyles}
        />

        <Button
          type="submit"
          size="large"
          disabled={isSubmitting || submittedQuestion}
          className={cn("mx-auto", fadeOutStyles)}
        >
          {isSubmitting || submittedQuestion
            ? "Waiting for approval..."
            : "Ask the Magic 8 Ball"}
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {outcomeIndex !== undefined && (
        <div className="p-4 bg-green-100 text-green-700 rounded">
          {MAGIC_8_BALL_ANSWERS[outcomeIndex]}
        </div>
      )}

      <StatusList
        activeStep={activeStep}
        className={activeStep === "completed" ? fadeOutStyles : fadeInStyles}
      />
    </div>
  );
};
