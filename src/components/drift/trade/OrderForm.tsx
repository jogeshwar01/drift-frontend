"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  OptionalOrderParams,
  OrderType,
  PositionDirection,
} from "@drift-labs/sdk";
import {
  MARKET_ICONS,
  MARKET_SYMBOLS,
  MARKET_NAMES,
  PLACEHOLDER_ICON,
} from "@/config/constants";
import {
  WarningIcon,
  RefreshIcon,
  ChevronDownIcon,
  ChartIcon,
  CurrencyIcon,
  LongIcon,
  ShortIcon,
  LoadingIcon,
  SuccessIcon,
  ErrorIcon,
} from "@/components/icons";
import Image from "next/image";

export const OrderForm = () => {
  const driftClient = useDriftStore((state) => state.driftClient);
  const { publicKey, signTransaction } = useWallet();
  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);
  const userAccounts = useDriftStore((state) => state.userAccounts);
  const isLoading = useDriftStore((state) => state.isLoading);

  const [orderStatus, setOrderStatus] = useState<string>("");
  const [selectedSubAccountId, setSelectedSubAccountId] = useState<number>(0);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.LIMIT);
  const [marketIndex, setMarketIndex] = useState<number>(0);
  const [direction, setDirection] = useState<PositionDirection>(
    PositionDirection.LONG
  );
  const [baseAssetAmount, setBaseAssetAmount] = useState<string>("0.1");
  const [price, setPrice] = useState<string>("100");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (publicKey) {
      fetchUserAccounts(publicKey);
    }
  }, [publicKey, fetchUserAccounts]);

  // Set first account as default when accounts are loaded
  useEffect(() => {
    if (userAccounts.length > 0 && !selectedSubAccountId) {
      setSelectedSubAccountId(userAccounts[0].subAccountId);
    }
  }, [userAccounts, selectedSubAccountId]);

  const handleAccountSwitch = async (accountId: number) => {
    try {
      await driftClient?.switchActiveUser(accountId);
      setSelectedSubAccountId(accountId);
    } catch (error) {
      console.error("Error switching account:", error);
      setOrderStatus(
        `Error switching account: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handlePlaceOrder = async () => {
    if (!driftClient || !publicKey || !signTransaction) {
      setOrderStatus("Please connect your wallet first");
      return;
    }

    if (userAccounts.length === 0) {
      setOrderStatus("You need to create an account first");
      return;
    }

    try {
      setIsProcessing(true);
      setOrderStatus("Preparing order transaction...");

      // Convert amounts to the correct precision
      const amount = driftClient.convertToPerpPrecision(
        parseFloat(baseAssetAmount)
      );
      // Create order parameters
      const orderParams: OptionalOrderParams = {
        orderType,
        marketIndex,
        direction,
        baseAssetAmount: amount,
      };

      if (orderType == OrderType.LIMIT) {
        orderParams.price = driftClient.convertToPricePrecision(
          parseFloat(price)
        );
      }

      // Get the order instructions
      const orderIxs = await driftClient.getPlacePerpOrderIx(
        orderParams,
        selectedSubAccountId
      );

      // Build transaction from instructions
      const tx = await driftClient.buildTransaction(orderIxs);

      // Sign the transaction with the user's wallet
      const signedTx = await signTransaction(tx);

      // Send the transaction
      const { txSig } = await driftClient.sendTransaction(
        signedTx,
        [],
        driftClient.opts
      );

      setOrderStatus(
        `Order placed successfully! Transaction signature: ${txSig}`
      );
    } catch (error) {
      console.error("Error placing order:", error);
      setOrderStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getMarketSymbol = (index: number): string => {
    return MARKET_SYMBOLS[index as keyof typeof MARKET_SYMBOLS] || "SOL";
  };

  if (userAccounts.length === 0) {
    return (
      <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
        <p className="text-red-400 flex items-center">
          <WarningIcon className="w-5 h-5 mr-2" />
          You need to create a user account first before placing orders.
        </p>
        <button
          onClick={() => fetchUserAccounts(publicKey)}
          disabled={isLoading || !publicKey}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mt-3 transition-colors duration-200 flex items-center"
        >
          <RefreshIcon className="w-4 h-4 mr-2" />
          Refresh Accounts
        </button>
      </div>
    );
  }

  return (
    <div className="w-full md:w-2/5 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Account
        </label>
        <div className="flex space-x-2">
          {userAccounts.map((account) => (
            <button
              key={account.subAccountId}
              onClick={() => handleAccountSwitch(account.subAccountId)}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                selectedSubAccountId === account.subAccountId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {account.name
                ? new TextDecoder().decode(new Uint8Array(account.name))
                : `Account ${account.subAccountId}`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Order Type
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => setOrderType(OrderType.LIMIT)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              orderType === OrderType.LIMIT
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Limit
          </button>
          <button
            onClick={() => setOrderType(OrderType.MARKET)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              orderType === OrderType.MARKET
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Market
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Direction
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => setDirection(PositionDirection.LONG)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              direction === PositionDirection.LONG
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Long
          </button>
          <button
            onClick={() => setDirection(PositionDirection.SHORT)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              direction === PositionDirection.SHORT
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Short
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Market
        </label>
        <div className="relative">
          <select
            value={marketIndex}
            onChange={(e) => setMarketIndex(Number(e.target.value))}
            className="w-full bg-gray-700 text-white rounded-lg p-3 pl-10 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
          >
            {Object.entries(MARKET_NAMES).map(([index, name]) => (
              <option key={index} value={index}>
                {name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Image
              src={
                MARKET_ICONS[
                  getMarketSymbol(marketIndex) as keyof typeof MARKET_ICONS
                ] || PLACEHOLDER_ICON
              }
              alt={getMarketSymbol(marketIndex)}
              className="w-5 h-5"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_ICON;
              }}
              width={20}
              height={20}
            />
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Size
        </label>
        <div className="relative">
          <input
            type="number"
            value={baseAssetAmount}
            onChange={(e) => setBaseAssetAmount(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg p-3 pl-10 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            min="0"
            step="0.1"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <ChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-400">
              {getMarketSymbol(marketIndex)}
            </span>
          </div>
        </div>
      </div>

      {orderType === OrderType.LIMIT && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Price
          </label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg p-3 pl-10 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              min="0"
              step="0.1"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <CurrencyIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400">USD</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={isProcessing || !publicKey}
        className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
          direction === PositionDirection.LONG
            ? "bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
            : "bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
        } text-white disabled:cursor-not-allowed`}
      >
        {isProcessing ? (
          <>
            <LoadingIcon className="-ml-1 mr-2 h-5 w-5 text-white" />
            Processing...
          </>
        ) : (
          <>
            {direction === PositionDirection.LONG ? (
              <LongIcon className="w-5 h-5 mr-2" />
            ) : (
              <ShortIcon className="w-5 h-5 mr-2" />
            )}
            {direction === PositionDirection.LONG
              ? "Buy / Long"
              : "Sell / Short"}{" "}
            {MARKET_NAMES[marketIndex as keyof typeof MARKET_NAMES]}
          </>
        )}
      </button>

      {orderStatus && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-start wrap-break-word ${
            orderStatus.includes("Error")
              ? "bg-red-900/30 border border-red-700 text-red-400"
              : orderStatus.includes("successful")
              ? "bg-green-900/30 border border-green-700 text-green-400"
              : "bg-blue-900/30 border border-blue-700 text-blue-400"
          }`}
        >
          {orderStatus.includes("Error") ? (
            <ErrorIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          ) : orderStatus.includes("successful") ? (
            <SuccessIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          ) : (
            <LoadingIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          )}
          <span>{orderStatus}</span>
        </div>
      )}
    </div>
  );
};
