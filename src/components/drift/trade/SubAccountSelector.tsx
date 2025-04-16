import { useDriftStore } from "@/store/driftStore";
import { UserAccount } from "@drift-labs/sdk";

interface SubAccountSelectorProps {
  selectedSubAccountId: number;
  onSubAccountChange: (subAccountId: number) => void;
}

export const SubAccountSelector = ({
  selectedSubAccountId,
  onSubAccountChange,
}: SubAccountSelectorProps) => {
  const userAccounts = useDriftStore((state) => state.userAccounts);

  const getAccountName = (account: UserAccount) => {
    if (account.name) {
      return new TextDecoder().decode(new Uint8Array(account.name));
    } else {
      return `Account ${account.subAccountId}`;
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Account
      </label>
      <select
        value={selectedSubAccountId}
        onChange={(e) => onSubAccountChange(Number(e.target.value))}
        className="w-full bg-background text-white rounded-lg p-3 border border-muted focus:outline-none transition-colors"
      >
        {userAccounts.map((account) => (
          <option key={account.subAccountId} value={account.subAccountId}>
            {getAccountName(account)}
          </option>
        ))}
      </select>
    </div>
  );
};
