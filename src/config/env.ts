interface Env {
  RPC_URL: string;
  NETWORK: "mainnet-beta" | "devnet";
}

export const config: Env = {
  RPC_URL:
    process.env.RPC_URL ??
    "https://api.devnet.solana.com",
  NETWORK: (process.env.NETWORK as "mainnet-beta" | "devnet") || "devnet",
};
