"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDriftStore } from "@/store/driftStore";

export function UserAccountManager() {
  const driftClient = useDriftStore((state) => state.driftClient);
  const { publicKey, signTransaction } = useWallet();
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [subAccountId, setSubAccountId] = useState<number>(0);
  const [accountName, setAccountName] = useState<string>("");

  const fetchUserAccounts = useCallback(async () => {
    if (!publicKey || !driftClient) return;

    try {
      setIsLoading(true);
      setStatus("Fetching user accounts...");

      const accounts = await driftClient.getUserAccountsForAuthority(publicKey);
      setUserAccounts(accounts);

      if (accounts.length > 0) {
        setStatus(`Found ${accounts.length} account(s)`);
      } else {
        setStatus("No accounts found. Please create one.");
      }
    } catch (error) {
      console.error("Error fetching user accounts:", error);
      setStatus(
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

  const initializeUserAccount = async () => {
    if (!driftClient || !publicKey || !signTransaction) {
      setStatus("Please connect your wallet first");
      return;
    }

    // Check if the subAccountId already exists
    const existingAccount = userAccounts.find(
      (account) => account.subAccountId === subAccountId
    );
    
    if (existingAccount) {
      setStatus(`Error: Account with ID ${subAccountId} already exists. Please choose a different ID.`);
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Initializing user account...");

      // Get the initialization instructions
      const [initializeIxs, userAccountPublicKey] =
        await driftClient.getInitializeUserAccountIxs(
          subAccountId,
          accountName || undefined
        );

      // Build the transaction
      const tx = await driftClient.buildTransaction(initializeIxs);

      // Sign the transaction with the user's wallet
      const signedTx = await signTransaction(tx);

      // Send the transaction
      const { txSig } = await driftClient.sendTransaction(
        signedTx,
        [],
        driftClient.opts
      );

      // Add the user to the client's cache
      await driftClient.addUser(subAccountId);

      setStatus(
        `Account initialized successfully! Transaction signature: ${txSig}`
      );

      // Refresh the accounts list
      fetchUserAccounts();
    } catch (error) {
      console.error("Error initializing user account:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">User Account Management</h2>

      <div className="mb-4">
        <button
          onClick={fetchUserAccounts}
          disabled={isLoading || !publicKey}
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-300 mr-2"
        >
          Refresh Accounts
        </button>

        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Create New Account</h3>
          <div className="mb-4">
            <label className="block mb-2">Sub Account ID:</label>
            <input
              type="number"
              value={subAccountId}
              onChange={(e) => setSubAccountId(Number(e.target.value))}
              className="border p-2 rounded w-full"
              min="0"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Account Name (optional):</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="border p-2 rounded w-full"
              placeholder="My Account"
            />
          </div>
          <button
            onClick={initializeUserAccount}
            disabled={isLoading || !publicKey}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </div>
      </div>

      {userAccounts.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Your Accounts</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full  border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Sub Account ID</th>
                  <th className="py-2 px-4 border-b">Name</th>
                </tr>
              </thead>
              <tbody>
                {userAccounts.map((account, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">
                      {account.subAccountId}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {account.name
                        ? new TextDecoder().decode(new Uint8Array(account.name))
                        : "Unnamed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
