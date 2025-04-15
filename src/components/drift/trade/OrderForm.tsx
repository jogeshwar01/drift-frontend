"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  OptionalOrderParams,
  OrderType,
  PositionDirection,
  MarketType,
  OrderTriggerCondition,
} from "@drift-labs/sdk";
import {
  MARKET_SYMBOLS,
  MARKET_NAMES,
} from "@/config/constants";
import {
  WarningIcon,
  RefreshIcon,
  ChartIcon,
  CurrencyIcon,
  LongIcon,
  ShortIcon,
  LoadingIcon,
  SuccessIcon,
  ErrorIcon,
} from "@/components/icons";

interface OrderFormProps {
  selectedSubAccountId: number;
}

export const OrderForm = ({
  selectedSubAccountId,
}: OrderFormProps) => {
  const driftClient = useDriftStore((state) => state.driftClient);
  const { publicKey, signTransaction } = useWallet();
  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);
  const userAccounts = useDriftStore((state) => state.userAccounts);
  const isLoading = useDriftStore((state) => state.isLoading);

  const [orderStatus, setOrderStatus] = useState<string>("");
  const [orderType, setOrderType] = useState<OrderType>(OrderType.LIMIT);
  const [marketIndex, setMarketIndex] = useState<number>(0);
  const [direction, setDirection] = useState<PositionDirection>(
    PositionDirection.LONG
  );
  const [baseAssetAmount, setBaseAssetAmount] = useState<string>("0.1");
  const [price, setPrice] = useState<string>("100");
  const [triggerPrice, setTriggerPrice] = useState<string>("100");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [orderVariant, setOrderVariant] = useState<string>("limit"); // "limit", "market", "takeProfit", "stopLimit"

  // Scale order states
  const [isScaleOrder, setIsScaleOrder] = useState<boolean>(false);
  const [startPrice, setStartPrice] = useState<string>("100");
  const [endPrice, setEndPrice] = useState<string>("110");
  const [orderCount, setOrderCount] = useState<string>("3");

  useEffect(() => {
    if (publicKey) {
      fetchUserAccounts(publicKey);
    }
  }, [publicKey, fetchUserAccounts]);

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

      if (isScaleOrder) {
        // Handle scale orders
        const start = parseFloat(startPrice);
        const end = parseFloat(endPrice);
        const count = parseInt(orderCount);

        if (count <= 0) {
          throw new Error("Order count must be greater than 0");
        }

        if (start === end) {
          throw new Error("Start and end prices must be different");
        }

        // Calculate price step
        const step = (end - start) / (count - 1);

        // Create multiple order parameters
        const placeOrderParams: OptionalOrderParams[] = [];

        for (let i = 0; i < count; i++) {
          const currentPrice = start + step * i;
          const amount = driftClient.convertToPerpPrecision(
            parseFloat(baseAssetAmount) / count
          );

          placeOrderParams.push({
            orderType: OrderType.LIMIT,
            marketType: MarketType.PERP,
            marketIndex,
            direction,
            baseAssetAmount: amount,
            price: driftClient.convertToPricePrecision(currentPrice),
          });
        }

        // Get the order instructions
        const orderIxs = await driftClient.getPlaceOrdersIx(
          placeOrderParams,
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
          `Scale orders placed successfully! Transaction signature: ${txSig}`
        );
      } else {
        // Handle single order (market, limit, or trigger)
        // Convert amounts to the correct precision
        const amount = driftClient.convertToPerpPrecision(
          parseFloat(baseAssetAmount)
        );
        
        // Create order parameters
        const orderParams: OptionalOrderParams = {
          orderType,
          marketType: MarketType.PERP,
          marketIndex,
          direction,
          baseAssetAmount: amount,
        };

        // Add price for limit orders
        if (orderVariant === "limit" || orderVariant === "takeProfit" || orderVariant === "stopLimit") {
          orderParams.price = driftClient.convertToPricePrecision(
            parseFloat(price)
          );
        }
        
        // Add trigger price and condition for trigger orders (take profit and stop limit)
        if (orderVariant === "takeProfit" || orderVariant === "stopLimit") {
          orderParams.triggerPrice = driftClient.convertToPricePrecision(
            parseFloat(triggerPrice)
          );
          
          // Set trigger condition based on order variant and direction
          // Take Profit: Executes when price moves favorably (above entry for longs, below entry for shorts)
          // Stop Limit: Executes when price moves unfavorably (below entry for longs, above entry for shorts)
          if (orderVariant === "takeProfit") {
            // Take profit conditions
            orderParams.triggerCondition = direction === PositionDirection.LONG
              ? OrderTriggerCondition.ABOVE  // For long positions, trigger when price goes above the trigger price
              : OrderTriggerCondition.BELOW; // For short positions, trigger when price goes below the trigger price
          } else {
            // Stop limit conditions
            orderParams.triggerCondition = direction === PositionDirection.LONG
              ? OrderTriggerCondition.BELOW  // For long positions, trigger when price goes below the trigger price
              : OrderTriggerCondition.ABOVE; // For short positions, trigger when price goes above the trigger price
          }
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
      }
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
          Direction
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => setDirection(PositionDirection.LONG)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              JSON.stringify(direction) === JSON.stringify(PositionDirection.LONG)
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <div className="flex items-center justify-center">
              <LongIcon className="w-4 h-4 mr-2" />
              Long
            </div>
          </button>
          <button
            onClick={() => setDirection(PositionDirection.SHORT)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              JSON.stringify(direction) === JSON.stringify(PositionDirection.SHORT)
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <div className="flex items-center justify-center">
              <ShortIcon className="w-4 h-4 mr-2" />
              Short
            </div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Order Type
        </label>
        <select
          value={isScaleOrder ? "scale" : orderVariant}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "scale") {
              setIsScaleOrder(true);
            } else {
              setIsScaleOrder(false);
              setOrderVariant(value);
              
              // Set the appropriate OrderType based on the variant
              if (value === "market") {
                setOrderType(OrderType.MARKET);
              } else if (value === "limit") {
                setOrderType(OrderType.LIMIT);
              } else if (value === "takeProfit" || value === "stopLimit") {
                setOrderType(OrderType.TRIGGER_LIMIT);
              }
            }
          }}
          className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
          <option value="limit">Limit</option>
          <option value="market">Market</option>
          <option value="takeProfit">Take Profit</option>
          <option value="stopLimit">Stop Limit</option>
          <option value="scale">Scale</option>
        </select>
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

      {isScaleOrder ? (
        <>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={startPrice}
                  onChange={(e) => setStartPrice(e.target.value)}
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

            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={endPrice}
                  onChange={(e) => setEndPrice(e.target.value)}
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Orders
            </label>
            <div className="relative">
              <input
                type="number"
                value={orderCount}
                onChange={(e) => setOrderCount(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg p-3 pl-10 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                min="2"
                step="1"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <ChartIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price
            </label>
            <div className="relative">
              <input
                type="number"
                value={orderVariant !== "market" ? price : ""}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={orderVariant === "market" ? "Market Price" : ""}
                disabled={orderVariant === "market"}
                className="w-full bg-gray-700 text-white rounded-lg p-3 pl-10 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-gray-600 disabled:text-gray-400"
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

          {(orderVariant === "takeProfit" || orderVariant === "stopLimit") && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trigger Price
                {orderVariant === "takeProfit" ? 
                  ` (${direction === PositionDirection.LONG ? "Above" : "Below"} this price)` : 
                  ` (${direction === PositionDirection.LONG ? "Below" : "Above"} this price)`}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
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
        </>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={isProcessing || !publicKey}
        className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
          JSON.stringify(direction) === JSON.stringify(PositionDirection.LONG)
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
            {JSON.stringify(direction) === JSON.stringify(PositionDirection.LONG) ? (
              <LongIcon className="w-5 h-5 mr-2" />
            ) : (
              <ShortIcon className="w-5 h-5 mr-2" />
            )}
            {isScaleOrder
              ? "Place Scale Orders"
              : JSON.stringify(direction) === JSON.stringify(PositionDirection.LONG)
              ? "Buy / Long"
              : "Sell / Short"}{" "}
            {MARKET_NAMES[marketIndex as keyof typeof MARKET_NAMES]}
          </>
        )}
      </button>

      {orderStatus && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-start wrap-anywhere max-w-full ${
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
