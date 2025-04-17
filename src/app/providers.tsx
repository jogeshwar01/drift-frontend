"use client";

import { ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { DriftProvider } from "@/components/drift/DriftProvider";
import { useDriftStore } from "@/store/driftStore";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function Providers({
  children,
}: {
  readonly children: ReactNode;
}) {
  const { network } = useDriftStore();
  const walletNetwork = useMemo(
    () =>
      network === "mainnet-beta"
        ? WalletAdapterNetwork.Mainnet
        : WalletAdapterNetwork.Devnet,
    [network]
  );
  const endpoint = useMemo(() => clusterApiUrl(walletNetwork), [walletNetwork]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <DriftProvider>{children}</DriftProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
