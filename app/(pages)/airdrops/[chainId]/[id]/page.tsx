import * as AirdropUtils from "@/app/utils/airdrop";
import AirdropDetail from "@/app/components/airdrops/Detail";
import Render404 from "@/app/components/errors/404";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { uint8ArrayToHexString } from "@/app/utils/apiHelper";

export default async function AirdropPage({ params }: { params: { chainId: string; id: string } }) {
  const session = await getServerSession(authOptions);

  const airdrop = await AirdropUtils.getAirdropById(params.id as string);
  // TODO Set up meta tags

  // If airdrop is not found,
  // or the contract is not registered yet AND the user is NOT the owner, return 404
  // TODO Should be handled in the prisma query
  return !airdrop ||
    (!airdrop.contractRegisteredAt &&
      session?.user.address.toLowerCase() !==
        uint8ArrayToHexString(airdrop.owner).toLowerCase()) ? (
    <Render404 />
  ) : (
    <AirdropDetail chainId={params.chainId} initAirdrop={AirdropUtils.toHexString(airdrop)} />
  );
}
