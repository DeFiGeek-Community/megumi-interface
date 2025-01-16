import fs from "fs";
import path from "path";
import { describe } from "node:test";
import { testApiHandler } from "next-test-api-route-handler";
import type { Session } from "next-auth";
import {
  convertAirdropWithUint8ArrayToHexString,
  deleteAllObjects,
  uint8ObjectToHexString,
} from "@/app/lib/utils";
import { TemplateNames } from "@/app/lib/constants/templates";
import { s3Client, PutObjectCommand } from "@/app/lib/aws";
import * as appHandler from "./routes";

const chainId = "11155111"; // Sepolia
const YMWK = "0xdE2832DE0b4C0b4b6742e60186E290622B2B766C".toLowerCase(); // Sepolia YMWK
const sampleAirdropAddress = "0x92A92007e687C036592d5eF490cA7f755FC3abAC"; // Sepolia Sample Airdrop
const sampleOwnerAddress = "0x09c208Bee9B7Bbb4f630B086a73A1a90E8E881A5";
let mockedSession: Session | null = null;

jest.mock("../../../../auth/authOptions", () => ({
  authOptions: {
    adapter: {},
    providers: [],
    callbacks: {},
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockedSession)),
}));

jest.mock("../../../../../../prisma/client", () => ({
  prisma: jestPrisma.client,
}));

afterEach(async () => {
  mockedSession = null;
  await deleteAllObjects(process.env.AWS_S3_BUCKET_NAME!);
  // Workaround for S3 consistency
  await new Promise((resolve) => setTimeout(resolve, 500));
});

