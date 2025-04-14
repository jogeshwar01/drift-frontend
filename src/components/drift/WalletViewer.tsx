"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { UserAccount } from "@drift-labs/sdk";
import { BN } from "@drift-labs/sdk";
import { SpotMarkets } from "@drift-labs/sdk";

// Helper function to convert hex string to decimal
const hexToDecimal = (hex: string): string => {
  if (!hex || hex === "00") return "0";
  return new BN(hex, 16).toString();
};

// Helper function to format balance with sign
const formatBalance = (value: string, isNegative: boolean = false): string => {
  if (!value || value === "00") return "0";
  const decimal = hexToDecimal(value);
  return isNegative ? `-${decimal}` : decimal;
};

export const WalletViewer = () => {
  const driftClient = useDriftStore((state) => state.driftClient);
  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);
  const isLoading = useDriftStore((state) => state.isLoading);
  const error = useDriftStore((state) => state.error);

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [viewStatus, setViewStatus] = useState<string>("");
  const [viewedAccounts, setViewedAccounts] = useState<UserAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

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
      setViewStatus("Fetching accounts for wallet...");

      // Validate the wallet address
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(walletAddress);
      } catch (e) {
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
    }
  };

  const selectedAccountData = viewedAccounts.find(
    (account) => account.subAccountId === selectedAccount
  );

  return (
    <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow">
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
              disabled={isLoading || !driftClient}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-700 cursor-pointer transition-colors duration-200"
            >
              {isLoading ? "Loading..." : "View Wallet"}
            </button>
          </div>
        </div>

        {viewedAccounts.length > 0 ? (
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-white">
                        Account Information
                      </h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-gray-300">
                          <span className="font-medium">Sub Account ID:</span>{" "}
                          {selectedAccountData.subAccountId}
                        </p>
                        <p className="text-gray-300">
                          <span className="font-medium">Name:</span>{" "}
                          {selectedAccountData.name
                            ? new TextDecoder().decode(
                                new Uint8Array(selectedAccountData.name)
                              )
                            : "Unnamed"}
                        </p>
                        <p className="text-gray-300">
                          <span className="font-medium">Authority:</span>{" "}
                          {selectedAccountData.authority.toString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-white">Token Balances</h4>
                      <div className="mt-2">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-gray-700">
                              <th className="py-2 px-4 text-left text-gray-300">
                                Token
                              </th>
                              <th className="py-2 px-4 text-left text-gray-300">
                                Balance
                              </th>
                              <th className="py-2 px-4 text-left text-gray-300">
                                Type
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedAccountData.spotPositions.map(
                              (position, idx) => {
                                if (
                                  position.scaledBalance &&
                                  position.scaledBalance !== "00"
                                ) {
                                  const spotConfig =
                                    SpotMarkets["devnet"][position.marketIndex];
                                  const symbol =
                                    spotConfig?.symbol?.toLowerCase() ||
                                    "unknown";
                                  const balanceType = Object.keys(
                                    position.balanceType
                                  )[0];
                                  const isNegative = balanceType === "borrow";
                                  const formattedBalance = formatBalance(
                                    position.scaledBalance,
                                    isNegative
                                  );

                                  return (
                                    <tr
                                      key={idx}
                                      className="border-b border-gray-700"
                                    >
                                      <td className="py-2 px-4">
                                        <div className="flex items-center space-x-2">
                                          <img
                                            src={`https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/${symbol}.svg`}
                                            alt={symbol}
                                            className="w-6 h-6"
                                            onError={(e) => {
                                              (
                                                e.target as HTMLImageElement
                                              ).src = "/placeholder-token.svg";
                                            }}
                                          />
                                          <span className="text-gray-300">
                                            {symbol.toUpperCase()}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-2 px-4 text-gray-300">
                                        {formattedBalance}
                                      </td>
                                      <td className="py-2 px-4 text-gray-300">
                                        {balanceType}
                                      </td>
                                    </tr>
                                  );
                                }
                                return null;
                              }
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-300">
              Enter a wallet address to view account data.
            </p>
          </div>
        )}

        {viewStatus && <p className="text-sm text-gray-300">{viewStatus}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
};
