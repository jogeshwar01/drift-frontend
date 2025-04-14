"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDriftStore } from "@/store/driftStore";
import { PriceChart, TimeScale } from "@/components/sol/price-chart";
import { SolAsset } from "@/lib/types";
import { PublicKey } from "@solana/web3.js";
import { fetchPriceHistoryBirdeye } from "@/lib/prices/birdeye";

// Define the date range options
const DATE_RANGE_OPTIONS = ["1D", "1W", "1M", "1Y"] as const;
type DateRangeKey = (typeof DATE_RANGE_OPTIONS)[number];

// Define the timestamps for each date range
const TIMESTAMPS: Record<
  DateRangeKey,
  { start: number; end: number; interval: string; timeScale: TimeScale }
> = {
  "1D": {
    start: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    end: Math.floor(Date.now() / 1000),
    interval: "1m",
    timeScale: "time",
  },
  "1W": {
    start: Math.floor(Date.now() / 1000) - 604800, // 1 week ago
    end: Math.floor(Date.now() / 1000),
    interval: "30m",
    timeScale: "day",
  },
  "1M": {
    start: Math.floor(Date.now() / 1000) - 2592000, // 1 month ago
    end: Math.floor(Date.now() / 1000),
    interval: "1H",
    timeScale: "date",
  },
  "1Y": {
    start: Math.floor(Date.now() / 1000) - 31536000, // 1 year ago
    end: Math.floor(Date.now() / 1000),
    interval: "1D",
    timeScale: "month",
  },
};

interface DriftPriceChartProps {
  marketSymbol: string;
  marketMint: string;
}

export const DriftPriceChart = ({
  marketSymbol,
  marketMint,
}: DriftPriceChartProps) => {
  const [dateRange, setDateRange] = useState<DateRangeKey>("1D");
  const [chartData, setChartData] = useState<
    { timestamp: number; price: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const driftClient = useDriftStore((state) => state.driftClient);

  // Create a mock asset for the chart
  const asset: SolAsset = {
    symbol: marketSymbol,
    name: marketSymbol,
    decimals: 9,
    mint: new PublicKey(marketMint),
    image: "",
    price: 0,
  };

  // Function to fetch price history
  const fetchPriceHistory = useCallback(async () => {
    if (!driftClient) return;

    setIsLoading(true);
    try {
      // Get the current timestamp
      const { start, end, interval } = TIMESTAMPS[dateRange];

      const mockData = await fetchPriceHistoryBirdeye(
        new PublicKey(marketMint),
        start,
        end,
        interval
      );
      if (mockData) {
        setChartData(mockData);
      }
    } catch (error) {
      console.error("Error fetching price history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [driftClient, dateRange, marketMint]);

  // Fetch price history when date range changes
  useEffect(() => {
    fetchPriceHistory();
  }, [dateRange, fetchPriceHistory]);

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    setDateRange(value as DateRangeKey);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PriceChart
      asset={asset}
      data={chartData}
      timeScale={TIMESTAMPS[dateRange].timeScale}
      title={`${marketSymbol} Price Chart`}
      description={`Price history for ${marketSymbol}`}
      onDateRangeChange={handleDateRangeChange}
      dateRangeOptions={DATE_RANGE_OPTIONS as unknown as string[]}
      defaultDateRange={dateRange}
    />
  );
};
