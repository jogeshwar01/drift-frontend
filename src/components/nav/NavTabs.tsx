"use client";

const tabs = [
  { id: "create-account", label: "Account" },
  { id: "deposit", label: "Deposit" },
  { id: "withdraw", label: "Withdraw" },
  { id: "trade", label: "Trade" },
  { id: "wallet-data", label: "View Wallet Data" },
];

interface NavTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function NavTabs({ activeTab, setActiveTab }: NavTabsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            py-2 px-3 rounded-full font-medium text-sm cursor-pointer relative 
            ${
              activeTab !== tab.id &&
              "text-gray-400 hover:text-gray-300 hover:bg-muted/25"
            }
          `}
        >
          {tab.label}

          {activeTab === tab.id && (
            <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[image:var(--color-primary-gradient)]"></span>
          )}
        </button>
      ))}
    </div>
  );
}
