"use client";

import { createConfig, http, WagmiProvider } from "wagmi";
import { hardhat, baseSepolia } from "wagmi/chains";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { envConfig } from "@/utils";

const { NEXT_PUBLIC_HARDHAT_RPC_URL, NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL } =
  envConfig;

const isDevelopment = process.env.NODE_ENV === "development";
export const config = createConfig({
  chains: isDevelopment ? [hardhat] : [baseSepolia],
  transports: {
    [hardhat.id]: http(NEXT_PUBLIC_HARDHAT_RPC_URL),
    [baseSepolia.id]: http(NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