describe("POST /api/airdrops/:id/syncMerkletree", () => {
  test("No session Sync merkle tree file", async () => {
    const airdrop = await jestPrisma.client.airdrop.create({
      data: {
        chainId: 11155111,
        title: `Sample airdrop`,
        contractAddress: Uint8Array.from(Buffer.from(sampleAirdropAddress.slice(2), "hex")),
        templateName: Uint8Array.from(Buffer.from(TemplateNames.STANDARD.slice(2), "hex")),
        owner: Uint8Array.from(Buffer.from(sampleOwnerAddress.slice(2), "hex")),
        tokenAddress: Uint8Array.from(Buffer.from(YMWK.slice(2), "hex")),
        tokenName: "18 Decimals Sample Token",
        tokenSymbol: "SMPL18",
        tokenDecimals: 18,
        tokenLogo: "https://example.com/logo.png",
      },
    });

    const expectedData = convertAirdropWithUint8ArrayToHexString(airdrop);

    const filePath = path.join(__dirname, "../../../../../lib/sample/merkletree.json");
    const buffer = fs.readFileSync(filePath);
    const json = JSON.parse(buffer.toString("utf-8"));
    const itemKey = `${chainId}/${expectedData.id}-merkletree.json`;
    const command = new PutObjectCommand({
      Body: buffer,
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: itemKey,
      ContentType: "application/json",
    });
    const response = await s3Client.send(command);

    await testApiHandler({
      appHandler,
      params: { chainId, id: expectedData.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
        });

        expect(res.status).toStrictEqual(401);

        const airdropWithClaimerMap = await jestPrisma.client.airdrop.findUnique({
          where: { id: expectedData.id },
          include: { AirdropClaimerMap: true },
        });

        expect(airdropWithClaimerMap).not.toBeNull();
        expect(airdropWithClaimerMap?.AirdropClaimerMap).toStrictEqual([]);
      },
    });
  });
  test("with session, not owner, Sync merkle tree file", async () => {
    const airdrop = await jestPrisma.client.airdrop.create({
      data: {
        chainId: 11155111,
        title: `Sample airdrop`,
        contractAddress: Uint8Array.from(Buffer.from(sampleAirdropAddress.slice(2), "hex")),
        templateName: Uint8Array.from(Buffer.from(TemplateNames.STANDARD.slice(2), "hex")),
        owner: Uint8Array.from(Buffer.from(sampleOwnerAddress.slice(2), "hex")),
        tokenAddress: Uint8Array.from(Buffer.from(YMWK.slice(2), "hex")),
        tokenName: "18 Decimals Sample Token",
        tokenSymbol: "SMPL18",
        tokenDecimals: 18,
        tokenLogo: "https://example.com/logo.png",
      },
    });

    mockedSession = {
      expires: "expires",
      user: {
        address: "0x1234",
      },
    };

    const expectedData = convertAirdropWithUint8ArrayToHexString(airdrop);

    const filePath = path.join(__dirname, "../../../../../lib/sample/merkletree.json");
    const buffer = fs.readFileSync(filePath);
    const json = JSON.parse(buffer.toString("utf-8"));
    const itemKey = `${chainId}/${expectedData.id}-merkletree.json`;
    const command = new PutObjectCommand({
      Body: buffer,
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: itemKey,
      ContentType: "application/json",
    });
    const response = await s3Client.send(command);

    await testApiHandler({
      appHandler,
      params: { chainId, id: expectedData.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
        });

        expect(res.status).toStrictEqual(403);

        const airdropWithClaimerMap = await jestPrisma.client.airdrop.findUnique({
          where: { id: expectedData.id },
          include: { AirdropClaimerMap: true },
        });

        expect(airdropWithClaimerMap).not.toBeNull();
        expect(airdropWithClaimerMap?.AirdropClaimerMap).toStrictEqual([]);
      },
    });
  });

  test("with session, owner, Sync merkle tree file", async () => {
    const airdrop = await jestPrisma.client.airdrop.create({
      data: {
        chainId: 11155111,
        title: `Sample airdrop`,
        contractAddress: Uint8Array.from(Buffer.from(sampleAirdropAddress.slice(2), "hex")),
        templateName: Uint8Array.from(Buffer.from(TemplateNames.STANDARD.slice(2), "hex")),
        owner: Uint8Array.from(Buffer.from(sampleOwnerAddress.slice(2), "hex")),
        tokenAddress: Uint8Array.from(Buffer.from(YMWK.slice(2), "hex")),
        tokenName: "18 Decimals Sample Token",
        tokenSymbol: "SMPL18",
        tokenDecimals: 18,
        tokenLogo: "https://example.com/logo.png",
      },
    });

    mockedSession = {
      expires: "expires",
      user: {
        address: uint8ObjectToHexString(airdrop.owner),
      },
    };

    const expectedData = convertAirdropWithUint8ArrayToHexString(airdrop);

    const filePath = path.join(__dirname, "../../../../../lib/sample/merkletree.json");
    const buffer = fs.readFileSync(filePath);
    const json = JSON.parse(buffer.toString("utf-8"));
    const itemKey = `${chainId}/${expectedData.id}-merkletree.json`;
    const command = new PutObjectCommand({
      Body: buffer,
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: itemKey,
      ContentType: "application/json",
    });
    const response = await s3Client.send(command);

    await testApiHandler({
      appHandler,
      params: { chainId, id: expectedData.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
        });

        if (res.status !== 200) {
          console.log(await res.json());
        }
        expect(res.status).toStrictEqual(200);

        const airdropWithClaimerMap = await jestPrisma.client.airdrop.findUnique({
          where: { id: expectedData.id },
          include: { AirdropClaimerMap: true },
        });

        expect(airdropWithClaimerMap).not.toBeNull();
        expect(airdropWithClaimerMap?.AirdropClaimerMap).not.toBeNull();
        const convertedAirdrop = convertAirdropWithUint8ArrayToHexString(airdropWithClaimerMap!);

        const length = convertedAirdrop.AirdropClaimerMap!.length;
        for (let i = 0; i < length; i++) {
          const map = convertedAirdrop.AirdropClaimerMap![i];
          const expectedValue: any = Object.values(json.claims)[i];
          const address = Object.keys(json.claims)[i];
          expect(map.index).toStrictEqual(expectedValue.index);
          expect(map.amount).toStrictEqual(BigInt(expectedValue.amount));
          map.proofs.forEach((proof: string, index: number) => {
            expect(proof).toStrictEqual(expectedValue.proof[index]);
          });
          const claimer = await jestPrisma.client.claimer.findUnique({
            where: { id: map.claimerId },
          });
          expect(claimer).not.toBeNull();
          expect(address.toLowerCase()).toStrictEqual(
            uint8ObjectToHexString(claimer!.address).toLowerCase(),
          );
        }
      },
    });
  });
});
