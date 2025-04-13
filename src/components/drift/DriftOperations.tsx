"use client";
import { useState } from "react";
import { DepositForm } from "./DepositForm";
import { WithdrawalForm } from "./WithdrawalForm";
import { PerpOrderForm } from "./PerpOrderForm";
import { WalletViewer } from "./WalletViewer";

export const DriftOperations = () => {
  const [activeTab, setActiveTab] = useState<string>("deposit");

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "deposit"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "withdraw"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Withdraw
            </button>
            <button
              onClick={() => setActiveTab("trade")}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "trade"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Trade
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "view"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              View Wallet
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === "deposit" && <DepositForm />}
        {activeTab === "withdraw" && <WithdrawalForm />}
        {activeTab === "trade" && <PerpOrderForm />}
        {activeTab === "view" && <WalletViewer />}
      </div>
    </div>
  );
};
