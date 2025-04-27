"use client";
import { useDriftStore } from "@/store/driftStore";
import { useWallet } from "@solana/wallet-adapter-react";
import { Refresh } from "@mui/icons-material";
import { Dispatch, SetStateAction } from "react";

interface RefreshAccountsScreenProps {
  isLoadingAccounts: boolean;
  setIsLoadingAccounts: Dispatch<SetStateAction<boolean>>;
}

export const RefreshAccountsScreen = ({
  isLoadingAccounts,
  setIsLoadingAccounts,
}: RefreshAccountsScreenProps) => {
  const { publicKey } = useWallet();
  const fetchUserAccounts = useDriftStore((state) => state.fetchUserAccounts);

  const handleRefreshAccounts = async () => {
    if (publicKey) {
      setIsLoadingAccounts(true);
      try {
        await fetchUserAccounts(publicKey);
      } finally {
        setIsLoadingAccounts(false);
      }
    }
  };

  return (
    <div className="mb-4 p-4 bg-red-900/30 border h-[40vh] flex justify-center items-center flex-col gap-2 border-red-700 rounded-lg">
      <p className="text-red-400">
        You need to create a user account first before performing any transaction.
      </p>
      <button
        onClick={handleRefreshAccounts}
        disabled={isLoadingAccounts || !publicKey}
        className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-lg mt-3 transition-colors duration-200 flex items-center"
      >
        <Refresh className="w-4 h-4 mr-2" />
        Refresh Accounts
      </button>
    </div>
  );
};
