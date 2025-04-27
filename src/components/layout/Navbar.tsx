"use client";

import { WalletMultiButtonDynamic } from "@/components/wallet/WalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { NavTabs } from "./NavTabs";
import { NavMobile } from "./NavMobile";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: "create-account", label: "Account" },
  { id: "deposit", label: "Deposit" },
  { id: "withdraw", label: "Withdraw" },
  { id: "perp", label: "Perp" },
  { id: "wallet-data", label: "View Wallet Data" },
];

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { publicKey } = useWallet();

  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <div className="w-full relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center pt-4 border-muted">
          <Image
            src="/drift-logo.svg"
            alt="Drift"
            width={90}
            height={90}
            className="hidden lg:block"
            priority={true}
          />
          <Image
            src="/favicon.svg"
            alt="Drift"
            width={40}
            height={40}
            className="lg:hidden"
            priority={true}
          />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {publicKey && (
              <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
          </div>

          {/* Mobile Navigation */}
          {publicKey && (
            <NavMobile
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeTabLabel={activeTabLabel ?? ""}
            />
          )}

          <WalletMultiButtonDynamic />
        </div>
      </div>
    </div>
  );
}
