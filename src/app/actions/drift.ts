import { Connection, Keypair } from "@solana/web3.js";
import { Wallet, DriftClient } from "@drift-labs/sdk";

export async function getDriftClient(
  setDriftClient: (client: DriftClient) => void
) {
  try {
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );

    // const keyPair: Keypair = Keypair.fromSecretKey(
    //   new Uint8Array(JSON.parse(keyPairFile))
    // );
    const keyPair = new Keypair();

    const wallet = new Wallet(keyPair);

    const driftClient = new DriftClient({
      connection,
      wallet,
      env: "devnet",
    });

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
