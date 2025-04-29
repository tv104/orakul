"use client";

import { useState } from "react";

import { useOrakulContext } from "@/providers";
import { StatusList } from "../status-list";
import { OrakulForm } from "./orakul-form";

export const Orakul = () => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { activeStep } = useOrakulContext();

  return (
    <div className="max-w-xl mx-auto flex flex-col flex-1 w-full gap-7 relative">
      <OrakulForm
        hasSubmitted={hasSubmitted}
        setSubmittedQuestion={setHasSubmitted}
      />

      <StatusList
        activeStep={activeStep}
        hidden={activeStep === "completed"}
        visible={hasSubmitted && activeStep !== "completed"}
        className="mt-auto"
      />
    </div>
  );
};
