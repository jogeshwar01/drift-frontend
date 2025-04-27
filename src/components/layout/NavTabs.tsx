"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import { useDriftStore } from "@/store/driftStore";
import { DriftEnv } from "@drift-labs/sdk";

const accountTabs = [
  {
    id: "create-account",
    label: "Account",
    text: "View wallet subaccounts and balances. Create new subaccounts.",
    description:
      "Manage your wallet accounts and view detailed balance information.",
  },
  {
    id: "wallet-data",
    label: "View Wallet Data",
    text: "View wallet data.",
    description: "View subaccount data for any wallet.",
  },
];

const tradeTabs = [
  {
    id: "perp",
    label: "Perpetuals",
    description:
      "Trade perpetual futures with leverage and advanced order types.",
  },
  {
    id: "spot",
    label: "Spot",
    disabled: true,
    description: "Trade digital assets in real-time with spot trading.",
  },
];

const depositWithdrawTabs = [
  {
    id: "deposit",
    label: "Deposit",
  },
  {
    id: "withdraw",
    label: "Withdraw",
  },
];

const networkTabs = [
  {
    id: "mainnet-beta" as DriftEnv,
    label: "Mainnet",
    description: "Connect to Solana mainnet for production trading.",
  },
  {
    id: "devnet" as DriftEnv,
    label: "Devnet",
    description: "Connect to Solana devnet for testing and development.",
  },
];

interface NavTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function NavTabs({ activeTab, setActiveTab }: NavTabsProps) {
  const { network, setNetwork } = useDriftStore();

  const handleNetworkChange = (newNetwork: DriftEnv) => {
    const rpcUrl =
      newNetwork === "mainnet-beta"
        ? process.env.NEXT_PUBLIC_MAINNET_RPC_URL!
        : process.env.NEXT_PUBLIC_DEVNET_RPC_URL!;
    setNetwork(newNetwork, rpcUrl);
  };

  return (
    <NavigationMenu className="border border-muted p-1 rounded-md">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={`${
              accountTabs.some((tab) => tab.id === activeTab)
                ? "bg-muted/75"
                : "bg-transparent"
            }`}
          >
            <div
              className={`${
                accountTabs.some((tab) => tab.id === activeTab) &&
                "text-transparent bg-[image:var(--color-primary-gradient)] bg-clip-text"
              }`}
            >
              Account
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 flex w-[466px]">
              <div className="w-[40%] h-44 from-muted/50 to-chart-4/50 bg-linear-to-b gap-2 flex flex-col p-4 items-start justify-end rounded-md">
                <Image src="/favicon.svg" alt="logo" width={40} height={40} />
                <div className="font-semibold text-white">Account</div>
                <div className="text-sm text-muted-foreground">
                  View wallet subaccounts and balances
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-2 items-start justify-start w-[60%] h-full">
                {accountTabs.map((tab) => (
                  <NavigationMenuLink
                    key={tab.id}
                    asChild
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={
                      activeTab === tab.id
                        ? "text-transparent bg-[image:var(--color-primary-gradient)] bg-clip-text"
                        : "cursor-pointer"
                    }
                  >
                    <button className="px-4 py-2 text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {tab.description}
                      </div>
                    </button>
                  </NavigationMenuLink>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={`${
              tradeTabs.some((tab) => tab.id === activeTab)
                ? "bg-muted/75"
                : "bg-transparent"
            }`}
          >
            <div
              className={`${
                tradeTabs.some((tab) => tab.id === activeTab) &&
                "text-transparent bg-[image:var(--color-primary-gradient)] bg-clip-text"
              }`}
            >
              Trade
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 flex w-[466px]">
              <div className="w-[50%] h-48 from-muted/50 to-chart-1/50 bg-linear-to-b gap-2 flex flex-col p-4 items-start justify-end rounded-md">
                <Image src="/favicon.svg" alt="logo" width={40} height={40} />
                <div className="font-semibold text-white">Trade</div>
                <div className="text-sm text-muted-foreground">
                  Trade perpetual futures with leverage and advanced order
                  types.
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start justify-start w-[50%] ml-2">
                {tradeTabs.map((tab) => (
                  <NavigationMenuLink
                    key={tab.id}
                    asChild
                    active={activeTab === tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    className={
                      activeTab === tab.id
                        ? "text-transparent bg-[image:var(--color-primary-gradient)] bg-clip-text text-md"
                        : tab.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  >
                    <button className="px-4 py-2 text-left">
                      <div className="font-medium">
                        {tab.label}
                        {tab.disabled && (
                          <span className="ml-2 italic text-sm text-muted-foreground">
                            (Coming Soon)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tab.description}
                      </div>
                    </button>
                  </NavigationMenuLink>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {depositWithdrawTabs.map((tab) => (
          <NavigationMenuItem key={tab.id}>
            <NavigationMenuLink
              asChild
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-left ${
                activeTab === tab.id ? "bg-muted/75" : "bg-transparent"
              }`}
            >
              <button className="w-full text-left">
                <div
                  className={`font-medium ${
                    activeTab === tab.id
                      ? "text-transparent bg-[image:var(--color-primary-gradient)] bg-clip-text"
                      : "cursor-pointer"
                  }`}
                >
                  {tab.label}
                </div>
              </button>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent focus:bg-transparent">
            <span className="text-muted-foreground">
              {network.split("-")[0].charAt(0).toUpperCase() +
                network.split("-")[0].slice(1)}
            </span>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="px-2 py-4 flex w-[466px]">
              <div className="w-[45%] h-44 from-muted/50 to-chart-3/50 bg-linear-to-b gap-2 flex flex-col p-4 ml-2 items-start justify-end rounded-md">
                <Image src="/favicon.svg" alt="logo" width={40} height={40} />
                <div className="font-semibold text-white">Network</div>
                <div className="text-sm text-muted-foreground">
                  Connect to Solana mainnet or devnet.
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start justify-start w-[50%] ml-2">
                {networkTabs.map((tab) => (
                  <NavigationMenuLink
                    key={tab.id}
                    asChild
                    active={network === tab.id}
                    onClick={() => handleNetworkChange(tab.id)}
                    className="px-4 py-2"
                  >
                    <button className="w-full text-left cursor-pointer">
                      <div
                        className={`font-medium ${
                          network === tab.id
                            ? "text-transparent bg-[image:var(--color-primary-gradient)] bg-clip-text"
                            : "text-white"
                        }`}
                      >
                        {tab.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tab.description}
                      </div>
                    </button>
                  </NavigationMenuLink>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
