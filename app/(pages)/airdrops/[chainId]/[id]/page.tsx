import * as AirdropUtils from "@/app/utils/airdrop";
import AirdropDetail from "@/app/components/airdrops/Detail";
import Render404 from "@/app/components/errors/404";

export default async function AirdropPage({ params }: { params: { chainId: string; id: string } }) {
  // For mock
  // const chainId = "11155111";
  // const airdropId = "06f9666f-a3d7-41c6-8de6-fcd7c208a0d0";
  const airdrop = await AirdropUtils.getAirdropById(params.id as string);

  // TODO Set up meta tags

  return airdrop ? (
    <AirdropDetail chainId={params.chainId} initAirdrop={AirdropUtils.toHexString(airdrop)} />
  ) : (
    <Render404 />
  );
}
