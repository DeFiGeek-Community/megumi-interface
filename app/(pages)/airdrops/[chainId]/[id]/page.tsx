import type { Metadata, ResolvingMetadata } from "next";
import * as AirdropUtils from "@/app/utils/airdrop";
import AirdropDetail from "@/app/components/airdrops/Detail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { uint8ArrayToHexString } from "@/app/utils/apiHelper";
import NotFound from "@/app/components/errors/NotFound";


type Props = {
  params: { chainId: string; id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const airdrop = await AirdropUtils.getAirdropById(params.id as string);
  const fallbackImage = "/fallback-image.jpg"; // TODO

  if (!airdrop) {
    return {
      title: "Airdrop Not Found",
    };
  }

  return {
    title: `${airdrop.title} | Megumi - Airdrop tool -`,
    description: `${airdrop.title}`,
    openGraph: {
      siteName: "Megumi - Airdrop tool -",
      images: [{ url: airdrop.tokenLogo || fallbackImage }],
      type: "article",
      publishedTime: airdrop.contractRegisteredAt
        ? airdrop.contractRegisteredAt.toISOString()
        : undefined,
    },
  };
}

export default async function AirdropPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const airdrop = await AirdropUtils.getAirdropById(params.id as string);
  // If airdrop is not found, return 404
  if (!airdrop) return <NotFound />;

  // If the contract is not registered yet AND the user is NOT the owner, return 404
  // TODO Should be handled in the prisma query
  const signedInUserAddress = session?.user.safeAddress || session?.user.address;
  const shouldNotVisible =
    !airdrop.contractRegisteredAt &&
    signedInUserAddress?.toLowerCase() !== uint8ArrayToHexString(airdrop.owner).toLowerCase();
  if (shouldNotVisible) return <NotFound />;

  return <AirdropDetail chainId={params.chainId} initAirdrop={AirdropUtils.toHexString(airdrop)} />;
}
