// not used anymore
import { WRAPPED_SOL_MINT, DriftClient } from "@drift-labs/sdk";
import {
  getAssociatedTokenAddress,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import { TransactionInstruction, PublicKey } from "@solana/web3.js";

export async function getTokenAccountOrCreateTransaction(
  driftClient: DriftClient,
  mint: PublicKey,
  owner: PublicKey,
  payer: PublicKey
): Promise<PublicKey | TransactionInstruction> {
  if (mint.equals(WRAPPED_SOL_MINT)) {
    return driftClient.wallet.publicKey;
  }

  const associatedToken = await getAssociatedTokenAddress(mint, owner);

  let account;
  try {
    account = await getAccount(driftClient.connection, associatedToken);
  } catch (error: unknown) {
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      return driftClient.createAssociatedTokenAccountIdempotentInstruction(
        associatedToken,
        payer,
        owner,
        mint
      );
    } else {
      throw error;
    }
  }
  return account.address;
}
