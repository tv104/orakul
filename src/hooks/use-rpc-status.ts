"use client";

import { useState, useEffect } from 'react';
import { getPublicClient } from 'wagmi/actions';
import { wagmiConfig } from '@/providers';

export function useRpcStatus() {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const checkConnection: () => Promise<boolean> = async () => {
        try {
            setError(null);
            const client = getPublicClient(wagmiConfig);
            await client.getChainId();
            setIsConnected(true);
            return true;
        } catch (err) {
            console.error('RPC connection error:', err);
            setIsConnected(false);
            setError(err instanceof Error ? err.message : 'Failed to connect to RPC');
            return false;
        }
    };
    
    useEffect(() => {
        checkConnection();
    }, []);
    
    return { isConnected, checkConnection, error };
}