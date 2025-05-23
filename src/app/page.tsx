"use client";

import { ConnectWallet, Orakul, ParallaxBackground } from "@/components";
import room from "@/images/room.jpg";
import handsAndBall from "@/images/hands-and-ball.png";

export default function Home() {
  return (
    <>
      <ParallaxBackground
        backgroundImage={room}
        foregroundImage={handsAndBall}
      />
      <main className="relative min-h-screen p-8 flex">
        <div className="max-w-6xl mx-auto flex flex-col flex-1">
          <div className="flex justify-end mb-6">
            <ConnectWallet />
          </div>
          <Orakul />
        </div>
      </main>
    </>
  );
}
