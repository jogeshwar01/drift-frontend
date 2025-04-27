"use client";

import { DRIFT_ICON_URL } from "@/config/constants";
import { UserAccount, SpotMarkets, BN, PublicKey } from "@drift-labs/sdk";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { useDriftStore } from "@/store/driftStore";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Helper function to convert hex string to decimal
const hexToDecimal = (hex: string): string => {
  if (!hex || hex === "00") return "0";
  return new BN(hex, 16).toString();
};

// Helper function to format balance with sign and precision
const formatBalance = (value: string, precision: number): string => {
  if (!value || value === "00") return "0";
  const decimal = hexToDecimal(value);
  const decimalBN = new BN(decimal);
  const precisionBN = new BN(10).pow(new BN(precision));

  // Format with precision (divide by 10^precision)
  let formattedValue: string;
  if (precisionBN.eq(new BN(1))) {
    formattedValue = decimalBN.toString();
  } else {
    formattedValue =
      decimalBN.div(precisionBN).toString() +
      "." +
      decimalBN.mod(precisionBN).toString().padStart(precision, "0");

    // Remove trailing zeros and decimal point if needed
    formattedValue = formattedValue.replace(/\.?0+$/, "");
  }

  return formattedValue;
};

interface AccountInfoDisplayProps {
  account: UserAccount;
}

// Interface for market data
interface MarketData {
  marketIndex: number;
  symbol: string;
  formattedBalance: string;
  balanceType: string;
  hasBalance: boolean;
  mint: PublicKey;
}

export const AccountInfoDisplay = ({ account }: AccountInfoDisplayProps) => {
  const { network } = useDriftStore();
  const spotMarkets = SpotMarkets[network];

  // Prepare market data with balances
  const marketsWithBalances: MarketData[] = [];
  const marketsWithoutBalances: MarketData[] = [];

  Object.entries(spotMarkets).forEach(([marketIndexStr, spotConfig]) => {
    const marketIndex = parseInt(marketIndexStr);
    const symbol = spotConfig?.symbol?.toLowerCase() || "unknown";
    const precision = spotConfig?.precisionExp || 6;

    const position = account.spotPositions.find(
      (pos) =>
        pos.marketIndex === marketIndex &&
        pos.cumulativeDeposits &&
        pos.cumulativeDeposits !== "00"
    );

    let formattedBalance = "0";
    let balanceType = "-";
    let hasBalance = false;

    if (position) {
      hasBalance = true;
      balanceType = Object.keys(position.balanceType)[0];
      formattedBalance = formatBalance(position.cumulativeDeposits, precision);
    }

    const marketData: MarketData = {
      marketIndex,
      symbol,
      formattedBalance,
      balanceType,
      hasBalance,
      mint: spotConfig.mint,
    };

    if (hasBalance) {
      marketsWithBalances.push(marketData);
    } else {
      marketsWithoutBalances.push(marketData);
    }
  });

  // Sort markets with balances by balance amount
  const sortedMarketsWithBalances = [
    ...marketsWithBalances,
    ...marketsWithoutBalances,
  ].sort((a, b) => {
    return parseFloat(b.formattedBalance) - parseFloat(a.formattedBalance);
  });

  const topTokens = sortedMarketsWithBalances.slice(0, 4);
  const remainingTokens = sortedMarketsWithBalances.slice(4);

  return (
    <div className="space-y-8">
      <Card className="bg-muted/25 py-6 hover:bg-muted/50">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Basic account details and authority</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1 md:col-span-1">
              <p className="text-sm font-medium text-muted-foreground">
                Sub Account ID
              </p>
              <p className="text-lg font-semibold">{account.subAccountId}</p>
            </div>
            <div className="space-y-1 md:col-span-1">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">
                {account.name
                  ? new TextDecoder().decode(new Uint8Array(account.name))
                  : "Unnamed"}
              </p>
            </div>
            <div className="space-y-1 md:col-span-2 flex justify-end">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Authority
                </p>
                <p className="text-lg font-semibold truncate">
                  {account.authority.toString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {topTokens.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Tokens</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topTokens.map((market) => (
              <Card
                key={`top-token-${market.marketIndex}`}
                className="bg-muted/25 py-6 hover:bg-muted/50"
              >
                <CardHeader>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={`${DRIFT_ICON_URL}${market.symbol}.svg`}
                        alt={market.symbol}
                        className="w-6 h-6"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `${DRIFT_ICON_URL}sol.svg`;
                        }}
                        width={24}
                        height={24}
                      />
                      <CardTitle className="text-lg">
                        <div className="flex items-center  justify-between gap-2">
                          <div>{market.formattedBalance}</div>
                          <div>{market.symbol.toUpperCase()}</div>
                        </div>
                      </CardTitle>
                    </div>

                    <Link
                      href={`https://explorer.solana.com/address/${market.mint.toString()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-chart-1 flex items-center"
                    >
                      <span className="truncate max-w-[120px]">
                        {market.mint.toString().substring(0, 20)}...
                      </span>
                      <ExternalLinkIcon className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          {remainingTokens.map((market, index) => (
            <div
              key={`market-${market.marketIndex}`}
              className={`grid grid-cols-4 gap-4 px-6 py-6 rounded-sm ${
                index % 2 === 0
                  ? "bg-muted/25 hover:bg-muted/50"
                  : "bg-muted/5 hover:bg-muted/25"
              }`}
            >
              <div className="flex items-center space-x-2 col-span-1 justify-center">
                <Image
                  src={`${DRIFT_ICON_URL}${market.symbol}.svg`}
                  alt={market.symbol}
                  className="w-6 h-6"
                  onError={(e) => {
                    (
                      e.target as HTMLImageElement
                    ).src = `${DRIFT_ICON_URL}sol.svg`;
                  }}
                  width={24}
                  height={24}
                />
                <span>{market.symbol.toUpperCase()}</span>
              </div>
              <div className="col-span-2">
                <Link
                  href={`https://explorer.solana.com/address/${market.mint.toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-chart-1 flex items-center justify-center"
                >
                  <span className="truncate max-w-[120px]">
                    {market.mint.toString().substring(0, 8)}...
                  </span>
                  <ExternalLinkIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="col-span-1 justify-center flex items-center">
                {market.formattedBalance}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
