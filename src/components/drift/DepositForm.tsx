"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { RefreshIcon } from "../icons";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { UserAccount } from "@drift-labs/sdk";

export const DepositForm = () => {
  const driftClient = useDriftStore((state) => state.driftClient);
  const { publicKey, signTransaction } = useWallet();
  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);
  const userAccounts = useDriftStore((state) => state.userAccounts);

  const [amount, setAmount] = useState<string>("0.5");
  const [marketIndex, setMarketIndex] = useState<number>(1); // SOL
  const [depositStatus, setDepositStatus] = useState<string>("");
  const [selectedSubAccountId, setSelectedSubAccountId] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);

  useEffect(() => {
    if (publicKey) {
      setIsLoadingAccounts(true);
      fetchUserAccounts(publicKey).finally(() => {
        setIsLoadingAccounts(false);
      });
    }
  }, [publicKey, fetchUserAccounts]);

  // Set first account as default when accounts are loaded
  useEffect(() => {
    if (userAccounts.length > 0 && !selectedSubAccountId) {
      setSelectedSubAccountId(userAccounts[0].subAccountId);
    }
  }, [userAccounts, selectedSubAccountId]);

  const handleDeposit = async () => {
    if (!driftClient || !publicKey || !signTransaction) {
      setDepositStatus("Please connect your wallet first");
      return;
    }

    if (userAccounts.length === 0) {
      setDepositStatus("You need to create an account first");
      return;
    }

    try {
      setIsProcessing(true);
      setDepositStatus("Preparing deposit transaction...");

      // Convert amount to the correct precision
      const depositAmount = driftClient.convertToSpotPrecision(
        marketIndex,
        parseFloat(amount)
      );

      // Get the associated token account
      const associatedTokenAccount =
        await driftClient.getAssociatedTokenAccount(marketIndex);

      // Create the deposit transaction
      const tx = await driftClient.createDepositTxn(
        depositAmount,
        marketIndex,
        associatedTokenAccount,
        selectedSubAccountId // Use the selected sub account ID
      );

      // Sign the transaction with the user's wallet
      const signedTx = await signTransaction(tx);

      // Send the transaction
      const { txSig } = await driftClient.sendTransaction(
        signedTx,
        [],
        driftClient.opts
      );

      setDepositStatus(`Deposit successful! Transaction signature: ${txSig}`);

      // Refresh accounts to update balances
      setIsLoadingAccounts(true);
      await fetchUserAccounts(publicKey);
    } catch (error) {
      console.error("Error during deposit:", error);
      setDepositStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsProcessing(false);
      setIsLoadingAccounts(false);
    }
  };

  const handleRefreshAccounts = async () => {
    if (publicKey) {
      setIsLoadingAccounts(true);
      try {
        await fetchUserAccounts(publicKey);
      } finally {
        setIsLoadingAccounts(false);
      }
    }
  };

  const getAccountName = (account: UserAccount) => {
    if (account.name) {
      return new TextDecoder().decode(new Uint8Array(account.name));
    } else {
      return `Account ${account.subAccountId}`;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-6">Deposit Funds</h2>

      {isLoadingAccounts ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading accounts..." />
        </div>
      ) : userAccounts.length === 0 ? (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
          <p className="text-red-400">
            You need to create a user account first before making deposits.
          </p>
          <button
            onClick={handleRefreshAccounts}
            disabled={isLoadingAccounts || !publicKey}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mt-3 transition-colors duration-200 flex items-center"
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh Accounts
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Account
            </label>
            <select
              value={selectedSubAccountId}
              onChange={(e) => setSelectedSubAccountId(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              {userAccounts.map((account) => (
                <option key={account.subAccountId} value={account.subAccountId}>
                  {getAccountName(account)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Token
            </label>
            <select
              value={marketIndex}
              onChange={(e) => setMarketIndex(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              <option value={1}>SOL</option>
              <option value={0}>USDC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                min="0"
                step="0.1"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-400">
                  {marketIndex === 1 ? "SOL" : "USDC"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDeposit}
            disabled={isProcessing || !publicKey || isLoadingAccounts}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Deposit"}
          </button>
        </div>
      )}

      {depositStatus && (
        <div
          className={`mt-4 p-3 rounded-lg wrap-anywhere ${
            depositStatus.includes("Error")
              ? "bg-red-900/30 border border-red-700 text-red-400"
              : "bg-green-900/30 border border-green-700 text-green-400"
          }`}
        >
          {depositStatus}
        </div>
      )}
    </div>
  );
};
