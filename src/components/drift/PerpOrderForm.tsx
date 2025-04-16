"use client";
import { OrderForm } from "./trade/OrderForm";
import { OrdersHistory } from "./trade/OrdersHistory";
import { DriftPriceChart } from "./DriftPriceChart";
import { useState, useEffect } from "react";
import { useDriftStore } from "@/store/driftStore";
import { SubAccountSelector } from "./trade/SubAccountSelector";

export const PerpOrderForm = () => {
  const userAccounts = useDriftStore((state) => state.userAccounts);
  const driftClient = useDriftStore((state) => state.driftClient);
  const [selectedSubAccountId, setSelectedSubAccountId] = useState<number>(0);

  const switchAccount = async (subAccountId: number) => {
    try {
      await driftClient?.switchActiveUser(subAccountId);
      setSelectedSubAccountId(subAccountId);
    } catch (error) {
      console.error("Error switching account:", error);
    }
  };

  // Set first account as default when accounts are loaded
  useEffect(() => {
    if (userAccounts.length > 0) {
      const defaultAccountId = userAccounts[0].subAccountId;
      setSelectedSubAccountId(defaultAccountId);
    }
  }, [userAccounts, driftClient]);

  return (
    <div className="bg-background border border- h-full rounded-lg p-4 shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-semibold text-transparent bg-[image:var(--color-primary-gradient)] bg-clip-text">
          Trade SOL-PERP
        </h2>

        <div className="flex items-center gap-2 w-2/5 px-2">
          <SubAccountSelector
            selectedSubAccountId={selectedSubAccountId}
            onSubAccountChange={switchAccount}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/5 transition-all duration-300 ease-in-out">
            <DriftPriceChart
              marketSymbol={" SOL"}
              marketMint={"So11111111111111111111111111111111111111112"}
            />
          </div>

          <OrderForm selectedSubAccountId={selectedSubAccountId} />
        </div>

        <div className="w-full">
          <OrdersHistory
            selectedSubAccountId={selectedSubAccountId}
            onSubAccountChange={switchAccount}
          />
        </div>
      </div>
    </div>
  );
};
