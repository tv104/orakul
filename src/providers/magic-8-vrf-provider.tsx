"use client";

import { createContext, ReactNode, useContext } from "react";
import { useMagic8VRF } from "@/hooks";

type Magic8VRFContextType = ReturnType<typeof useMagic8VRF> | undefined;
const Magic8VRFContext = createContext<Magic8VRFContextType>(undefined);

export function Magic8VRFProvider({ children }: { children: ReactNode }) {
  const magic8VRFValue = useMagic8VRF();

  return (
    <Magic8VRFContext.Provider value={magic8VRFValue}>
      {children}
    </Magic8VRFContext.Provider>
  );
}

export function useMagic8VRFContext() {
  const context = useContext(Magic8VRFContext);
  if (context === undefined) {
    throw new Error(
      "useMagic8VRFContext must be used within a Magic8VRFProvider"
    );
  }
  return context;
}
