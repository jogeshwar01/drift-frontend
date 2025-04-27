"use client";
import { OrderForm } from "./trade/OrderForm";
import { OrdersHistory } from "./trade/OrdersHistory";
import { DriftPriceChart } from "./DriftPriceChart";
import { useState, useEffect } from "react";
import { useDriftStore } from "@/store/driftStore";
import { SubAccountSelector } from "./trade/SubAccountSelector";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="w-full h-full p-4 bg-muted/10 rounded-md">
      <div className="flex flex-col gap-4 h-full">
        <Card>
          <CardContent className="grid h-full p-0 md:grid-cols-5">
            <div className="h-full p-4 md:col-span-3">
              <div className="flex flex-col h-full gap-4">
                <div className="flex flex-col items-start gap-2">
                  <h2 className="text-xl font-semibold">SOL - PERP</h2>
                  <div className="text-sm text-muted-foreground">
                    Trade SOL Perpetual Futures with leverage and advanced order
                    types.
                  </div>
                </div>

                <div className="flex-1 min-h-[400px]">
                  <DriftPriceChart
                    marketSymbol={" SOL"}
                    marketMint={"So11111111111111111111111111111111111111112"}
                  />
                </div>
              </div>
            </div>

            <div className="h-full p-4 md:col-span-2">
              <div className="flex flex-col h-full gap-4">
                <div className="flex items-center gap-2">
                  <SubAccountSelector
                    selectedSubAccountId={selectedSubAccountId}
                    onSubAccountChange={switchAccount}
                  />
                </div>
                <OrderForm selectedSubAccountId={selectedSubAccountId} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <OrdersHistory
              selectedSubAccountId={selectedSubAccountId}
              onSubAccountChange={switchAccount}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
