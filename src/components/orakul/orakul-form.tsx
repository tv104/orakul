"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { assertNotUndefined, cn, ORAKUL_TRANSLATIONS } from "@/utils";
import { TextInput } from "../text-input";
import { useOrakulContext } from "@/providers";
import { OrakulButtons } from "./orakul-buttons";
import { useNotifications } from "@/hooks";

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
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const { showInfo, notifyUser } = useNotifications();

  const hasOutcomeIndex = outcomeIndex !== undefined;
  const fullAnswer = hasOutcomeIndex
    ? `\n\n🔮 ${ORAKUL_TRANSLATIONS[outcomeIndex]}`
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
    }, 100);

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
    setDisplayedAnswer("");
  };

  const formStyles = cn(
    "mt-auto flex flex-col gap-8 transition-position duration-2000 ease-out relative",
    {
      "-translate-y-10": hasSubmitted,
    }
  );

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} className={formStyles}>
      <TextInput
        ref={inputRef}
        label="Type your question"
        value={textInputValue}
        maxLength={maxQuestionLength}
        disabled={isSubmitting || hasSubmitted}
        onChange={(e) => setQuestion(e.target.value)}
        autoComplete="off"
        required
        onEnter={() => handleSubmit()}
        labelClassName={hasSubmitted ? "fade-out" : ""}
        maxLengthClassName={hasSubmitted ? "fade-out" : ""}
      />

      <OrakulButtons
        hasSubmitted={hasSubmitted}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onReset={handleReset}
        isPostReveal={
          hasOutcomeIndex && displayedAnswer.length === fullAnswer.length
        }
      />
    </form>
  );
};
