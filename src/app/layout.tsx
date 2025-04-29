import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  OrakulProvider,
  Web3Provider,
  NotificationProvider,
} from "@/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orakul",
  description: "On-chain fortune teller powered by Chainlink VRF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <NotificationProvider>
            <OrakulProvider>{children}</OrakulProvider>
          </NotificationProvider>
        </Web3Provider>
        <div id="notification-root"></div>
      </body>
    </html>
  );
}
