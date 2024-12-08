export interface ClaimProps {
  isLinearVesting: boolean;
  currentVestingEndsAt?: string;
}

type StandardClaim = {
  amount: bigint;
  isClaimed: boolean;
};
type LinearVestingClaim = StandardClaim & {
  claimedAmount: bigint;
  claimable: bigint;
};
