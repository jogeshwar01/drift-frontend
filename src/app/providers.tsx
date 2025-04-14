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
import "@solana/wallet-adapter-react-ui/styles.css";
import { config } from "../config/env";

export default function Providers({
  children,
}: {
  readonly children: ReactNode;
}) {
  const network =
    config.NETWORK == "mainnet-beta"
      ? WalletAdapterNetwork.Mainnet
      : WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

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
