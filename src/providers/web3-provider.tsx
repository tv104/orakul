"use client";

import { createConfig, http, WagmiProvider } from "wagmi";
import { hardhat } from "wagmi/chains";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { envConfig } from "@/utils";

const { NEXT_PUBLIC_HARDHAT_RPC_URL } = envConfig;

export const wagmiConfig = createConfig({
  chains: [hardhat],
  transports: {
    [hardhat.id]: http(NEXT_PUBLIC_HARDHAT_RPC_URL),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
