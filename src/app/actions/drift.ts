import { Connection, PublicKey } from "@solana/web3.js";
import { DriftClient, IWallet } from "@drift-labs/sdk";

export async function getDriftClient(
  setDriftClient: (client: DriftClient) => void,
  publicKey: PublicKey | null
) {
  try {
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );

    if (!publicKey) {
      console.log("No public key found");
      return;
    }

    // const keyPair: Keypair = Keypair.fromSecretKey(
    //   new Uint8Array([private key here])
    // );
    // const keyPair = new Keypair();

    // const wallet = new Wallet(keyPair);

    const iWallet: IWallet = {
      publicKey: publicKey,
        signTransaction: async (tx: any) => {
          return tx;
        },
        signAllTransactions: async (txs: any) => {
          return txs;
        },
      };

    const driftClient = new DriftClient({
      connection,
      wallet: iWallet,
      env: "devnet",
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
        env: "devnet",
        connectionEndpoint: "https://api.devnet.solana.com",
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
//   env: "devnet",
// });
