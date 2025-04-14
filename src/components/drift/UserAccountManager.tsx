"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDriftStore } from "@/store/driftStore";
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

export function UserAccountManager() {
  const driftClient = useDriftStore((state) => state.driftClient);
  const { publicKey, signTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [subAccountId, setSubAccountId] = useState<number>(0);
  const [accountName, setAccountName] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);
  const userAccounts = useDriftStore((state) => state.userAccounts);

  // Fetch user accounts when wallet is connected and set first account as default
  useEffect(() => {
    if (publicKey && driftClient) {
      fetchUserAccounts(publicKey);
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

    // Check if the subAccountId already exists
    const existingAccount = userAccounts.find(
      (account) => account.subAccountId === subAccountId
    );

    if (existingAccount) {
      setStatus(
        `Error: Account with ID ${subAccountId} already exists. Please choose a different ID.`
      );
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
      fetchUserAccounts(publicKey);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error initializing user account:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAccounts = () => {
    if (publicKey) {
      fetchUserAccounts(publicKey);
    }
  };

  const selectedAccountData = userAccounts.find(
    (account) => account.subAccountId === selectedAccount
  );

  return (
    <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">
          User Account Management
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer transition-colors duration-200"
          >
            Create New Account
          </button>
          <button
            onClick={handleRefreshAccounts}
            disabled={isLoading || !publicKey}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded disabled:bg-gray-700 cursor-pointer transition-colors duration-200"
          >
            Refresh Accounts
          </button>
        </div>
      </div>

      {userAccounts.length > 0 ? (
        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-300">Select Account:</label>
            <select
              value={selectedAccount || ""}
              onChange={(e) => setSelectedAccount(Number(e.target.value))}
              className="border border-gray-600 bg-gray-700 text-white p-2 rounded w-full cursor-pointer"
            >
              {userAccounts.map((account) => (
                <option key={account.subAccountId} value={account.subAccountId}>
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
                                            (e.target as HTMLImageElement).src =
                                              "/placeholder-token.svg";
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
            No accounts found. Create a new account to get started.
          </p>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                  Sub Account ID:
                </label>
                <input
                  type="number"
                  value={subAccountId}
                  onChange={(e) => setSubAccountId(Number(e.target.value))}
                  className="border border-gray-600 bg-gray-700 text-white p-2 rounded w-full"
                  min="0"
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-300">
                  Account Name (optional):
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="border border-gray-600 bg-gray-700 text-white p-2 rounded w-full"
                  placeholder="My Account"
                />
              </div>
              <button
                onClick={initializeUserAccount}
                disabled={isLoading || !publicKey}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full cursor-pointer transition-colors duration-200 disabled:bg-gray-700"
              >
                {isLoading ? "Processing..." : "Create Account"}
              </button>
            </div>
            {status && <p className="mt-4 text-sm text-gray-300">{status}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
