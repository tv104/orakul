"use client";

import { useCallback, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import magic8VRF from "../artifacts/contracts/Magic8VRF.sol/Magic8VRF.json";
import { isNewRequestIdInFirstLog, isOutcomeIndexInFirstLog } from "@/utils";
import { envConfig } from "@/utils";
import { checklistSteps } from "@/components";

const { NEXT_PUBLIC_CONTRACT_ADDRESS } = envConfig;
const CONTRACT_ABI = magic8VRF.abi;

export function useMagic8Ball() {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [requestId, setRequestId] = useState<`0x${string}` | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [outcomeIndex, setOutcomeIndex] = useState<number | undefined>(undefined);
  const [activeStep, setActiveStep] = useState<keyof typeof checklistSteps>("init"); // UI state
  
  const { data: maxQuestionLength } = useReadContract({
    address: NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: CONTRACT_ABI, 
    functionName: "getMaxQuestionLength",
  });

  useWatchContractEvent({
    address: NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'PredictionRequested',
    enabled: !!pendingTxHash,
    onLogs(logs) {
      const relevantLogs = logs.filter(log => 
        log.transactionHash === pendingTxHash
      );

      if (isNewRequestIdInFirstLog(relevantLogs)) {
        setRequestId(relevantLogs[0].topics[1]);
        setPendingTxHash(undefined);
        setActiveStep("waiting_for_event_prediction_result");
      }
    },
  });

  useWatchContractEvent({
    address: NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'PredictionResult',
    enabled: requestId !== undefined,
    async onLogs(logs) {
      const relevantLogs = logs.filter(log => 
        log.topics[1] === requestId
      );

      if (isOutcomeIndexInFirstLog(relevantLogs)) {
        setOutcomeIndex(relevantLogs[0].args.outcomeIndex);
        setRequestId(undefined);
        setActiveStep("completed");
      }
    },
  });

  const askQuestion = useCallback(async (question: string) => {
    if (!isConnected) {
      setError("Wallet not connected");
      return null;
    }
    
    try {
      setError(null);
      const txResult = await writeContractAsync({
        address: NEXT_PUBLIC_CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "askQuestion",
        args: [question],
      });
      
      setActiveStep("waiting_for_tx_mined");
      setPendingTxHash(txResult);
      return txResult;
    } catch (err) {
      console.error("Error asking question:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    }
  }, [isConnected, writeContractAsync]);

  const reset = useCallback(() => {
    setRequestId(undefined);
    setError(null);
    setPendingTxHash(undefined);
    setOutcomeIndex(undefined);
    setActiveStep("init");
  }, []);

  const processedMaxQuestionLength = typeof maxQuestionLength === 'bigint' || typeof maxQuestionLength === 'number' ? Number(maxQuestionLength) : 120;
  
  return {
    activeStep,
    askQuestion,
    error,
    isConnected,
    maxQuestionLength: processedMaxQuestionLength,
    outcomeIndex,
    reset,
  };
}