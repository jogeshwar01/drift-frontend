import { PublicKey } from "@solana/web3.js";

export type SolAsset = {
  mint: PublicKey;
  name: string;
  symbol: string;
  image: string;
  decimals: number;
  price: number;
  userTokenAccount?: {
    address: PublicKey;
    amount: number;
  };
};
