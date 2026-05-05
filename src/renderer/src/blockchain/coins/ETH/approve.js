import { ethers } from "ethers";

export async function approveToken(
  wallet,
  tokenAddress,
  spender,
  amount,
  rpcUrl
) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = wallet.connect(provider);

  const abi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];

  const tokenContract = new ethers.Contract(tokenAddress, abi, signer);

  console.log("👤 Signer:", signer.address);
  console.log("🔗 Provider:", signer.provider ? "✅" : "❌");

  // ✅ Check current allowance
  const currentAllowance = await tokenContract.allowance(
    signer.address,
    spender
  );

  console.log("🔍 Current Allowance:", currentAllowance.toString());

  // ✅ If already approved enough → skip
  if (currentAllowance >= amount) {
    console.log("✅ Already approved, skipping...");
    return;
  }

  // ⚠️ USDT FIX (VERY IMPORTANT)
  if (currentAllowance > 0n) {
    console.log("♻️ Resetting allowance to 0 (USDT fix)...");
    const resetTx = await tokenContract.approve(spender, 0);
    await resetTx.wait();
  }

  // ✅ Approve required amount
  console.log("🔐 Approving new amount...");
  const tx = await tokenContract.approve(spender, amount);
  await tx.wait();

  console.log("✅ Approval successful");
}