"use client";
import { WalletMultiButtonDynamic } from "@/components/wallet/WalletButton";
import { useDriftStore } from "@/store/driftStore";
import { UserAccountManager } from "@/components/drift/UserAccountManager";
import { DriftOperations } from "@/components/drift/DriftOperations";

export default function Home() {
  const driftClient = useDriftStore((state) => state.driftClient);

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold mb-4">Drift Frontend</h1>
      <WalletMultiButtonDynamic />
      <p className="mt-4">Drift Client: {driftClient?.authority.toBase58()}</p>

      <UserAccountManager />
      <DriftOperations />
    </div>
  );
}
