"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export const DepositForm = () => {
  const driftClient = useDriftStore((state) => state.driftClient);
  const { publicKey, signTransaction } = useWallet();
  const [amount, setAmount] = useState<string>("0.5");
  const [marketIndex, setMarketIndex] = useState<number>(1); // USDC
  const [depositStatus, setDepositStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [selectedSubAccountId, setSelectedSubAccountId] = useState<number>(0);

  const fetchUserAccounts = useCallback(async () => {
    if (!publicKey || !driftClient) return;

    try {
      setIsLoading(true);
      setDepositStatus("Fetching user accounts...");

      const accounts = await driftClient.getUserAccountsForAuthority(publicKey);
      setUserAccounts(accounts);

      if (accounts.length > 0) {
        setSelectedSubAccountId(accounts[0].subAccountId);
        setDepositStatus(
          `Found ${accounts.length} account(s). Select one to deposit to.`
        );
      } else {
        setDepositStatus("No accounts found. Please create an account first.");
      }
    } catch (error) {
      console.error("Error fetching user accounts:", error);
      setDepositStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, driftClient]);

  // Fetch user accounts when wallet is connected
  useEffect(() => {
    if (publicKey && driftClient) {
      fetchUserAccounts();
    }
  }, [publicKey, driftClient, fetchUserAccounts]);

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
      setIsLoading(true);
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
    } catch (error) {
      console.error("Error during deposit:", error);
      setDepositStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Deposit Funds</h2>

      {userAccounts.length === 0 ? (
        <div className="mb-4">
          <p className="text-red-500">
            You need to create a user account first before making deposits.
          </p>
          <button
            onClick={fetchUserAccounts}
            disabled={isLoading || !publicKey}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-300 mt-2"
          >
            Refresh Accounts
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block mb-2">Select Account:</label>
            <select
              value={selectedSubAccountId}
              onChange={(e) => setSelectedSubAccountId(Number(e.target.value))}
              className="border p-2 rounded w-full"
            >
              {userAccounts.map((account, index) => (
                <option key={index} value={account.subAccountId}>
                  {account.name
                    ? new TextDecoder().decode(new Uint8Array(account.name))
                    : `Account ${account.subAccountId}`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2 rounded w-full"
              min="0"
              step="0.1"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Market Index:</label>
            <select
              value={marketIndex}
              onChange={(e) => setMarketIndex(Number(e.target.value))}
              className="border p-2 rounded w-full"
            >
              <option value={1}>SOL (1)</option>
              <option value={0}>USDC (0)</option>
            </select>
          </div>

          <button
            onClick={handleDeposit}
            disabled={isLoading || !publicKey}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            {isLoading ? "Processing..." : "Deposit"}
          </button>
        </>
      )}

      {depositStatus && <p className="mt-4 text-sm">{depositStatus}</p>}
    </div>
  );
};
