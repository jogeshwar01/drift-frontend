"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDriftStore } from "@/store/driftStore";
import { RefreshIcon } from "../icons";
import { AccountInfoDisplay } from "./AccountInfoDisplay";
import { LoadingSpinner } from "../common/LoadingSpinner";

export function UserAccountManager() {
  const driftClient = useDriftStore((state) => state.driftClient);
  const { publicKey, signTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);

  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);
  const userAccounts = useDriftStore((state) => state.userAccounts);

  // Fetch user accounts when wallet is connected and set first account as default
  useEffect(() => {
    if (publicKey && driftClient) {
      setIsLoadingAccounts(true);
      fetchUserAccounts(publicKey).finally(() => {
        setIsLoadingAccounts(false);
      });
    }
  }, [publicKey, driftClient, fetchUserAccounts]);

  // Set first account as default when accounts are loaded
  useEffect(() => {
    if (userAccounts.length > 0 && !selectedAccount) {
      setSelectedAccount(userAccounts[0].subAccountId);
    }
  }, [userAccounts, selectedAccount]);

  const initializeUserAccount = async () => {
    if (!driftClient || !publicKey || !signTransaction) {
      setStatus("Please connect your wallet first");
      return;
    }

    if (!accountName.trim()) {
      setStatus("Please enter an account name");
      return;
    }

    // Maximum of 8 sub-accounts allowed
    if (userAccounts.length >= 8) {
      setStatus("Maximum number of accounts (8) reached.");
      return;
    }
    let subAccountId = 0;
    try {
      subAccountId = await driftClient.getNextSubAccountId();
    } catch (error) {
      console.log("Error getting next subaccount id", error);
    }

    try {
      setIsLoading(true);
      setStatus("Initializing user account...");

      // Get the initialization instructions
      const [initializeIxs] = await driftClient.getInitializeUserAccountIxs(
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
      setIsLoadingAccounts(true);
      await fetchUserAccounts(publicKey);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error initializing user account:", error);
      setStatus(`${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
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

  const selectedAccountData = userAccounts.find(
    (account) => account.subAccountId === selectedAccount
  );

  return (
    <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Account</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={userAccounts.length >= 8}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer transition-colors duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            Create New Account
          </button>
          <button
            onClick={handleRefreshAccounts}
            disabled={isLoadingAccounts || !publicKey}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-sm transition-colors duration-200 flex items-center cursor-pointer"
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh Accounts
          </button>
        </div>
      </div>

      {isLoadingAccounts && (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading accounts..." />
        </div>
      )}

      {!isLoadingAccounts && userAccounts.length > 0 && (
        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-300">Select Account:</label>
            <select
              value={selectedAccount || ""}
              onChange={(e) => setSelectedAccount(Number(e.target.value))}
              className="border border-gray-600 bg-gray-700 text-white p-2 rounded w-full cursor-pointer"
            >
              {userAccounts.map((account) => {
                let displayName;
                if (account.name) {
                  displayName = new TextDecoder().decode(
                    new Uint8Array(account.name)
                  );
                } else {
                  displayName = `Account ${account.subAccountId}`;
                }
                return (
                  <option
                    key={account.subAccountId}
                    value={account.subAccountId}
                  >
                    {displayName}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedAccountData && (
            <AccountInfoDisplay account={selectedAccountData} />
          )}
        </div>
      )}

      {!isLoadingAccounts && userAccounts.length === 0 && (
        <div className="text-center py-8 h-[60vh] flex justify-center items-center">
          <p className="text-gray-300">
            No accounts found. Create a new account to get started.
          </p>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">
                Create New Account
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-300 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-gray-300">
                  Account Name:
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="border border-gray-600 bg-gray-700 text-white p-2 rounded w-full"
                  placeholder="My Account"
                  required
                />
              </div>
              <button
                onClick={initializeUserAccount}
                disabled={isLoading || !publicKey || userAccounts.length >= 8}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full cursor-pointer transition-colors duration-200 disabled:bg-gray-700"
              >
                {isLoading
                  ? "Processing..."
                  : userAccounts.length >= 8
                  ? "Account Limit Reached"
                  : "Create Account"}
              </button>
            </div>
            {status && (
              <p className="mt-4 text-sm text-gray-300 wrap-anywhere">
                {status}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
