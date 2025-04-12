import { create } from "zustand";
import { DriftClient } from "@drift-labs/sdk";

interface DriftState {
  driftClient: DriftClient | null;
  setDriftClient: (client: DriftClient) => void;
  clearDriftClient: () => void;
}

export const useDriftStore = create<DriftState>((set) => ({
  driftClient: null,
  setDriftClient: (client) => set({ driftClient: client }),
  clearDriftClient: () => set({ driftClient: null }),
}));
