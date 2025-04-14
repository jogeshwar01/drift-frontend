"use client";

import React from "react";
import Image from "next/image";

import { SolAsset } from "@/lib/types";
import { DRIFT_ICON_URL } from "@/config/constants";

type IconProps = {
  asset: SolAsset | null;
  size?: number;
};

const TokenIcon = ({ asset, size = 24 }: IconProps) => {
  return (
    <div
      className="relative shrink-0 rounded-full border border-border bg-background p-0"
      style={{
        width: size + 2,
        height: size + 2,
      }}
    >
      <Image
        src={`${DRIFT_ICON_URL}${asset?.symbol ?? "sol"}.svg`}
        alt={asset?.symbol ?? asset?.mint?.toBase58() ?? ""}
        width={size}
        height={size}
        className="absolute inset-0 rounded-full"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `${DRIFT_ICON_URL}sol.svg`;
        }}
      />
    </div>
  );
};

export { TokenIcon };
