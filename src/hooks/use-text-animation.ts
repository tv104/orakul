import { useState, useRef, useEffect, useCallback } from "react";
import { ORAKUL_TRANSLATIONS } from "@/utils";

const FADE_OUT_DURATION = 1000;
const PAUSE_DURATION = 500;

export function useTextAnimation(isLoading: boolean, outcomeIndex: number | undefined) {
  const [displayText, setDisplayText] = useState(".");
  const [opacityClass, setOpacityClass] = useState("opacity-0");
  const [durationClass, setDurationClass] = useState("duration-fade-out");
  const prevOutcomeIndexRef = useRef<number | undefined>(undefined);
  const prevLoadingRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleLoading = useCallback(() => {
    setOpacityClass("opacity-0");
    setDurationClass("duration-fade-out");

    timerRef.current = setTimeout(() => {
      setDisplayText(". ");
      setOpacityClass("opacity-30");
    }, 200);
  }, []);

  const handleReset = useCallback(() => {
    setOpacityClass("opacity-0");
    setDurationClass("duration-fade-out");

    timerRef.current = setTimeout(() => {
      setDisplayText(". ");
    }, FADE_OUT_DURATION);
  }, []);

  const handleOutcome = useCallback((index: number) => {
    setOpacityClass("opacity-0");
    setDurationClass("duration-fade-out");

    timerRef.current = setTimeout(() => {
      setDisplayText(ORAKUL_TRANSLATIONS[index]);

      const pauseTimer = setTimeout(() => {
        setDurationClass("duration-fade-in");
        setOpacityClass("opacity-90");
      }, PAUSE_DURATION);

      return () => clearTimeout(pauseTimer);
    }, FADE_OUT_DURATION);
  }, []);

  useEffect(() => {
    if (isLoading && !prevLoadingRef.current) {
      handleLoading();
    } else if (
      !isLoading &&
      prevLoadingRef.current &&
      outcomeIndex === undefined
    ) {
      setOpacityClass("opacity-0");
      setDurationClass("duration-fade-out");
    } else if (prevOutcomeIndexRef.current !== outcomeIndex) {
      if (
        outcomeIndex === undefined &&
        prevOutcomeIndexRef.current !== undefined
      ) {
        handleReset();
      } else if (outcomeIndex !== undefined) {
        handleOutcome(outcomeIndex);
      }
    }

    prevLoadingRef.current = isLoading;
    prevOutcomeIndexRef.current = outcomeIndex;

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading, outcomeIndex, handleLoading, handleReset, handleOutcome]);

  return { displayText, opacityClass, durationClass };
}