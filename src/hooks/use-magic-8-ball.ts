"use client";

import { useCallback, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import magic8Ball from "../artifacts/contracts/Magic8Ball.sol/Magic8Ball.json";
import { assertValidAddress, isOutcomeIndexInLog } from "@/utils";
import { envConfig } from "@/utils";
import { checklistSteps } from "@/components";

const { NEXT_PUBLIC_CONTRACT_ADDRESS } = envConfig;
const CONTRACT_ABI = magic8Ball.abi;

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
      
      if (relevantLogs.length > 0) {
        const log = relevantLogs[0];
        
        // topics[0] = event signature, topics[1] = first indexed param
        if (log.topics && log.topics.length > 1 && log.topics[1]) {
          const newRequestId = log.topics[1] as `0x${string}`;
          assertValidAddress(newRequestId);
          setActiveStep("waiting_for_event_prediction_result");
          setRequestId(newRequestId);
          setPendingTxHash(undefined);
        }
      }
    },
  });

  useWatchContractEvent({
    address: NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'PredictionResult',
    enabled: requestId !== undefined,
    async onLogs(logs) {
      console.log("logs", logs);
      const relevantLogs = logs.filter(log => 
        log.topics[1] === requestId
      );

      if (relevantLogs.length > 0) {
        const log = relevantLogs[0];

        if (isOutcomeIndexInLog(log)) {
          setOutcomeIndex(log.args.outcomeIndex);	
          setRequestId(undefined);
          setActiveStep("completed");
        } else {
          throw new Error("Invalid log format: missing args or args is not an object");
        }
      } else {
        console.error("No relevant logs found");
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

  const processedMaxQuestionLength = typeof maxQuestionLength === 'bigint' || typeof maxQuestionLength === 'number' ? Number(maxQuestionLength) : 200;
  
  return {
    activeStep,
    askQuestion,
    error,
    isConnected,
    maxQuestionLength: processedMaxQuestionLength,
    requestId,
    outcomeIndex
  };
}