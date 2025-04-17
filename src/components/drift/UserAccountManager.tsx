"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDriftStore } from "@/store/driftStore";
import { AccountInfoDisplay } from "./AccountInfoDisplay";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { Refresh as RefreshIcon, Add as AddIcon } from "@mui/icons-material";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserAccountManager() {
  const driftClient = useDriftStore((state) => state.driftClient);
  const { publicKey, signTransaction } = useWallet();
  const isLoading = useDriftStore((state) => state.isLoading);
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
    <div className="p-4 border border-muted rounded-lg bg-background shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-transparent bg-[image:var(--color-primary-gradient)] bg-clip-text">
          Account
        </h2>
      </div>

      {(isLoadingAccounts || isLoading) && (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading accounts..." />
        </div>
      )}

      {!isLoadingAccounts && !isLoading && userAccounts.length > 0 && (
        <div className="space-y-6">
          <div className="flex space-x-4 items-end">
            <div className="w-1/2">
              <label className="block mb-2 text-gray-300">
                Select Account:
              </label>
              <Select
                value={selectedAccount?.toString() || ""}
                onValueChange={(value) => setSelectedAccount(Number(value))}
              >
                <SelectTrigger className="border border-muted w-full text-white p-2 rounded cursor-pointer">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
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
                      <SelectItem
                        key={account.subAccountId}
                        value={account.subAccountId.toString()}
                      >
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-4 w-1/2 h-full">
              <button
                onClick={() => {
                  setAccountName("");
                  setStatus("");
                  setShowCreateModal(true);
                }}
                disabled={userAccounts.length >= 8}
                className="bg-muted hover:bg-chart-2/80 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                <AddIcon className="w-4 h-4 mr-2" />
                Create New Account
              </button>
              <button
                onClick={handleRefreshAccounts}
                disabled={isLoadingAccounts || !publicKey}
                className="bg-muted hover:bg-chart-4 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
              >
                <RefreshIcon className="w-4 h-4 mr-2" />
                Refresh Accounts
              </button>
            </div>
          </div>

          {selectedAccountData && (
            <AccountInfoDisplay account={selectedAccountData} />
          )}
        </div>
      )}

      {!isLoadingAccounts && !isLoading && userAccounts.length === 0 && (
        <div className="text-center py-8 h-[60vh] flex justify-center flex-col gap-4 items-center">
          <p className="text-gray-300">
            No accounts found. Create a new account to get started.
          </p>

          <button
            onClick={() => {
              setAccountName("");
              setStatus("");
              setShowCreateModal(true);
            }}
            disabled={userAccounts.length >= 8}
            className="bg-muted hover:bg-chart-2/80 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            <AddIcon className="w-4 h-4 mr-2" />
            Create New Account
          </button>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-muted/80 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-xl max-w-md w-full">
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
            <div className="space-y-8 mt-6">
              <div>
                <label className="block mb-2 text-gray-300">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="border border-muted bg-background focus:outline-none text-white p-2 rounded w-full"
                  placeholder="My Account"
                  required
                />
              </div>
              <button
                onClick={initializeUserAccount}
                disabled={isLoading || !publicKey || userAccounts.length >= 8}
                className="bg-muted hover:bg-muted/50 text-white px-4 py-2 rounded w-full cursor-pointer transition-colors duration-200 disabled:bg-gray-700"
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
