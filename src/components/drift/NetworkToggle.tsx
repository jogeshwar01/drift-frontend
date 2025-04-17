"use client";

import { useDriftStore } from "@/store/driftStore";

export const NetworkToggle = () => {
  const { network, setNetwork } = useDriftStore();

  const toggleNetwork = () => {
    const newNetwork = network === "mainnet-beta" ? "devnet" : "mainnet-beta";
    const rpcUrl =
      newNetwork === "mainnet-beta"
        ? process.env.NEXT_PUBLIC_MAINNET_RPC_URL!
        : process.env.NEXT_PUBLIC_DEVNET_RPC_URL!;
    setNetwork(newNetwork, rpcUrl);
  };

  return (
    <button
      onClick={toggleNetwork}
      className="group py-2 px-3 rounded-full font-medium text-sm cursor-pointer bg-muted hover:bg-chart-4 text-white transition-colors duration-200 relative w-[160px] text-center"
    >
      <span className="block group-hover:hidden">
        {network === "mainnet-beta" ? "Mainnet" : "Devnet"}
      </span>
      <span className="hidden group-hover:block">
        {network === "mainnet-beta" ? "Switch to Devnet" : "Switch to Mainnet"}
      </span>
    </button>
  );
};
