"use client";

import { useRef, useState } from "react";
import { assertNotUndefined, cn } from "@/utils";
import { TextInput } from "../text-input";
import { useOrakulContext } from "@/providers";
import { useNotifications } from "@/hooks";
import { Button } from "../button";
import { PostRevealButtons } from "./post-reveal-buttons";

interface OrakulFormProps {
  hasSubmitted: boolean;
  setSubmittedQuestion: (value: boolean) => void;
}

export const OrakulForm = ({
  hasSubmitted,
  setSubmittedQuestion,
}: OrakulFormProps) => {
  const { maxQuestionLength, outcomeIndex, askQuestion, reset } =
    useOrakulContext();

  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { showInfo, notifyUser } = useNotifications();

  const hasOutcomeIndex = outcomeIndex !== undefined;

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (isSubmitting || hasSubmitted) return;

    if (!question.trim()) {
      showInfo("Question required");
      inputRef.current?.focus();
      return;
    }

    try {
      setIsSubmitting(true);
      const requestId = await askQuestion(question); // wallet detection/tx is handled here
      assertNotUndefined(requestId, "Request ID is undefined");
      setSubmittedQuestion(true);
    } catch (error) {
      setSubmittedQuestion(false);
      notifyUser(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSubmittedQuestion(false);
    setQuestion("");
  };

  const formStyles = cn(
    "mt-auto flex flex-col gap-8 transition-position duration-2000 ease-out relative",
    {
      "-translate-y-10": hasSubmitted,
    }
  );

  return (
    <>
      <form
        onSubmit={handleSubmit}
        onReset={handleReset}
        className={formStyles}
      >
        <TextInput
          ref={inputRef}
          label="Type your question"
          value={question}
          maxLength={maxQuestionLength}
          disabled={isSubmitting || hasSubmitted}
          onChange={(e) => setQuestion(e.target.value)}
          autoComplete="off"
          required
          onEnter={() => handleSubmit()}
          labelClassName={hasSubmitted ? "fade-out" : ""}
          maxLengthClassName={hasSubmitted ? "fade-out" : ""}
        />

        <Button
          type="submit"
          size="large"
          disabled={isSubmitting || hasSubmitted}
          onClick={() => handleSubmit()}
          className={cn("mx-auto", {
            "fade-out": hasSubmitted,
          })}
        >
          Ask
        </Button>
      </form>

      <PostRevealButtons
        hasSubmitted={hasSubmitted}
        onReset={handleReset}
        isPostReveal={hasOutcomeIndex}
      />
    </>
  );
};
