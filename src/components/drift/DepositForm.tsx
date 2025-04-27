"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { BN, SpotMarkets, UserAccount } from "@drift-labs/sdk";
import { RefreshAccountsScreen } from "../common/RefreshAccountsScreen";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { DRIFT_ICON_URL } from "@/config/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export const DepositForm = () => {
  const driftClient = useDriftStore((state) => state.driftClient);
  const { publicKey, signTransaction } = useWallet();
  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);
  const userAccounts = useDriftStore((state) => state.userAccounts);
  const { network } = useDriftStore();

  const [amount, setAmount] = useState<string>("0.5");
  const [marketIndex, setMarketIndex] = useState<number>(1); // SOL
  const [selectedSubAccountId, setSelectedSubAccountId] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);

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

  const handleDeposit = async () => {
    if (!driftClient || !publicKey || !signTransaction) {
      toast.error("Please connect your wallet first", {
        id: "deposit",
      });
      return;
    }

    if (userAccounts.length === 0) {
      toast.error("You need to create an account first", {
        id: "deposit",
      });
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading("Preparing deposit transaction...", {
        id: "deposit",
      });

      // Convert amount to the correct precision
      const depositAmount = driftClient.convertToSpotPrecision(
        marketIndex,
        parseFloat(amount)
      );

      // Get the associated token account
      const associatedTokenAccount =
        await driftClient.getAssociatedTokenAccount(marketIndex);
      const marketData = SpotMarkets[network][marketIndex];
      const tokenPrecisionExp = marketData?.precisionExp;
      const tokenSymbol = marketData?.symbol;

      let tokenBalance = 0;
      // validate if user has a token account for the market
      try {
        if (associatedTokenAccount == publicKey) {
          // for sol - stored on publicKey
          tokenBalance = await driftClient.connection.getBalance(
            associatedTokenAccount
          );
        } else {
          // for other tokens - ATA = associatedTokenAccount
          tokenBalance = parseFloat(
            (
              await driftClient.connection.getTokenAccountBalance(
                associatedTokenAccount
              )
            )?.value.amount
          );
        }
      } catch (error) {
        console.error("Error getting token account balance:", error);
        toast.error(
          `Error: Could not find token account for ${tokenSymbol}. Please deposit ${tokenSymbol} in your wallet before continuing.`,
          {
            id: "deposit",
          }
        );
        return;
      }

      const tokenBalanceBN = new BN(tokenBalance);
      if (depositAmount.gt(tokenBalanceBN)) {
        const formattedTokenBalance = formatAmount(
          tokenBalanceBN,
          tokenPrecisionExp
        );
        toast.error(
          `Error: Insufficient balance. You have ${formattedTokenBalance} ${tokenSymbol} in your wallet.`,
          {
            id: "deposit",
          }
        );
        return;
      }

      // Create the deposit transaction
      const tx = await driftClient.createDepositTxn(
        depositAmount,
        marketIndex,
        associatedTokenAccount,
        selectedSubAccountId // Use the selected sub account ID
      );

      // Sign the transaction with the user's wallet
      const signedTx = await signTransaction(tx);

      // Send the transaction
      const { txSig } = await driftClient.sendTransaction(
        signedTx,
        [],
        driftClient.opts
      );

      toast.success(
        `Deposit successful! Transaction signature: ${txSig.toString()}`,
        {
          id: "deposit",
        }
      );

      // Refresh accounts to update balances
      setIsLoadingAccounts(true);
      await fetchUserAccounts(publicKey);
    } catch (error) {
      console.error("Error during deposit:", error);
      toast.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
        {
          id: "deposit",
        }
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

  return (
    <div className="flex min-h-[84vh] flex-col items-center justify-center bg-muted/10 rounded-md p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Deposit</h1>
                  </div>
                  <Separator className="my-1" />

                  {isLoadingAccounts ? (
                    <div className="flex justify-center items-center h-[40vh]">
                      <LoadingSpinner text="Getting account data..." />
                    </div>
                  ) : null}

                  {!isLoadingAccounts && userAccounts.length === 0 ? (
                    <RefreshAccountsScreen
                      isLoadingAccounts={isLoadingAccounts}
                      setIsLoadingAccounts={setIsLoadingAccounts}
                    />
                  ) : null}

                  {!isLoadingAccounts && userAccounts.length ? (
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4">
                        <Label htmlFor="account">Select Account</Label>
                        <Select
                          value={selectedSubAccountId.toString()}
                          onValueChange={(value) =>
                            setSelectedSubAccountId(Number(value))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an account" />
                          </SelectTrigger>
                          <SelectContent>
                            {userAccounts.map((account) => (
                              <SelectItem
                                key={account.subAccountId}
                                value={account.subAccountId.toString()}
                              >
                                {getAccountName(account)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-4">
                        <Label htmlFor="token">Select Token</Label>
                        <Select
                          value={marketIndex.toString()}
                          onValueChange={(value) =>
                            setMarketIndex(Number(value))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a token" />
                          </SelectTrigger>
                          <SelectContent>
                            {SpotMarkets[network].map((market) => (
                              <SelectItem
                                key={market.marketIndex}
                                value={market.marketIndex.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={`${DRIFT_ICON_URL}${market.symbol.toLowerCase()}.svg`}
                                    alt={market.symbol}
                                    className="w-6 h-6"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).src = `${DRIFT_ICON_URL}sol.svg`;
                                    }}
                                    width={20}
                                    height={20}
                                  />
                                  {market.symbol}
                                  <div className="text-xs text-gray-400">
                                    ({market.mint.toString()})
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-4">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="relative">
                          <Input
                            id="amount"
                            type="text"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full"
                            min="0"
                            step="0.1"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-400">
                              {SpotMarkets[network][marketIndex].symbol}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleDeposit}
                        disabled={
                          isProcessing || !publicKey || isLoadingAccounts
                        }
                        className="w-full cursor-pointer"
                      >
                        {isProcessing ? "Processing..." : "Deposit"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="relative hidden bg-linear-to-br from-muted/50 to-chart-2/40 md:block">
                <div className="absolute inset-0 flex items-center justify-center p-10">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold text-white">
                      Deposit Assets Into Your Drift Subaccount
                    </h2>
                    <p className="text-gray-400 italic">
                      Deposit assets from your wallet
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
