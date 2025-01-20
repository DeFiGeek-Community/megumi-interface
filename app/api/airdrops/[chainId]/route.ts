import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { isAddress, type PublicClient } from "viem";
import { Prisma, prisma, type Airdrop } from "@/prisma";
import { getViemProvider, respondError } from "@/app/utils/apiHelper";
import { isSupportedChain } from "@/app/utils/chain";
import { authOptions } from "@/app/api/auth/authOptions";
import { getTokenInfo } from "@/app/utils/apiHelper";
import { hexStringToUint8Array } from "@/app/utils/apiHelper";
import { InvalidParameterError } from "@/app/types/errors";
import * as AirdropUtils from "@/app/utils/airdrop";
import { objectToKeyValueString } from "@/app/utils/shared";

// Create new airdrop
export async function POST(request: NextRequest, { params }: { params: { chainId: string } }) {
  const requestedChainId = parseInt(params.chainId);
  if (!isSupportedChain(requestedChainId)) {
    return NextResponse.json({ error: "URL Not Found" }, { status: 404 });
  }

  // TODO handle auth in middleware.ts
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { chainId, title, templateName, tokenLogo, owner } = body;
    const contractAddress = null; // Always null for the creation
    // TODO Take Safe into account
    // ↓ From Yamawake
    // (!session.user.siwe.resources && contractOwner === session.siwe.address) ||
    // (session.siwe.resources && contractOwner === session.siwe.resources[0])
    const _owner = session.user.address;

    if (_owner.toLowerCase() !== owner.toLowerCase()) {
      return respondError(new InvalidParameterError("Owner address is invalid"));
    }
    const provider = getViemProvider(parseInt(params.chainId)) as PublicClient;

    const { isValid, errors } = await AirdropUtils.validateParams(
      {
        chainId,
        title,
        contractAddress,
        templateName,
        owner,
        tokenLogo,
      },
      provider,
    );

    if (!isValid) {
      return respondError(new InvalidParameterError(objectToKeyValueString(errors)));
    }

    const airdrop = await prisma.airdrop.create({
      data: {
        chainId,
        title,
        contractAddress, // Always null for the creation
        templateName: hexStringToUint8Array(templateName),
        owner: hexStringToUint8Array(owner),
        tokenLogo,
      },
    });

    return NextResponse.json(AirdropUtils.toHexString(airdrop), { status: 201 });
  } catch (error) {
    console.error("Error creating airdrop:", error);
    return NextResponse.json({ error: "Failed to create airdrop" }, { status: 500 });
  }
}

// Get all airdrops
export async function GET(req: NextRequest, { params }: { params: { chainId: string } }) {
  try {
    const defaultPage = 1;
    const defaultLimit = 10;
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || String(defaultPage)) || defaultPage;
    const limit = parseInt(searchParams.get("limit") || String(defaultLimit)) || defaultLimit;
    const skip = (page - 1) * limit;

    const session = await getServerSession(authOptions);
    const mine = searchParams.get("mine") === "true";
    const eligible = searchParams.get("eligible");

    // TODO
    // mine以外は公開日でフィルター airdrop.contractDeployedAt
    const whereClause: any = {
      OR: [],
    };

    if (session && mine) {
      whereClause.OR.push({
        owner: hexStringToUint8Array(session.user.address),
      });
    }

    if (eligible && isAddress(eligible)) {
      whereClause.OR.push({
        AirdropClaimerMap: {
          some: {
            claimer: {
              address: hexStringToUint8Array(eligible),
            },
          },
        },
      });
    }

    const totalCountResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT "Airdrop"."id") as count
      FROM "Airdrop"
      LEFT JOIN "AirdropClaimerMap" ON "Airdrop"."id" = "AirdropClaimerMap"."airdropId"
      LEFT JOIN "Claimer" ON "AirdropClaimerMap"."claimerId" = "Claimer"."id"
      ${
        session && mine && !eligible
          ? Prisma.sql`WHERE "Airdrop"."owner" = ${hexStringToUint8Array(session.user.address)}`
          : Prisma.empty
      }
      ${
        eligible && isAddress(eligible)
          ? session && mine && !eligible
            ? Prisma.sql`AND "Claimer"."address" = ${hexStringToUint8Array(eligible)}`
            : Prisma.sql`WHERE "Claimer"."address" = ${hexStringToUint8Array(eligible)}`
          : Prisma.empty
      }
    `;

    const totalCount = totalCountResult[0]?.count ? Number(totalCountResult[0].count) : 0;

    // const totalCount = await prisma.airdrop.count();
    // Hope this feature will be added to Prisma soon
    // https://github.com/prisma/prisma/issues/15423
    const airdrops = await prisma.$queryRaw<Airdrop[]>`
        SELECT DISTINCT
            "Airdrop".*,
            (
                    SELECT
                        COUNT(*)
                    FROM
                        "AirdropClaimerMap"
                    WHERE
                        "AirdropClaimerMap"."airdropId"="Airdrop"."id"
                        AND
                        "AirdropClaimerMap"."isClaimed" = true
            ) AS "claimedUsersNum",
            (
                  SELECT
                      COUNT(*)
                  FROM
                      "AirdropClaimerMap"
                  WHERE
                      "AirdropClaimerMap"."airdropId"="Airdrop"."id"
            ) AS "eligibleUsersNum"
        FROM
            "Airdrop"
        LEFT JOIN "AirdropClaimerMap" ON "Airdrop"."id" = "AirdropClaimerMap"."airdropId"
        LEFT JOIN "Claimer" ON "AirdropClaimerMap"."claimerId" = "Claimer"."id"
        ${session && mine && !eligible ? Prisma.sql`WHERE "Airdrop"."owner" = ${hexStringToUint8Array(session.user.address)}` : Prisma.empty}
        ${eligible && isAddress(eligible) ? Prisma.sql`WHERE "Claimer"."address" = ${hexStringToUint8Array(eligible)}` : Prisma.empty}
        ORDER BY "Airdrop"."createdAt" DESC
        LIMIT ${limit}
        OFFSET ${skip}

    `;

    const formattedAirdrops = airdrops.map((airdrop: Airdrop) => AirdropUtils.toHexString(airdrop));

    return NextResponse.json({
      airdrops: formattedAirdrops,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error fetching airdrops:", error);
    return NextResponse.json({ error: "Failed to fetch airdrops" }, { status: 500 });
  }
}
