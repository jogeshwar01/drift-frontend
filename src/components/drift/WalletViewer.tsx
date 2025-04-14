"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { UserAccount } from "@drift-labs/sdk";
import { AccountInfoDisplay } from "./AccountInfoDisplay";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const WalletViewer = () => {
  const driftClient = useDriftStore((state) => state.driftClient);
  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);
  const isLoading = useDriftStore((state) => state.isLoading);
  const error = useDriftStore((state) => state.error);

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [viewStatus, setViewStatus] = useState<string>("");
  const [viewedAccounts, setViewedAccounts] = useState<UserAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);

  // Set first account as default when accounts are loaded
  useEffect(() => {
    if (viewedAccounts.length > 0 && !selectedAccount) {
      setSelectedAccount(viewedAccounts[0].subAccountId);
    }
  }, [viewedAccounts, selectedAccount]);

  const handleViewWallet = async () => {
    if (!driftClient) {
      setViewStatus("Drift client not initialized");
      return;
    }

    if (!walletAddress) {
      setViewStatus("Please enter a wallet address");
      return;
    }

    try {
      setIsLoadingAccounts(true);
      setViewStatus("Fetching accounts for wallet...");

      // Validate the wallet address
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(walletAddress);
      } catch (error) {
        console.error("Invalid wallet address:", error);
        setViewStatus("Invalid wallet address format");
        return;
      }

      // Fetch accounts for the wallet without updating the store
      const accounts = await fetchUserAccounts(publicKey, false);
      setViewedAccounts(accounts);

      if (accounts.length > 0) {
        setViewStatus(`Found ${accounts.length} account(s) for this wallet.`);
        setSelectedAccount(accounts[0].subAccountId);
      } else {
        setViewStatus("No accounts found for this wallet.");
        setSelectedAccount(null);
      }
    } catch (error) {
      console.error("Error viewing wallet:", error);
      setViewStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const selectedAccountData = viewedAccounts.find(
    (account) => account.subAccountId === selectedAccount
  );

  return (
    <div className="p-4 border border-gray-700 rounded-lg bg-gray-800 shadow">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">
            View Wallet Data
          </h2>
          <div className="flex space-x-4">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter Solana wallet address"
              className="border border-gray-600 bg-gray-700 text-white p-2 rounded flex-grow"
            />
            <button
              onClick={handleViewWallet}
              disabled={isLoading || !driftClient || isLoadingAccounts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-700 cursor-pointer transition-colors duration-200"
            >
              {isLoadingAccounts ? "Loading..." : "View Wallet"}
            </button>
          </div>
        </div>

        {isLoadingAccounts && (
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Loading wallet data..." />
          </div>
        )}
        
        {!isLoadingAccounts && viewedAccounts.length > 0 && (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-300">
                Select Account:
              </label>
              <select
                value={selectedAccount || ""}
                onChange={(e) => setSelectedAccount(Number(e.target.value))}
                className="border border-gray-600 bg-gray-700 text-white p-2 rounded w-full cursor-pointer"
              >
                {viewedAccounts.map((account) => (
                  <option
                    key={account.subAccountId}
                    value={account.subAccountId}
                  >
                    {account.name
                      ? new TextDecoder().decode(new Uint8Array(account.name))
                      : `Account ${account.subAccountId}`}
                  </option>
                ))}
              </select>
            </div>

            {selectedAccountData && (
              <AccountInfoDisplay account={selectedAccountData} />
            )}
          </div>
        )}
        
        {!isLoadingAccounts && viewedAccounts.length === 0 && (
          <div className="flex justify-center items-center py-8 h-[60vh]">
            <p className="text-gray-300">
              Enter a wallet address to view account data.
            </p>
          </div>
        )}

        {viewStatus && (
          <p className="text-sm text-gray-300 wrap-break-word">{viewStatus}</p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
};
