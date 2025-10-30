import type { Metadata } from "next";
import "./globals.css";
import SolanaWalletProvider from "@/components/WalletProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "HyperX402",
  description: "Solana x402 agents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white overflow-x-hidden">
        {/* Global animated gradient background */}
        <div className="absolute inset-0 -z-10 mesh-bg" />

        {/* Everything else overlays the animation */}
        <div className="relative z-10">
          <SolanaWalletProvider>
            <Navbar />
            {children}
          </SolanaWalletProvider>
        </div>
      </body>
    </html>
  );
}
