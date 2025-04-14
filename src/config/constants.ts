export const DRIFT_ICON_URL = "https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/";

export const MARKET_ICONS = {
  SOL: `${DRIFT_ICON_URL}sol.svg`,
  BTC: `${DRIFT_ICON_URL}btc.svg`,
  ETH: `${DRIFT_ICON_URL}eth.svg`,
  USDC: `${DRIFT_ICON_URL}usdc.svg`,
} as const;

export const PLACEHOLDER_ICON = "/placeholder-token.svg";

export const MARKET_SYMBOLS = {
  0: "SOL",
  1: "BTC",
  2: "ETH",
} as const;

export const MARKET_NAMES = {
  0: "SOL-PERP",
  1: "BTC-PERP",
  2: "ETH-PERP",
} as const;
