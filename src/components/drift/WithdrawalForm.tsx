"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { SpotMarkets, UserAccount } from "@drift-labs/sdk";
import { config } from "@/config/env";
import { RefreshAccountsScreen } from "../common/RefreshAccountsScreen";

export const WithdrawalForm = () => {
  const driftClient = useDriftStore((state) => state.driftClient);
  const { publicKey, signTransaction } = useWallet();
  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);
  const userAccounts = useDriftStore((state) => state.userAccounts);

  const [amount, setAmount] = useState<string>("0.5");
  const [marketIndex, setMarketIndex] = useState<number>(1); // SOL
  const [withdrawalStatus, setWithdrawalStatus] = useState<string>("");
  const [selectedSubAccountId, setSelectedSubAccountId] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
  const [availableBalance, setAvailableBalance] = useState<string>("0");
  const [availableTokens, setAvailableTokens] = useState<
    { marketIndex: number; symbol: string }[]
  >([]);

  const formatAmount = (amount: string, decimals: number) => {
    return (parseInt(amount, 10) / 10 ** decimals).toFixed(5);
  };

  useEffect(() => {
    if (publicKey) {
      setIsLoadingAccounts(true);
      fetchUserAccounts(publicKey).finally(() => {
        setIsLoadingAccounts(false);
      });
    }
  }, [publicKey, fetchUserAccounts]);

  // Set first account as default when accounts are loaded
  useEffect(() => {
    if (userAccounts.length > 0 && !selectedSubAccountId) {
      setSelectedSubAccountId(userAccounts[0].subAccountId);
    }
  }, [userAccounts, selectedSubAccountId]);

  // Calculate available tokens when subaccount changes
  useEffect(() => {
    if (userAccounts.length > 0 && selectedSubAccountId !== undefined) {
      const selectedAccount = userAccounts.find(
        (account) => account.subAccountId === selectedSubAccountId
      );

      if (selectedAccount?.spotPositions) {
        // Find all positions with deposits
        const tokensWithDeposits = selectedAccount.spotPositions
          .filter(
            (pos) =>
              pos.cumulativeDeposits &&
              pos.cumulativeDeposits !== "00" &&
              parseInt(pos.cumulativeDeposits, 16) > 0
          )
          .map((pos) => {
            const spotMarket = SpotMarkets[config.NETWORK].find(
              (market) => market.marketIndex === pos.marketIndex
            );
            return {
              marketIndex: pos.marketIndex,
              symbol: spotMarket?.symbol ?? `Token ${pos.marketIndex}`,
            };
          });

        setAvailableTokens(tokensWithDeposits);

        // If we have tokens with deposits but current marketIndex isn't one of them,
        // set marketIndex to the first available token
        if (
          tokensWithDeposits.length > 0 &&
          !tokensWithDeposits.some((token) => token.marketIndex === marketIndex)
        ) {
          setMarketIndex(tokensWithDeposits[0].marketIndex);
        }
      }
    }
  }, [userAccounts, selectedSubAccountId, marketIndex]);

  // Update available balance when subaccount or market index changes
  useEffect(() => {
    if (userAccounts.length > 0 && selectedSubAccountId !== undefined) {
      const selectedAccount = userAccounts.find(
        (account) => account.subAccountId === selectedSubAccountId
      );

      if (selectedAccount?.spotPositions) {
        const position = selectedAccount.spotPositions.find(
          (pos) => pos.marketIndex === marketIndex
        );

        if (position) {
          const balance = position.cumulativeDeposits;

          const spotMarket = SpotMarkets[config.NETWORK].find((marketData) => {
            return marketData.marketIndex === marketIndex;
          });

          const formattedBalance = formatAmount(
            balance,
            spotMarket?.precisionExp ?? 9
          );
          setAvailableBalance(formattedBalance);
          setAmount(formattedBalance); // Set amount to available balance
        } else {
          setAvailableBalance("0");
          setAmount("0");
        }
      }
    }
  }, [userAccounts, selectedSubAccountId, marketIndex, driftClient]);

  const handleWithdraw = async () => {
    if (!driftClient || !publicKey || !signTransaction) {
      setWithdrawalStatus("Please connect your wallet first");
      return;
    }

    if (userAccounts.length === 0) {
      setWithdrawalStatus("You need to create an account first");
      return;
    }

    // Check if amount is greater than available balance
    if (parseFloat(amount) > parseFloat(availableBalance)) {
      setWithdrawalStatus("Error: Amount exceeds available balance");
      return;
    }

    try {
      setIsProcessing(true);
      setWithdrawalStatus("Preparing withdrawal transaction...");

      // Convert amount to the correct precision
      const withdrawalAmount = driftClient.convertToSpotPrecision(
        marketIndex,
        parseFloat(amount)
      );

      // Get the associated token account
      const associatedTokenAccount =
        await driftClient.getAssociatedTokenAccount(marketIndex);

      // Create the withdrawal transaction
      const withdrawalIxs = await driftClient.getWithdrawalIxs(
        withdrawalAmount,
        marketIndex,
        associatedTokenAccount,
        false, // reduceOnly
        selectedSubAccountId // Use the selected sub account ID
      );

      // Build transaction from instructions
      const tx = await driftClient.buildTransaction(withdrawalIxs);

      // Sign the transaction with the user's wallet
      const signedTx = await signTransaction(tx);

      // Send the transaction
      const { txSig } = await driftClient.sendTransaction(
        signedTx,
        [],
        driftClient.opts
      );

      setWithdrawalStatus(
        `Withdrawal successful! Transaction signature: ${txSig}`
      );

      // Refresh accounts to update balances
      setIsLoadingAccounts(true);
      await fetchUserAccounts(publicKey);
    } catch (error) {
      console.error("Error during withdrawal:", error);
      setWithdrawalStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsProcessing(false);
      setIsLoadingAccounts(false);
    }
  };

  const getAccountName = (account: UserAccount) => {
    if (account.name) {
      return new TextDecoder().decode(new Uint8Array(account.name));
    } else {
      return `Account ${account.subAccountId}`;
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputAmount = e.target.value;
    // Only allow setting amount if it's not greater than available balance
    if (
      inputAmount === "" ||
      parseFloat(inputAmount) <= parseFloat(availableBalance)
    ) {
      setAmount(inputAmount);
    }
  };

  return (
    <div className="bg-background border border-muted h-[84vh] rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-transparent bg-[image:var(--color-primary-gradient)] bg-clip-text">
          Withdraw
        </h2>
      </div>

      {isLoadingAccounts ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading accounts..." />
        </div>
      ) : (
        ""
      )}

      {!isLoadingAccounts && userAccounts.length === 0 ? (
        <RefreshAccountsScreen
          isLoadingAccounts={isLoadingAccounts}
          setIsLoadingAccounts={setIsLoadingAccounts}
        />
      ) : (
        ""
      )}

      {!isLoadingAccounts && userAccounts.length ? (
        <div className="flex flex-col md:flex-row">
          <div className="space-y-4 w-full md:w-1/2 px-4 md:px-12">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Account
              </label>
              <select
                value={selectedSubAccountId}
                onChange={(e) =>
                  setSelectedSubAccountId(Number(e.target.value))
                }
                className="w-full bg-background text-white rounded-lg p-3 border border-muted focus:outline-none transition-colors"
              >
                {userAccounts.map((account) => (
                  <option
                    key={account.subAccountId}
                    value={account.subAccountId}
                  >
                    {getAccountName(account)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Token
              </label>
              <select
                value={marketIndex}
                onChange={(e) => setMarketIndex(Number(e.target.value))}
                className="w-full bg-background text-white rounded-lg p-3 border border-muted focus:outline-none transition-colors"
              >
                {availableTokens.length > 0 ? (
                  availableTokens.map((token) => (
                    <option key={token.marketIndex} value={token.marketIndex}>
                      {token.symbol}
                    </option>
                  ))
                ) : (
                  <option value={0} disabled>
                    No tokens available for withdrawal
                  </option>
                )}
              </select>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg border border-muted">
              <p className="text-sm text-gray-300">
                Available Balance:{" "}
                <span className="text-white font-medium">
                  {availableBalance}{" "}
                  {availableTokens.find((t) => t.marketIndex === marketIndex)
                    ?.symbol || ""}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full bg-background text-white rounded-lg p-3 border border-muted focus:outline-none transition-colors"
                  min="0"
                  step="0.1"
                  max={availableBalance}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400">
                    {availableTokens.find((t) => t.marketIndex === marketIndex)
                      ?.symbol || ""}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={
                isProcessing ||
                !publicKey ||
                isLoadingAccounts ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > parseFloat(availableBalance) ||
                availableTokens.length === 0
              }
              className="cursor-pointer w-full bg-muted hover:bg-chart-4 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:bg-background disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : "Withdraw"}
            </button>
          </div>

          <div className="hidden md:flex w-1/2 items-center justify-center">
            <div className="w-[80%] h-[60vh] p-8 bg-muted hover:bg-chart-4 text-center transition-colors duration-200 flex flex-col gap-4 items-center justify-center rounded-lg">
              <span className="text-2xl font-semibold text-white">
                Withdraw Assets From Your Drift Subaccount
              </span>
              <span className="italic">
                Withdraw your assets back to your wallet
              </span>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {withdrawalStatus && (
        <div
          className={`mt-4 p-3 rounded-lg wrap-anywhere ${
            withdrawalStatus.includes("Error")
              ? "bg-red-900/30 border border-red-700 text-red-400"
              : "bg-green-900/30 border border-green-700 text-green-400"
          }`}
        >
          {withdrawalStatus}
        </div>
      )}
    </div>
  );
};
