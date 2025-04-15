"use client";
import { useDriftStore } from "@/store/driftStore";
import { useEffect, useState } from "react";
import { MARKET_NAMES } from "@/config/constants";
import {
  LongIcon,
  ShortIcon,
  LoadingIcon,
  ErrorIcon,
  RefreshIcon,
} from "@/components/icons";
import { Order, OrderType, PositionDirection } from "@drift-labs/sdk";
import { SubAccountSelector } from "./SubAccountSelector";
import { useWallet } from "@solana/wallet-adapter-react";

interface OrdersHistoryProps {
  selectedSubAccountId: number;
  onSubAccountChange: (subAccountId: number) => void;
}

export const OrdersHistory = ({
  selectedSubAccountId,
  onSubAccountChange,
}: OrdersHistoryProps) => {
  const userAccounts = useDriftStore((state) => state.userAccounts);
  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);
  const { publicKey } = useWallet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const account = userAccounts.find(
        (acc) => acc.subAccountId === selectedSubAccountId
      );
      if (!account) {
        setError("Account not found");
        return;
      }
      // Filter for open orders
      const openOrders = account.orders.filter(
        (order) =>
          order.slot &&
          (order.slot.words?.[0] !== 0 ||
            order.slot.words?.[1] !== 0 ||
            order.slot.words?.[2] !== 0)
      );

      setOrders(openOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userAccounts, selectedSubAccountId]);

  const handleRefreshOrders = async () => {
    if (!publicKey || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await fetchUserAccounts(publicKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh orders");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatAmount = (amount: string) => {
    return (parseInt(amount, 16) / 1e9).toFixed(5);
  };

  const formatPrice = (price: string) => {
    return (parseInt(price, 10) / 1e6).toFixed(2);
  };


  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-center p-4">
          <LoadingIcon className="w-6 h-6 text-blue-400" />
          <span className="ml-2 text-gray-300">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center p-4 text-red-400">
          <ErrorIcon className="w-6 h-6" />
          <span className="ml-2">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div className="w-1/2">
            <SubAccountSelector
              selectedSubAccountId={selectedSubAccountId}
              onSubAccountChange={onSubAccountChange}
            />
          </div>
          <button
            onClick={handleRefreshOrders}
            disabled={isRefreshing || !publicKey}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ml-4"
          >
            <RefreshIcon
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh Orders"}
          </button>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-4">Orders History</h3>
      {orders.length === 0 ? (
        <div className="text-gray-400 text-center py-4">No orders history</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Market
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {
                      MARKET_NAMES[
                        order.marketIndex as keyof typeof MARKET_NAMES
                      ]
                    }
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {JSON.stringify(order.orderType) ===
                    JSON.stringify(OrderType.MARKET)
                      ? "Market"
                      : "Limit"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      {JSON.stringify(order.direction) ===
                      JSON.stringify(PositionDirection.LONG) ? (
                        <>
                          <LongIcon className="w-4 h-4 text-green-400 mr-1" />
                          <span className="text-green-400">Long</span>
                        </>
                      ) : (
                        <>
                          <ShortIcon className="w-4 h-4 text-red-400 mr-1" />
                          <span className="text-red-400">Short</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {formatAmount(order.baseAssetAmount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {JSON.stringify(order.orderType) !==
                    JSON.stringify(OrderType.MARKET)
                      ? `$${formatPrice(order.price)}`
                      : "Market Price"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {Object.keys(order.status)[0].toUpperCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
