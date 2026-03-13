"use client";
 
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// Dynamically import WalletModalProvider to prevent SSR hydration issues
const WalletModalProvider = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletModalProvider),
  { ssr: false }
);
 
// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use environment variable for network, default to devnet for development
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet' 
    ? WalletAdapterNetwork.Mainnet 
    : WalletAdapterNetwork.Devnet;
    
  const endpoint = useMemo(() => {
    // Use custom RPC endpoint if provided, otherwise use default
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT;
    }
    return clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network],
  );
 
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}