"use client";

import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "./button";
import { useMemo } from "react";

export const ConnectWallet = () => {
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: injected() });
    }
  };

  const buttonText = useMemo(() => {
    if (isConnected) {
      return `Disconnect ${address?.slice(0, 4)}...${address?.slice(-2)}`;
    }
    return "Connect Wallet";
  }, [isConnected, address]);

  return (
    <Button onClick={handleClick} variant="outlined">
      {buttonText}
    </Button>
  );
};
