"use client"

import dynamic from "next/dynamic";

// To fix hydration errors - Dynamically import the WalletMultiButton for client-side rendering
export const WalletMultiButtonDynamic = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);
