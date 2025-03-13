import { NextResponse, NextRequest } from "next/server";
import * as crypto from "crypto";
import { prisma } from "@/prisma";
import { getErrorMessage } from "@/app/utils/shared";
import { hexStringToUint8Array } from "@/app/utils/apiHelper";
import { to20ByteHexString } from "@/app/utils/merkleTree/shared";

/*
Handle claim webhook from Alchemy triggered by Standard Airdrop's Claim event
0x4ec90e965519d92681267467f775ada5bd214aa92c0dc93d90a5e880ce9ed026 is the topic for Claim event
refs:
https://docs.alchemy.com/reference/notify-api-quickstart
https://dashboard.alchemy.com/webhooks

 GraphQL query:
 {
  block {
    hash,
    number,
    timestamp,
    logs(filter: {topics: ["0x4ec90e965519d92681267467f775ada5bd214aa92c0dc93d90a5e880ce9ed026"]}) { 
      data,
      topics,
      index,
      account {
        address
      },
      transaction {
        hash,
        nonce,
        index,
        from {
          address
        },
        to {
          address
        },
        value,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        gas,
        status,
        gasUsed,
        cumulativeGasUsed,
        effectiveGasPrice,
        createdContract {
          address
        }
      }
    }
  }
}
*/

function isValidSignatureForStringBody(
  body: string,
  signature: string,
  signingKey: string,
): boolean {
  const hmac = crypto.createHmac("sha256", signingKey);
  hmac.update(body, "utf8");
  const digest = hmac.digest("hex");
  return signature === digest;
}

export async function POST(request: NextRequest, { params }: { params: { templateType: string } }) {
  const bodyText = await request.text();
  const valid = isValidSignatureForStringBody(
    bodyText,
    request.headers.get("x-alchemy-signature")!,
    process.env.ALCHEMY_WEBHOOK_SIGNING_KEY!,
  );
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = JSON.parse(bodyText);
    /* transactionData example:
      {
        hash: '0x44c1b56c5a9e469ac8d335ca7446b3f00de0ce12cc648bc0dd3cf91502187038',
        nonce: 955,
        index: 20,
        from: { address: '0x09c208bee9b7bbb4f630b086a73a1a90e8e881a5' },
        to: { address: '0x2a8971d542c3448cca54f2f04f3234b186c63ac0' },
        value: '0xb5e620f48000',
        gasPrice: '0x9b852994',
        maxFeePerGas: '0x17b699ef0',
        maxPriorityFeePerGas: '0x59682f00',
        gas: 150306,
        status: 1,
        gasUsed: 93680,
        cumulativeGasUsed: 1975966,
        effectiveGasPrice: '0x9b852994',
        createdContract: null
      }
    */
    const transactionData = body.event.data.block.logs[0].transaction;
    const topicData = body.event.data.block.logs[0].topics;
    console.log("[transactionData] ", transactionData);
    console.log("[topicData] ", topicData);
    const claimerAddress = to20ByteHexString(topicData[2]);
    const airdropAddress = transactionData.to.address;
    console.log("[CLAIM] ", transactionData, claimerAddress, airdropAddress);
    const airdrop = await prisma.airdrop.findFirst({
      where: {
        contractAddress: hexStringToUint8Array(airdropAddress),
      },
    });
    const claimer = await prisma.claimer.findUnique({
      where: { address: hexStringToUint8Array(claimerAddress) },
    });

    if (!airdrop || !claimer) {
      return NextResponse.json({ error: "airdrop or claimer not found" });
    }

    // TODO
    // if(params.templateName === TemplateType.STANDARD)
    // if(params.templateName === TemplateType.LINEAR_VESTING)

    const result = await prisma.airdropClaimerMap.update({
      where: {
        airdropClaimerId: {
          airdropId: airdrop.id,
          claimerId: claimer.id,
        },
      },
      data: {
        isClaimed: true,
      },
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.log(message);
    return NextResponse.json({ error: message });
  }
}
