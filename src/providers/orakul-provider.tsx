"use client";

import { createContext, ReactNode, useContext } from "react";
import { useOrakul } from "@/hooks";

type OrakulContextType = ReturnType<typeof useOrakul> | undefined;
const OrakulContext = createContext<OrakulContextType>(undefined);

export function OrakulProvider({ children }: { children: ReactNode }) {
  const orakulValue = useOrakul();

  return (
    <OrakulContext.Provider value={orakulValue}>
      {children}
    </OrakulContext.Provider>
  );
}

export function useOrakulContext() {
  const context = useContext(OrakulContext);
  if (context === undefined) {
    throw new Error("useOrakulContext must be used within a OrakulProvider");
  }
  return context;
}
