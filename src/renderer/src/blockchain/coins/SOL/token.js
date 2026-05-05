import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

export const ensureATA = async ({
  connection,
  payer,
  mint,
  owner,
  transaction
}) => {
  const ata = await getAssociatedTokenAddress(mint, owner);

  const account = await connection.getAccountInfo(ata);

  if (!account) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        ata,
        owner,
        mint
      )
    );
  }

  return ata;
};