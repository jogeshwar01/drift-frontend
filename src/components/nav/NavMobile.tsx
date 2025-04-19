"use client";

import { useState } from "react";
import { NetworkToggle } from "../drift/NetworkToggle";
import { Menu, X } from "lucide-react";

interface NavMobileProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeTabLabel: string;
}

const tabs = [
  { id: "create-account", label: "Account" },
  { id: "deposit", label: "Deposit" },
  { id: "withdraw", label: "Withdraw" },
  { id: "trade", label: "Trade" },
  { id: "wallet-data", label: "View Wallet Data" },
];

export function NavMobile({
  activeTab,
  setActiveTab,
  activeTabLabel,
}: NavMobileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <div className="flex items-center space-x-1">
        <span className="py-2 px-3 rounded-full text-sm cursor-pointer font-medium relative">
          {activeTabLabel}
          <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[image:var(--color-primary-gradient)]"></span>
        </span>
        <button
          className="p-2 rounded-md hover:bg-muted/25"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-300" />
          ) : (
            <Menu className="w-6 h-6 text-gray-300" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[280px] bg-background shadow-lg">
            <div className="p-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  {tabs.map(
                    (tab) =>
                      tab.id !== activeTab && (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMenuOpen(false);
                          }}
                          className="py-2 px-3 rounded-full font-medium text-sm cursor-pointer text-gray-400 hover:text-gray-300 hover:bg-muted/25"
                        >
                          {tab.label}
                        </button>
                      )
                  )}
                </div>
                <div className="flex justify-center">
                  <NetworkToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
