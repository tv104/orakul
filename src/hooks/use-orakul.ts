"use client";

import { useCallback, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent, injected, useConnect } from "wagmi";
import orakul from "../artifacts/contracts/Orakul.sol/Orakul.json";
import { isOutcomeIndexLogForRequestId, isRequestIdLogForTransaction } from "@/utils";
import { envConfig } from "@/utils";
import { type StepKey } from "@/components";
import { useRpcStatus } from "@/hooks";

const { NEXT_PUBLIC_CONTRACT_ADDRESS } = envConfig;
const CONTRACT_ABI = orakul.abi;

export function useOrakul() {
  const { isConnected,  } = useAccount();
  const { connectAsync } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const { isConnected: isRpcConnected, checkConnection } = useRpcStatus();
  const [isLoading, setIsLoading] = useState(false);
  
  const [requestId, setRequestId] = useState<`0x${string}` | undefined>(undefined);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [outcomeIndex, setOutcomeIndex] = useState<number | undefined>(undefined);
  const [activeStep, setActiveStep] = useState<StepKey>("init"); // UI state
  
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
      if (pendingTxHash && isRequestIdLogForTransaction(logs, pendingTxHash)) {
        setRequestId(logs[0].topics[1]);
        setPendingTxHash(undefined);
        setActiveStep("waiting_for_event_prediction_result");
      }
    },
  });
  
  useWatchContractEvent({
    address: NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'PredictionResult',
    enabled: !!requestId,
    async onLogs(logs) {
      if (requestId && isOutcomeIndexLogForRequestId(logs, requestId)) {
        setOutcomeIndex(logs[0].args.outcomeIndex);
        setRequestId(undefined);
        setActiveStep("completed");
        setIsLoading(false);
      }
    },
  });
  
  const askQuestion = useCallback(async (question: string) => {
    try {
      if (!isConnected) {
        await connectAsync({
          connector: injected(),
        });
      }
      
      if (!isRpcConnected) {
        // we should already be connected, but retry just in case
        const result = await checkConnection();
        if (!result) {
          throw new Error("Failed to connect to RPC");
        }
      }
      
      const txResult = await writeContractAsync({
        address: NEXT_PUBLIC_CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "askQuestion",
        args: [question],
      });

      setIsLoading(true);
      setActiveStep("waiting_for_tx_mined");
      setPendingTxHash(txResult);
      return txResult;
    } catch (err) {
      setIsLoading(false);
      throw err; // let ui handle the error
    }
  }, [isConnected, isRpcConnected, writeContractAsync, connectAsync, checkConnection]);
  
  const reset = useCallback(() => {
    setRequestId(undefined);
    setPendingTxHash(undefined);
    setOutcomeIndex(undefined);
    setActiveStep("init");
  }, []);
  
  const processedMaxQuestionLength = typeof maxQuestionLength === 'bigint' || typeof maxQuestionLength === 'number' ? Number(maxQuestionLength) : 120;
  
  return {
    activeStep,
    askQuestion,
    isConnected,
    maxQuestionLength: processedMaxQuestionLength,
    outcomeIndex,
    reset,
    isLoading,
  };
}