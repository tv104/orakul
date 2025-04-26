"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { injected } from "wagmi/connectors";

import { useMagic8Ball } from "@/hooks";
import { assertNotUndefined } from "@/utils";
import { Button, TextInput } from "./";
import { useConnect } from "wagmi";

export const Magic8Ball = () => {
  const { connect } = useConnect();
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuestion, setSubmittedQuestion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    askQuestion,
    prediction,
    loading,
    error,
    isConnected,
    maxQuestionLength,
  } = useMagic8Ball();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (loading || isSubmitting) return;

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

  const handleEnter = () => {
    handleSubmit();
  };

  const disableInput = useMemo(() => {
    return loading || isSubmitting;
  }, [loading, isSubmitting]);

  if (!mounted) {
    // TODO initial UI state
    return <div className="max-w-xl mx-auto flex flex-col flex-1 w-full"></div>;
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col flex-1 w-full gap-5">
      {!submittedQuestion && (
        <form onSubmit={handleSubmit} className="mt-auto flex flex-col gap-5">
          <TextInput
            ref={inputRef}
            label="Ask any question.."
            value={question}
            maxLength={maxQuestionLength}
            disabled={disableInput}
            onChange={(e) => setQuestion(e.target.value)}
            autoComplete="off"
            required
            onEnter={handleEnter}
          />

          <Button
            type="submit"
            size="large"
            disabled={loading || isSubmitting}
            className="w-full"
          >
            {loading || isSubmitting
              ? isSubmitting
                ? "Waiting for approval..."
                : "Asking..."
              : "Ask the Magic 8 Ball"}
          </Button>
        </form>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {submittedQuestion && (
        <div className="p-4 bg-green-100 text-green-700 rounded">
          {question}
        </div>
      )}

      {submittedQuestion && !prediction?.fulfilled && (
        <div className="p-4 bg-green-100 text-green-700 rounded">
          Waiting for prediction...
        </div>
      )}

      {prediction && prediction.fulfilled && (
        <p className="text-xl font-bold text-blue-600">{prediction.answer}</p>
      )}
    </div>
  );
};
