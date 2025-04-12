"use client";

import { useDriftStore } from "@/store/driftStore";
import { getDriftClient } from "@/app/actions/drift";
import { useEffect } from "react";

export function DriftProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { setDriftClient } = useDriftStore();

  useEffect(() => {
    const initializeDrift = async () => {
      try {
        await getDriftClient(setDriftClient);
      } catch (error) {
        console.error("Error in Drift initialization:", error);
      }
    };

    initializeDrift();
  }, [setDriftClient]);

  return <>{children}</>;
}
