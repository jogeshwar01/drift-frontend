"use client";
import { useState } from "react";
import { UserAccountManager } from "@/components/drift/UserAccountManager";
import { DepositForm } from "@/components/drift/DepositForm";
import { WithdrawalForm } from "@/components/drift/WithdrawalForm";
import { PerpOrderForm } from "@/components/drift/PerpOrderForm";
import { WalletViewer } from "@/components/drift/WalletViewer";
import { useWallet } from "@solana/wallet-adapter-react";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PageAirplaneAnimation } from "@/components/common/PageAirplaneAnimation";

export default function Home() {
  const [activeTab, setActiveTab] = useState("create-account");
  const { publicKey } = useWallet();

  return (
    <div className="font-[family-name:var(--font-geist-sans)] min-h-screen bg-background pb-8">
      <PageAirplaneAnimation />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {publicKey ? (
          <div className="mt-8">
            {activeTab === "create-account" && <UserAccountManager />}
            {activeTab === "deposit" && <DepositForm />}
            {activeTab === "withdraw" && <WithdrawalForm />}
            {activeTab === "perp" && <PerpOrderForm />}
            {activeTab === "wallet-data" && <WalletViewer />}
          </div>
        ) : (
          <div className="mt-8 p-8 flex items-center flex-col gap-6 justify-center border h-[80vh] border-muted rounded-lg bg-background shadow">
            <p className="text-xl text-gray-300">
              Please connect your wallet to access Drift.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
