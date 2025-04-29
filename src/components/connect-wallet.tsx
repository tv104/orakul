"use client";

import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "./button";
import { useMemo } from "react";
import { useNotifications } from "@/hooks";

export const ConnectWallet = () => {
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { notifyUser } = useNotifications();

  const handleClick = async () => {
    try {
      if (isConnected) {
        await disconnectAsync();
      } else {
        await connectAsync({ connector: injected() });
      }
    } catch (error: unknown) {
      notifyUser(error);
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
