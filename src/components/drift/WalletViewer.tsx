"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { UserAccount } from "@drift-labs/sdk";

export const WalletViewer = () => {
  const driftClient = useDriftStore((state) => state.driftClient);
  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);
  const isLoading = useDriftStore((state) => state.isLoading);
  const error = useDriftStore((state) => state.error);

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [viewStatus, setViewStatus] = useState<string>("");
  const [viewedAccounts, setViewedAccounts] = useState<UserAccount[]>([]);

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
        setViewStatus(
          `Found ${accounts.length} account(s) for this wallet.`
        );
      } else {
        setViewStatus("No accounts found for this wallet.");
      }
    } catch (error) {
      console.error("Error viewing wallet:", error);
      setViewStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">View Wallet Data</h2>

      <div className="mb-4">
        <label className="block mb-2">Wallet Address:</label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Enter Solana wallet address"
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        onClick={handleViewWallet}
        disabled={isLoading || !driftClient}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {isLoading ? "Loading..." : "View Wallet"}
      </button>

      {viewStatus && <p className="mt-4 text-sm">{viewStatus}</p>}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {viewedAccounts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Accounts</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Account ID</th>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Authority</th>
                </tr>
              </thead>
              <tbody>
                {viewedAccounts.map((account, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">
                      {account.subAccountId}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {account.name
                        ? new TextDecoder().decode(new Uint8Array(account.name))
                        : "Unnamed"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {account.authority.toString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
