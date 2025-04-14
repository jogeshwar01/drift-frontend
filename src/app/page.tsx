"use client";
import { useState } from "react";
import { WalletMultiButtonDynamic } from "@/components/wallet/WalletButton";
import { UserAccountManager } from "@/components/drift/UserAccountManager";
import { DepositForm } from "@/components/drift/DepositForm";
import { WithdrawalForm } from "@/components/drift/WithdrawalForm";
import { PerpOrderForm } from "@/components/drift/PerpOrderForm";
import { WalletViewer } from "@/components/drift/WalletViewer";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("create-account");
  const { publicKey } = useWallet();

  const tabs = [
    { id: "create-account", label: "Account" },
    { id: "deposit", label: "Deposit" },
    { id: "withdraw", label: "Withdraw" },
    { id: "trade", label: "Trade" },
    { id: "wallet-data", label: "View Wallet Data" },
  ];

  return (
    <div className="font-[family-name:var(--font-geist-sans)] min-h-screen bg-gray-900 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Drift</h1>
          
          {publicKey && (
            <div className="flex space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-2 px-3 rounded-md font-medium text-sm cursor-pointer transition-all duration-200
                    ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          
          <WalletMultiButtonDynamic />
        </div>

        {publicKey ? (
          <div className="mt-4">
            <div className="mt-4">
              {activeTab === "create-account" && <UserAccountManager />}
              {activeTab === "deposit" && <DepositForm />}
              {activeTab === "withdraw" && <WithdrawalForm />}
              {activeTab === "trade" && <PerpOrderForm />}
              {activeTab === "wallet-data" && <WalletViewer />}
            </div>
          </div>
        ) : (
          <div className="mt-8 p-8 flex items-center flex-col gap-6 justify-center border h-[80vh] border-gray-700 rounded-lg bg-gray-800 shadow">
            <p className="text-xl text-gray-300">
              Please connect your wallet to access Drift.
            </p>
            <WalletMultiButtonDynamic />
          </div>
        )}
      </div>
    </div>
  );
}
