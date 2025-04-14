"use client";
import { useState } from "react";
import { WalletMultiButtonDynamic } from "@/components/wallet/WalletButton";
import { UserAccountManager } from "@/components/drift/UserAccountManager";
import { DepositForm } from "@/components/drift/DepositForm";
import { WithdrawalForm } from "@/components/drift/WithdrawalForm";
import { PerpOrderForm } from "@/components/drift/PerpOrderForm";
import { WalletViewer } from "@/components/drift/WalletViewer";

export default function Home() {
  const [activeTab, setActiveTab] = useState("create-account");

  const tabs = [
    { id: "create-account", label: "Create Account" },
    { id: "deposit", label: "Deposit" },
    { id: "withdraw", label: "Withdraw" },
    { id: "trade", label: "Trade" },
    { id: "wallet-data", label: "View Wallet Data" },
  ];

  return (
    <div className="font-[family-name:var(--font-geist-sans)] min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Drift</h1>
          <WalletMultiButtonDynamic />
        </div>

        <div className="mt-4">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm cursor-pointer transition-all duration-200
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-4">
            {activeTab === "create-account" && <UserAccountManager />}
            {activeTab === "deposit" && <DepositForm />}
            {activeTab === "withdraw" && <WithdrawalForm />}
            {activeTab === "trade" && <PerpOrderForm />}
            {activeTab === "wallet-data" && <WalletViewer />}
          </div>
        </div>
      </div>
    </div>
  );
}
