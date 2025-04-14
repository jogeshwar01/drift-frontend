"use client";

import { DRIFT_ICON_URL } from "@/config/constants";
import { UserAccount, SpotMarkets, BN } from "@drift-labs/sdk";
import Image from "next/image";
import { config } from "@/config/env";

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
}

export const AccountInfoDisplay = ({ account }: AccountInfoDisplayProps) => {
  // Get all available spot markets
  const spotMarkets = SpotMarkets[config.NETWORK];

  // Prepare market data with balances
  const marketsWithBalances: MarketData[] = [];
  const marketsWithoutBalances: MarketData[] = [];

  Object.entries(spotMarkets).forEach(([marketIndexStr, spotConfig]) => {
    const marketIndex = parseInt(marketIndexStr);
    const symbol = spotConfig?.symbol?.toLowerCase() || "unknown";
    const precision = spotConfig?.precisionExp || 6;

    // Find position for this market if it exists
    const position = account.spotPositions.find(
      (pos) =>
        pos.marketIndex === marketIndex &&
        pos.cumulativeDeposits &&
        pos.cumulativeDeposits !== "00" &&
        pos.cumulativeDeposits > 0
    );

    // Get balance info
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
    };

    if (hasBalance) {
      marketsWithBalances.push(marketData);
    } else {
      marketsWithoutBalances.push(marketData);
    }
  });

  // Combine arrays with markets with balances first
  const sortedMarkets = [...marketsWithBalances, ...marketsWithoutBalances];

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-white">Account Information</h4>
          <div className="mt-2 space-y-2">
            <p className="text-gray-300">
              <span className="font-medium">Sub Account ID:</span>{" "}
              {account.subAccountId}
            </p>
            <p className="text-gray-300">
              <span className="font-medium">Name:</span>{" "}
              {account.name
                ? new TextDecoder().decode(new Uint8Array(account.name))
                : "Unnamed"}
            </p>
            <p className="text-gray-300">
              <span className="font-medium">Authority:</span>{" "}
              {account.authority.toString()}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-white">Token Balances</h4>
          <div className="mt-2">
            <div
              className="max-h-[400px] overflow-y-auto scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="border-b border-gray-700">
                    <th className="py-2 px-4 text-left text-gray-300">Token</th>
                    <th className="py-2 px-4 text-left text-gray-300">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMarkets.map((market) => (
                    <tr
                      key={`market-${market.marketIndex}`}
                      className="border-b border-gray-700"
                    >
                      <td className="py-2 px-4">
                        <div className="flex items-center space-x-2">
                          <Image
                            src={`${DRIFT_ICON_URL}${market.symbol}.svg`}
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
                          <span className="text-gray-300">
                            {market.symbol.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-gray-300">
                        {market.formattedBalance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
