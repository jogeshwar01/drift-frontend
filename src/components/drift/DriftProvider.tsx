"use client";

import { useDriftStore } from "@/store/driftStore";
import { getDriftClient } from "@/app/actions/drift";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function DriftProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { setDriftClient, network, rpcUrl } = useDriftStore();
  const { publicKey } = useWallet();

  useEffect(() => {
    const initializeDrift = async () => {
      try {
        await getDriftClient(setDriftClient, publicKey, network, rpcUrl);
      } catch (error) {
        console.error("Error in Drift initialization:", error);
      }
    };

    initializeDrift();
  }, [setDriftClient, publicKey, network, rpcUrl]);

  return <>{children}</>;
}
