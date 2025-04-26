"use client";

import { useConnect, useAccount, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { injected } from "wagmi/connectors";
import { Button } from "./button";

export const ConnectWallet = () => {
  const { connect } = useConnect();
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <Button disabled>Connect Wallet</Button>;

  if (isConnected) {
    return (
      <div className="flex items-center gap-5">
        <Button onClick={() => disconnect()} variant="outlined">
          Disconnect {`${address?.slice(0, 4)}...${address?.slice(-2)}`}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => connect({ connector: injected() })}
      disabled={isConnecting}
      variant="outlined"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};
