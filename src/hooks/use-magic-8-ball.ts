"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import magic8Ball from "../artifacts/contracts/Magic8Ball.sol/Magic8Ball.json";
import { assertNotNull, isPredictionTuple, MAGIC_8_BALL_ANSWERS } from "@/utils";
import type { PredictionResult } from "@/types";

const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
const CONTRACT_ABI = magic8Ball.abi;

export function useMagic8Ball() {
  const { isConnected, address } = useAccount();
  const [requestId, setRequestId] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | null>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  
  const { data: maxQuestionLength } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI, 
    functionName: "getMaxQuestionLength",
  });
  
  const { refetch: refetchPrediction } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getPredictionResult",
    args: requestId ? [requestId] : undefined,
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'PredictionRequested',
    enabled: !!pendingTxHash,
    onLogs(logs) {
      const relevantLogs = logs.filter(log => 
        log.transactionHash === pendingTxHash
      );
      
      if (relevantLogs.length > 0) {
        const log = relevantLogs[0];
        
        // topics[0] is the event signature, topics[1] is the first indexed param
        if (log.topics && log.topics.length > 1 && log.topics[1]) {
          const newRequestId = BigInt(log.topics[1]);
          setRequestId(newRequestId);
          setPendingTxHash(null);
        }
      }
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'PredictionResult',
    enabled: requestId !== null,
    async onLogs() {
      try {
        const { data: result } = await refetchPrediction({ 
          throwOnError: true 
        });

        if (isPredictionTuple(result) && result[0] === true) {
          setPrediction({
            fulfilled: result[0],
            outcomeIndex: Number(result[1]),
            player: result[2],
            question: result[3],
            answer: result[0] ? MAGIC_8_BALL_ANSWERS[Number(result[1])] : "",
          });
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching prediction:", err);
      }
    },
  });

  const askQuestion = useCallback(async (question: string) => {
    if (!isConnected) {
      setError("Wallet not connected");
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      assertNotNull(publicClient);
      
      const txResult = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "askQuestion",
        args: [question],
      });
      
      setPendingTxHash(txResult);
      return txResult;
    } catch (err) {
      console.error("Error asking question:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, publicClient, writeContractAsync]);

  const processedMaxQuestionLength = typeof maxQuestionLength === 'bigint' ? Number(maxQuestionLength) : 200;
  
  return {
    askQuestion,
    prediction,
    requestId,
    maxQuestionLength: processedMaxQuestionLength,
    loading,
    error,
    isConnected,
    address,
  };
}