"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { UserAccount } from "@drift-labs/sdk";
import { RefreshAccountsScreen } from "../common/RefreshAccountsScreen";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const getAccountName = (account: UserAccount) => {
    if (account.name) {
      return new TextDecoder().decode(new Uint8Array(account.name));
    } else {
      return `Account ${account.subAccountId}`;
    }
  };

  return (
    <div className="bg-background border border-muted h-[84vh] rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-transparent bg-[image:var(--color-primary-gradient)] bg-clip-text">
          Deposit
        </h2>
      </div>

      {isLoadingAccounts ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading accounts..." />
        </div>
      ) : (
        ""
      )}

      {!isLoadingAccounts && userAccounts.length === 0 ? (
        <RefreshAccountsScreen
          isLoadingAccounts={isLoadingAccounts}
          setIsLoadingAccounts={setIsLoadingAccounts}
        />
      ) : (
        ""
      )}

      {!isLoadingAccounts && userAccounts.length ? (
        <div className="flex flex-col md:flex-row">
          <div className="hidden md:flex w-1/2 items-center justify-center">
            <div className="w-[80%] h-[55vh] p-8 bg-muted hover:bg-chart-4 text-center transition-colors duration-200 flex flex-col gap-4 items-center justify-center rounded-lg">
              <span className="text-2xl font-semibold text-white">
                Deposit Assets Into Your Drift Subaccount
              </span>
              <span className="italic">
                Currently we assume you already have a drift account for the
                asset you are depositing
              </span>
            </div>
          </div>
          <div className="space-y-4 w-full md:w-1/2 px-4 md:px-12">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Account
              </label>
              <Select
                value={selectedSubAccountId.toString()}
                onValueChange={(value) =>
                  setSelectedSubAccountId(Number(value))
                }
              >
                <SelectTrigger className="w-full bg-background text-white rounded-lg p-3 border border-muted focus:outline-none transition-colors">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {userAccounts.map((account) => (
                    <SelectItem
                      key={account.subAccountId}
                      value={account.subAccountId.toString()}
                    >
                      {getAccountName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Token
              </label>
              <Select
                value={marketIndex.toString()}
                onValueChange={(value) => setMarketIndex(Number(value))}
              >
                <SelectTrigger className="w-full bg-background text-white rounded-lg p-3 border border-muted focus:outline-none transition-colors">
                  <SelectValue placeholder="Select a token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">SOL</SelectItem>
                  <SelectItem value="0">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background text-white rounded-lg p-3 border border-muted focus:outline-none transition-colors"
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
              className="cursor-pointer w-full bg-muted hover:bg-chart-4 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:bg-muted/25 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : "Deposit"}
            </button>

            {depositStatus && (
              <div
                className={`w-full p-3 rounded-lg wrap-anywhere ${
                  depositStatus.includes("Error")
                    ? "bg-red-900/30 border border-red-700 text-red-400"
                    : "bg-green-900/30 border border-green-700 text-green-400"
                }`}
              >
                {depositStatus}
              </div>
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
