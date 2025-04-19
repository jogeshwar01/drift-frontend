"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { UserAccount } from "@drift-labs/sdk";
import { AccountInfoDisplay } from "./AccountInfoDisplay";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { PaidOutlined } from "@mui/icons-material";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const getAccountName = (account: UserAccount) => {
    if (account.name) {
      return new TextDecoder().decode(new Uint8Array(account.name));
    } else {
      return `Account ${account.subAccountId}`;
    }
  };

  return (
    <div className="p-4 border border-muted rounded-lg bg-background shadow">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-transparent bg-[image:var(--color-primary-gradient)] bg-clip-text">
              View Wallet Data
            </h2>
          </div>
          <div className="flex space-x-4">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter Solana wallet address"
              className="border border-muted bg-background text-white p-2 rounded flex-grow focus:outline-none"
            />
            <button
              onClick={handleViewWallet}
              disabled={isLoading || !driftClient || isLoadingAccounts}
              className="bg-muted hover:bg-chart-4 text-white px-4 py-2 rounded disabled:bg-background cursor-pointer transition-colors duration-200"
            >
              <PaidOutlined className="mr-2" />
              {isLoadingAccounts ? "Loading..." : "View Wallet"}
            </button>
          </div>

          {viewStatus && (
            <p className="text-sm mt-2 ml-2 text-chart-1 wrap-anywhere">
              {viewStatus}
            </p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
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
              <Select
                value={selectedAccount?.toString()}
                onValueChange={(value) => setSelectedAccount(Number(value))}
              >
                <SelectTrigger className="w-full bg-background text-white rounded-lg p-3 border border-muted focus:outline-none transition-colors">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {viewedAccounts.map((account) => (
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
      </div>
    </div>
  );
};
