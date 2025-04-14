import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { DriftClient, DriftEnv, IWallet } from "@drift-labs/sdk";
import { config } from "../../config/env";

export async function getDriftClient(
  setDriftClient: (client: DriftClient) => void,
  publicKey: PublicKey | null
) {
  try {
    const connection = new Connection(config.RPC_URL!, "confirmed");

    if (!publicKey) {
      console.log("No public key found");
      return;
    }

    // const keyPair: Keypair = Keypair.fromSecretKey(
    //   new Uint8Array([private key here])
    // );
    // const keyPair = new Keypair();

    // const wallet = new Wallet(keyPair);

    const wallet: IWallet = {
      publicKey: publicKey,
      signTransaction: async (tx: Transaction) => {
        // The transaction will be signed by the user's wallet in the frontend components
        return tx;
      },
      signAllTransactions: async (txs: Transaction[]) => {
        // The transactions will be signed by the user's wallet in the frontend components
        return txs;
      },
    };

    const driftClient = new DriftClient({
      connection,
      wallet,
      env: config.NETWORK as DriftEnv,
    });

    // const driftClient = new DriftClient({
    //   connection,
    //   wallet,
    //   env: "devnet",
    // });

    await driftClient.subscribe();

    setDriftClient(driftClient);

    return {
      success: true,
      clientData: {
        env: config.NETWORK!,
        client: driftClient,
      },
    };
  } catch (error) {
    console.error("Error initializing Drift client:", error);
    return { success: false, error: "Failed to initialize Drift client" };
  }
}

// const iWallet: IWallet = {
//   publicKey: new PublicKey("BGx1XuPKQ4vVTViN7ShUV7YizQPpsovPomsN41BB4h6t"),
//   signTransaction: async (tx: any) => {
//     return tx;
//   },
//   signAllTransactions: async (txs: any) => {
//     return txs;
//   },
// };

// const driftClient = new DriftClient({
//   connection,
//   wallet: iWallet,
//   env: config.NETWORK!,
// });
