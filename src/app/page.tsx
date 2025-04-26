"use client";

import { ConnectWallet, Magic8Ball, ParallaxBackground } from "@/components";
import room from "@/images/room.png";
import hands from "@/images/hands.png";

export default function Home() {
  return (
    <>
      <ParallaxBackground backgroundImage={room} foregroundImage={hands} />
      <main className="relative min-h-screen p-8 flex">
        <div className="max-w-6xl mx-auto flex flex-col flex-1">
          <div className="flex justify-end mb-6">
            <ConnectWallet />
          </div>
          <Magic8Ball />
        </div>
      </main>
    </>
  );
}
