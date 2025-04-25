"use client";

import { ConnectWallet, Magic8Ball } from "@/components";

export default function Home() {
  return (
    <main className="min-h-screen p-8 flex">
      <div className="max-w-6xl mx-auto flex flex-col flex-1">
        <div className="flex justify-end mb-6">
          <ConnectWallet />
        </div>
        <Magic8Ball />
      </div>
    </main>
  );
}
