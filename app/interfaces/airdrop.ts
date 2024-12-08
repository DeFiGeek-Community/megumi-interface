export interface ClaimProps {
    isLinearVesting: boolean;
  }

  type StandardClaim = {
    amount: bigint;
    isClaimed: boolean;
  };
  type LinearVestingClaim = StandardClaim & {
    claimedAmount: bigint;
    claimable: bigint;
  };