import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import { toHex } from "viem";
import { authOptions } from "@/app/api/auth/authOptions";

export async function GET(req: NextRequest, { params }: { params: { chainId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date || decodeURIComponent(date).match(/^\d{4}-\d{2}-\d{2}$/) === null) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 422 });
    }

    const res = await fetch(
      `https://deep-index.moralis.io/api/v2.2/dateToBlock?chain=${toHex(parseInt(params.chainId))}&date=${date}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "X-API-Key": process.env.MORALIS_API_KEY!,
        },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
