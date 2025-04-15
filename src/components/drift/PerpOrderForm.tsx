"use client";
import { OrderForm } from "./trade/OrderForm";
import { OrdersHistory } from "./trade/OrdersHistory";
import { DriftPriceChart } from "./DriftPriceChart";
import { OrderIcon } from "@/components/icons";

export const PerpOrderForm = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <OrderIcon className="w-6 h-6 mr-2 text-blue-400" />
        Place Perpetual Order
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/5 transition-all duration-300 ease-in-out">
            <DriftPriceChart
              marketSymbol={" SOL"}
              marketMint={"So11111111111111111111111111111111111111112"}
            />
          </div>

          <OrderForm />
        </div>

        <div className="w-full">
          <OrdersHistory />
        </div>
      </div>
    </div>
  );
};
