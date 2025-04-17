import { create } from "zustand";
import { DriftClient, UserAccount, DriftEnv } from "@drift-labs/sdk";
import { PublicKey } from "@solana/web3.js";

interface DriftStore {
  driftClient: DriftClient | null;
  setDriftClient: (client: DriftClient) => void;
  userAccounts: UserAccount[];
  fetchUserAccounts: (
    publicKey: PublicKey | null,
    setAccounts?: boolean
  ) => Promise<UserAccount[]>;
  isLoading: boolean;
  error: string | null;
  network: DriftEnv;
  rpcUrl: string;
  setNetwork: (network: DriftEnv, rpcUrl: string) => void;
  setRpcUrl: (rpcUrl: string) => void;
}

export const useDriftStore = create<DriftStore>((set, get) => ({
  driftClient: null,
  setDriftClient: (client) => set({ driftClient: client }),
  userAccounts: [],
  isLoading: true,
  error: null,
  network: "mainnet-beta",
  rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL!,
  setRpcUrl: (rpcUrl) => set({ rpcUrl }),
  setNetwork: (network, rpcUrl) => {
    set({ network, rpcUrl, isLoading: true });
  },
  fetchUserAccounts: async (publicKey, setAccounts = true) => {
    const { driftClient } = get();
    if (!publicKey || !driftClient) {
      set({ error: "Wallet not connected or Drift client not initialized" });
      return [];
    }

    try {
      set({ isLoading: true, error: null });
      const accounts = await driftClient.getUserAccountsForAuthority(publicKey);
      if (setAccounts) {
        set({ userAccounts: accounts, isLoading: false });
      } else {
        set({ isLoading: false });
      }
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
