import { create } from "zustand";
import { DriftClient, UserAccount } from "@drift-labs/sdk";
import { PublicKey } from "@solana/web3.js";

interface DriftStore {
  driftClient: DriftClient | null;
  setDriftClient: (client: DriftClient) => void;
  userAccounts: UserAccount[];
  fetchUserAccounts: (publicKey: PublicKey | null) => Promise<UserAccount[]>;
  isLoading: boolean;
  error: string | null;
}

export const useDriftStore = create<DriftStore>((set, get) => ({
  driftClient: null,
  setDriftClient: (client) => set({ driftClient: client }),
  userAccounts: [],
  isLoading: false,
  error: null,
  fetchUserAccounts: async (publicKey) => {
    const { driftClient } = get();
    if (!publicKey || !driftClient) {
      set({ error: "Wallet not connected or Drift client not initialized" });
      return [];
    }

    try {
      set({ isLoading: true, error: null });
      const accounts = await driftClient.getUserAccountsForAuthority(publicKey);
      set({ userAccounts: accounts, isLoading: false });
      return accounts;
    } catch (error) {
      console.error("Error fetching user accounts:", error);
      set({
        error: error instanceof Error ? error.message : String(error),
        isLoading: false,
      });
      return [];
    }
  },
}));
