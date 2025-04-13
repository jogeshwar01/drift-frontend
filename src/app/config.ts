export const config = {
  RPC_URL:
    process.env.RPC_URL ??
    "https://api.devnet.solana.com",
  NETWORK: process.env.NETWORK ?? "devnet",
};
