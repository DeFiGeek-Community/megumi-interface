import { NextResponse } from "next/server";
import { ChainNotFoundError, isAddress } from "viem";
import { respondError } from "@/app/utils/apiHelper";

export async function GET(
  request: Request,
  { params }: { params: { chainId: string } },
): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  if (!address || !isAddress(address)) return respondError(new Error("Address is invalid"), 422);

  // Mainnet only for now
  if (params.chainId !== "1") return respondError(new ChainNotFoundError());

  const apiUrl = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Fetch error");
    const data = await res.json();
    return NextResponse.json(JSON.stringify(data));
  } catch (e: unknown) {
    return respondError(e);
  }
}
