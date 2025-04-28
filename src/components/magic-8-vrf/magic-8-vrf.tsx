"use client";

import { useState } from "react";

import { useMagic8VRFContext } from "@/providers";
import { StatusList } from "../status-list";
import { Magic8Form } from "./magic-8-form";

export const Magic8VRF = () => {
  const [submittedQuestion, setSubmittedQuestion] = useState(false);
  const { activeStep, error } = useMagic8VRFContext();

  return (
    <div className="max-w-xl mx-auto flex flex-col flex-1 w-full gap-7 relative">
      <Magic8Form
        submittedQuestion={submittedQuestion}
        setSubmittedQuestion={setSubmittedQuestion}
      />

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <StatusList
        activeStep={activeStep}
        hidden={activeStep === "completed"}
        visible={submittedQuestion && activeStep !== "completed"}
        className="mt-auto"
      />
    </div>
  );
};
