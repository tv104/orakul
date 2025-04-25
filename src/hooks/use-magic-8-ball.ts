"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import magic8Ball from "../artifacts/contracts/Magic8Ball.sol/Magic8Ball.json";
import { toEventSelector } from "viem";
import { assertNotNull, isPredictionTuple, MAGIC_8_BALL_ANSWERS } from "@/utils";
import type { PredictionResult } from "@/types";

const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
const CONTRACT_ABI = magic8Ball.abi;

export function useMagic8Ball() {
  const { isConnected, address } = useAccount();
  const [requestId, setRequestId] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  
  const { data: maxQuestionLength } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI, 
    functionName: "getMaxQuestionLength",
  });
  
  const { data: prediction, refetch: refetchPrediction } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getPredictionResult",
    args: requestId ? [requestId] : undefined,
  });
  
  const fetchPrediction = useCallback(async (): Promise<void> => {
    const timeout = 30_000;
    const startTime = Date.now();
    
    const checkPrediction = async (): Promise<void> => {
      try {
        const { data: result } = await refetchPrediction();
        
        if (isPredictionTuple(result) && result[0] === true) {
          return;
        }
        
        if (Date.now() - startTime >= timeout) {
          throw new Error(`Timeout (${timeout}ms) while waiting for prediction`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1_000));
        return checkPrediction();
      } catch (err) {
        console.error("Error fetching prediction:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };
    
    return checkPrediction();
  }, [refetchPrediction]);
  
  const askQuestion = useCallback(async (question: string) => {
    if (!isConnected) {
      setError("Wallet not connected");
      return;
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
      
      const { logs } = await publicClient.getTransactionReceipt({
        hash: txResult,
      });
      
      const event = logs.find(
        (log) => 
          log.topics[0] === 
        toEventSelector("PredictionRequested(uint256,address,string)")
      );
      
      if (event && event.topics[1]) {
        const requestId = BigInt(event.topics[1]);
        setRequestId(requestId);
        fetchPrediction();
        
        return requestId;
      }
    } catch (err) {
      console.error("Error asking question:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [fetchPrediction, isConnected, publicClient, writeContractAsync]);
  
  const processedPrediction: PredictionResult | undefined = isPredictionTuple(prediction)
    ? {
      fulfilled: prediction[0],
      outcomeIndex: Number(prediction[1]),
      player: prediction[2],
      question: prediction[3],
      answer: prediction[0] ? MAGIC_8_BALL_ANSWERS[Number(prediction[1])] : "",
    }
    : undefined;

  const processedMaxQuestionLength = typeof maxQuestionLength === 'bigint' ? Number(maxQuestionLength) : 200;
  
  return {
    askQuestion,
    prediction: processedPrediction,
    requestId,
    maxQuestionLength: processedMaxQuestionLength,
    loading,
    error,
    isConnected,
    address,
    fetchPrediction
  };
}