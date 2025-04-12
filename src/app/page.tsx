"use client";
import { WalletMultiButtonDynamic } from "@/components/wallet/WalletButton";
import { useDriftStore } from "@/store/driftStore";
import { PublicKey } from "@drift-labs/sdk";
import { useEffect } from "react";

export default function Home() {
  const driftClient = useDriftStore((state) => state.driftClient);

  useEffect(() => {
    console.log("driftClient", driftClient);
    // console.log(driftClient?.getUser(
    //   undefined,
    //   new PublicKey("BGx1XuPKQ4vVTViN7ShUV7YizQPpsovPomsN41BB4h6t")
    // ))
  });

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold mb-4">Drift Frontend</h1>
      <WalletMultiButtonDynamic />
      <p>Drift Client: {driftClient?.authority.toBase58()}</p>
    </div>
  );
}
