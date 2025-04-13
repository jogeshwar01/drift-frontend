"use client";
import { useDriftStore } from "@/store/driftStore";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  OrderType,
  PositionDirection,
  OptionalOrderParams,
} from "@drift-labs/sdk";

export const PerpOrderForm = () => {
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
    }
  };

  // Helper function to convert string to OrderType
  const getOrderTypeFromString = (value: string): OrderType => {
    switch (value) {
      case "limit":
        return OrderType.LIMIT;
      case "market":
        return OrderType.MARKET;
      default:
        return OrderType.LIMIT;
    }
  };

  // Helper function to convert string to PositionDirection
  const getPositionDirectionFromString = (value: string): PositionDirection => {
    switch (value) {
      case "long":
        return PositionDirection.LONG;
      case "short":
        return PositionDirection.SHORT;
      default:
        return PositionDirection.LONG;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Place Perpetual Order</h2>

      {userAccounts.length === 0 ? (
        <div className="mb-4">
          <p className="text-red-500">
            You need to create a user account first before placing orders.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block mb-2">Select Account:</label>
            <select
              value={selectedSubAccountId}
              onChange={(e) => setSelectedSubAccountId(Number(e.target.value))}
              className="border p-2 rounded w-full"
            >
              {userAccounts.map((account, index) => (
                <option key={index} value={account.subAccountId}>
                  {account.name
                    ? new TextDecoder().decode(new Uint8Array(account.name))
                    : `Account ${account.subAccountId}`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Order Type:</label>
            <select
              value={orderType === OrderType.LIMIT ? "limit" : "market"}
              onChange={(e) =>
                setOrderType(getOrderTypeFromString(e.target.value))
              }
              className="border p-2 rounded w-full"
            >
              <option value="limit">Limit</option>
              <option value="market">Market</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Market Index:</label>
            <select
              value={marketIndex}
              onChange={(e) => setMarketIndex(Number(e.target.value))}
              className="border p-2 rounded w-full"
            >
              <option value={0}>SOL-PERP (0)</option>
              <option value={1}>BTC-PERP (1)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Direction:</label>
            <select
              value={direction === PositionDirection.LONG ? "long" : "short"}
              onChange={(e) =>
                setDirection(getPositionDirectionFromString(e.target.value))
              }
              className="border p-2 rounded w-full"
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Base Asset Amount:</label>
            <input
              type="number"
              value={baseAssetAmount}
              onChange={(e) => setBaseAssetAmount(e.target.value)}
              className="border p-2 rounded w-full"
              min="0"
              step="0.1"
            />
          </div>

          {orderType === OrderType.LIMIT && (
            <div className="mb-4">
              <label className="block mb-2">Price:</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border p-2 rounded w-full"
                min="0"
                step="0.1"
              />
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={isLoading || !publicKey}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            {isLoading ? "Processing..." : "Place Order"}
          </button>
        </>
      )}

      {orderStatus && <p className="mt-4 text-sm">{orderStatus}</p>}
    </div>
  );
};
