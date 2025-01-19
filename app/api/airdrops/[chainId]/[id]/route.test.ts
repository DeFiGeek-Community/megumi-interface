import fs from "fs";
import path from "path";
import { describe } from "node:test";
import { testApiHandler } from "next-test-api-route-handler";
import type { Session } from "next-auth";
import { zeroAddress } from "viem";
import { deleteAllObjects } from "@/app/utils/testHelper";
import { uint8ObjectToHexString } from "@/app/utils/apiHelper";
import { TemplateNames } from "@/app/lib/constants/templates";
import * as appHandler from "./route";
import { s3Client, GetObjectCommand, PutObjectCommand } from "@/app/lib/aws";
import * as AirdropUtils from "@/app/utils/airdrop";
import { uploadMerkleTree } from "@/app/utils/testHelper";

const YMWK = "0xdE2832DE0b4C0b4b6742e60186E290622B2B766C".toLowerCase(); // Sepolia YMWK
const YMWK_INFO = {
  tokenName: "Yamawake DAO Token",
  tokenSymbol: "YMWK",
  tokenDecimals: 18,
};
const chainId = "11155111"; // Sepolia
const sampleAirdropAddress = "0x92A92007e687C036592d5eF490cA7f755FC3abAC"; // Sepolia Sample Airdrop
const sampleOwnerAddress = "0x09c208Bee9B7Bbb4f630B086a73A1a90E8E881A5";
let mockedSession: Session | null = null;

jest.mock("../../../auth/authOptions", () => ({
  authOptions: {
    adapter: {},
    providers: [],
    callbacks: {},
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockedSession)),
}));

jest.mock("../../../../../prisma/client", () => ({
  prisma: jestPrisma.client,
}));

afterEach(async () => {
  mockedSession = null;
  await deleteAllObjects(process.env.AWS_S3_BUCKET_NAME!);
});

describe("POST /api/airdrops/:id Upload merkle tree file", () => {
  describe("Not signed in", () => {
    test("should reject the request if user is not signed in", async () => {
      const airdrop = await jestPrisma.client.airdrop.findFirst();
      if (!airdrop) throw new Error("Airdrop not found");

      const expectedData = AirdropUtils.toHexString(airdrop);

      await testApiHandler({
        appHandler,
        params: { chainId, id: expectedData.id },
        test: async ({ fetch }) => {
          const filePath = path.join(__dirname, "../../../../lib/sample/merkletree.json");
          if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at path: ${filePath}`);
          }

          const formData = new FormData();
          formData.append("file", new Blob([fs.readFileSync(filePath)]));

          const res = await fetch({
            method: "POST",
            body: formData,
          });

          expect(res.status).toStrictEqual(401);

          const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `${chainId}/${expectedData.id}-merkletree.json`,
          });

          expect(s3Client.send(command)).rejects.toThrow("The specified key does not exist.");
        },
      });
    });
  });
  describe("Signed in", () => {
    describe("Not owner", () => {
      test("should reject the request if the user is not a owner of the airdrop", async () => {
        const airdrop = await jestPrisma.client.airdrop.findFirst();
        if (!airdrop) throw new Error("Airdrop not found");

        mockedSession = {
          expires: "expires",
          user: {
            address: "0x1234",
          },
        };

        const expectedData = AirdropUtils.toHexString(airdrop);

        await testApiHandler({
          appHandler,
          params: { chainId, id: expectedData.id },
          test: async ({ fetch }) => {
            const filePath = path.join(__dirname, "../../../../lib/sample/merkletree.json");
            if (!fs.existsSync(filePath)) {
              throw new Error(`File not found at path: ${filePath}`);
            }

            const formData = new FormData();
            formData.append("file", new Blob([fs.readFileSync(filePath)]));

            const res = await fetch({
              method: "POST",
              body: formData,
            });

            expect(res.status).toStrictEqual(403);

            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: `${chainId}/${expectedData.id}-merkletree.json`,
            });

            expect(s3Client.send(command)).rejects.toThrow("The specified key does not exist.");
          },
        });
      });
    });

    describe("Owner", () => {
      test("should success to upload merkle tree file", async () => {
        const airdrop = await jestPrisma.client.airdrop.findFirst();
        if (!airdrop) throw new Error("Airdrop not found");

        mockedSession = {
          expires: "expires",
          user: {
            address: uint8ObjectToHexString(airdrop.owner),
          },
        };

        const expectedData = AirdropUtils.toHexString(airdrop);

        await testApiHandler({
          appHandler,
          params: { chainId, id: expectedData.id },
          test: async ({ fetch }) => {
            const filePath = path.join(__dirname, "../../../../lib/sample/merkletree.json");
            if (!fs.existsSync(filePath)) {
              throw new Error(`File not found at path: ${filePath}`);
            }

            const formData = new FormData();
            formData.append("file", new Blob([fs.readFileSync(filePath)]));

            const res = await fetch({
              method: "POST",
              body: formData,
            });

            expect(res.status).toStrictEqual(200);

            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: `${chainId}/${expectedData.id}-merkletree.json`,
            });
            const response = await s3Client.send(command);
            const original = fs.readFileSync(filePath, "utf8");
            const str = await response.Body?.transformToString();
            expect(str).toStrictEqual(original);
          },
        });
      });

      test("should fail to upload merkle tree if the format is invalid", async () => {
        const airdrop = await jestPrisma.client.airdrop.findFirst();
        if (!airdrop) throw new Error("Airdrop not found");

        mockedSession = {
          expires: "expires",
          user: {
            address: uint8ObjectToHexString(airdrop.owner),
          },
        };

        const expectedData = AirdropUtils.toHexString(airdrop);

        await testApiHandler({
          appHandler,
          params: { chainId, id: expectedData.id },
          test: async ({ fetch }) => {
            const filePath = path.join(__dirname, "../../../../lib/sample/merkletree.json");
            if (!fs.existsSync(filePath)) {
              throw new Error(`File not found at path: ${filePath}`);
            }

            const buffer = fs.readFileSync(filePath);
            const json = JSON.parse(buffer.toString("utf-8"));

            // Edit Merkle tree
            json.merkleRoot = "Invalid data";

            const formData = new FormData();
            formData.append(
              "file",
              new Blob([JSON.stringify(json)], { type: "application/json" }),
              "merkletree.json",
            );

            const res = await fetch({
              method: "POST",
              body: formData,
            });

            const data = await res.json();

            expect(res.status).toStrictEqual(422);
            expect(data.error).toStrictEqual("merkleRoot must be a valid hex string.");

            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: `${chainId}/${expectedData.id}-merkletree.json`,
            });
            expect(s3Client.send(command)).rejects.toThrow("The specified key does not exist.");
          },
        });
      });

      test("should success upload after contract address is registered only if merkle root matches", async () => {
        const airdrop = await jestPrisma.client.airdrop.create({
          data: {
            chainId: 11155111,
            title: `Sample airdrop`,
            contractAddress: null,
            templateName: Uint8Array.from(Buffer.from(TemplateNames.Standard.slice(2), "hex")),
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

        const expectedData = AirdropUtils.toHexString(airdrop);

        await testApiHandler({
          appHandler,
          params: { chainId, id: expectedData.id },
          test: async ({ fetch }) => {
            const filePath = path.join(__dirname, "../../../../lib/sample/merkletree.json");
            if (!fs.existsSync(filePath)) {
              throw new Error(`File not found at path: ${filePath}`);
            }

            const formData = new FormData();
            formData.append("file", new Blob([fs.readFileSync(filePath)]));

            const res = await fetch({
              method: "POST",
              body: formData,
            });

            expect(res.status).toStrictEqual(200);

            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: `${chainId}/${expectedData.id}-merkletree.json`,
            });
            const response = await s3Client.send(command);
            const original = fs.readFileSync(filePath, "utf8");
            const str = await response.Body?.transformToString();
            expect(str).toStrictEqual(original);
          },
        });
      });

      test("should success upload after contract address is registered only if merkle root does NOT match", async () => {
        const airdrop = await jestPrisma.client.airdrop.create({
          data: {
            chainId: 11155111,
            title: `Sample airdrop`,
            contractAddress: Uint8Array.from(Buffer.from(sampleAirdropAddress.slice(2), "hex")),
            templateName: Uint8Array.from(Buffer.from(TemplateNames.Standard.slice(2), "hex")),
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

        const expectedData = AirdropUtils.toHexString(airdrop);

        await testApiHandler({
          appHandler,
          params: { chainId, id: expectedData.id },
          test: async ({ fetch }) => {
            const filePath = path.join(__dirname, "../../../../lib/sample/merkletree.json");
            if (!fs.existsSync(filePath)) {
              throw new Error(`File not found at path: ${filePath}`);
            }

            const buffer = fs.readFileSync(filePath);
            const json = JSON.parse(buffer.toString("utf-8"));

            // Edit Merkle tree
            json.merkleRoot = "0xfeea224f956367a8d8b915442393a5fc7973baa54029e852fb6b7df516f6dd71";

            const formData = new FormData();
            formData.append("file", new Blob([JSON.stringify(json)], { type: "application/json" }));

            const res = await fetch({
              method: "POST",
              body: formData,
            });
            const data = await res.json();

            expect(res.status).toStrictEqual(422);
            expect(data.error).toStrictEqual("Merkle root does not match");
          },
        });
      });
    });
  });
});

describe("GET /api/airdrop/:id - Retrieve an airdrop detail", () => {
  test("should success to get the detail information of an airdrop", async () => {
    const airdrop = await jestPrisma.client.airdrop.findFirst();
    if (!airdrop) throw new Error("Airdrop not found");

    const expectedData = AirdropUtils.toHexString(airdrop);

    await testApiHandler({
      appHandler,
      params: { chainId, id: expectedData.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "GET",
        });
        expect(res.status).toStrictEqual(200);
        const airdrop = await res.json();

        Object.keys(expectedData).map((key: string) => {
          const value = expectedData[key as keyof typeof expectedData];
          if (value instanceof Date) {
            expect(new Date(airdrop[key]).getTime()).toEqual(value.getTime());
          } else {
            expect(airdrop[key]).toEqual(expectedData[key as keyof typeof expectedData]);
          }
        });
      },
    });
  });
});

describe("PATCH /api/airdrop/:id - Update an airdrop", () => {
  const newData = {
    templateName: TemplateNames.Standard, // Can be updated only before the contract address is registered
    tokenLogo: "https://example.com/logo_updated.png",
  };

  describe("Not signed in", () => {
    test("should fail to update the airdrop", async () => {
      const airdrop = await jestPrisma.client.airdrop.findFirst();
      if (!airdrop) throw new Error("Airdrop not found");

      await testApiHandler({
        appHandler,
        params: { chainId, id: airdrop.id },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "PATCH",
            body: JSON.stringify(newData),
          });
          expect(res.status).toStrictEqual(401);

          const airdropAfter = await jestPrisma.client.airdrop.findUnique({
            where: { id: airdrop!.id },
          });
          if (!airdropAfter) throw new Error("Airdrop not found");

          Object.keys(airdropAfter).map((key: string) => {
            const value = airdropAfter[key as keyof typeof airdropAfter];
            if (value instanceof Date) {
              expect((airdrop[key as keyof typeof airdropAfter] as Date).getTime()).toEqual(
                value.getTime(),
              );
            } else {
              expect(airdrop[key as keyof typeof airdropAfter]).toEqual(
                airdropAfter[key as keyof typeof airdropAfter],
              );
            }
          });
        },
      });
    });
  });

  describe("Signed in", () => {
    describe("Not owner", () => {
      test("should fail to update the airdrop", async () => {
        const airdrop = await jestPrisma.client.airdrop.findFirst();
        if (!airdrop) throw new Error("Airdrop not found");

        mockedSession = {
          expires: "expires",
          user: {
            address: "0x1234",
          },
        };
        await testApiHandler({
          appHandler,
          params: { chainId, id: airdrop.id },
          test: async ({ fetch }) => {
            const res = await fetch({
              method: "PATCH",
              body: JSON.stringify(newData),
            });
            expect(res.status).toStrictEqual(403);
            const airdropAfter = await jestPrisma.client.airdrop.findUnique({
              where: { id: airdrop.id },
            });
            if (!airdropAfter) throw new Error("Airdrop not found");

            Object.keys(airdropAfter).map((key: string) => {
              const value = airdropAfter[key as keyof typeof airdropAfter];
              if (value instanceof Date) {
                expect((airdrop[key as keyof typeof airdropAfter] as Date).getTime()).toEqual(
                  value.getTime(),
                );
              } else {
                expect(airdrop[key as keyof typeof airdropAfter]).toEqual(
                  airdropAfter[key as keyof typeof airdropAfter],
                );
              }
            });
          },
        });
      });
    });

    describe("Owner", () => {
      test("should success to update contractAddress", async () => {
        const airdrop = await jestPrisma.client.airdrop.create({
          data: {
            chainId: 11155111,
            title: `Sample airdrop`,
            contractAddress: null,
            templateName: Uint8Array.from(Buffer.from(TemplateNames.Standard.slice(2), "hex")),
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
        const data = {
          ...newData,
          contractAddress: sampleAirdropAddress,
        };

        // Upload merkle tree file
        const filePath = path.join(__dirname, "../../../../lib/sample/merkletree.json");
        const itemKey = `${chainId}/${airdrop.id}-merkletree.json`;
        await uploadMerkleTree(filePath, itemKey);

        await testApiHandler({
          appHandler,
          params: { chainId, id: airdrop.id },
          test: async ({ fetch }) => {
            const res = await fetch({
              method: "PATCH",
              body: JSON.stringify(data),
            });

            expect(res.status).toStrictEqual(200);
            const airdropAfterRaw = await jestPrisma.client.airdrop.findUnique({
              where: { id: airdrop.id },
            });
            if (!airdropAfterRaw) throw new Error("Airdrop not found");
            const airdropAfter = AirdropUtils.toHexString(airdropAfterRaw);

            // Only contractAddress should be updated
            const expectedData = {
              ...AirdropUtils.toHexString(airdrop),
              contractAddress: sampleAirdropAddress,
            };

            Object.keys(airdropAfter).map((key: string) => {
              const value = airdropAfter[key as keyof typeof airdropAfter];
              const expectedValue = expectedData[key as keyof typeof airdropAfter];
              if (value instanceof Date) {
                expect(value.getTime()).toEqual((expectedValue as Date).getTime());
              } else if (typeof value === "string" && value.startsWith("0x")) {
                expect(value.toLowerCase()).toEqual((expectedValue as string).toLowerCase());
              } else {
                expect(value).toEqual(expectedValue);
              }
            });
          },
        });
      });

      test("should fail to update with invalid contractAddress", async () => {
        const airdrop = await jestPrisma.client.airdrop.create({
          data: {
            chainId: 11155111,
            title: `Sample airdrop`,
            contractAddress: null,
            templateName: Uint8Array.from(Buffer.from(TemplateNames.Standard.slice(2), "hex")),
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
        const data = {
          ...newData,
          // Set an invalid contract address
          contractAddress: zeroAddress,
        };
        await testApiHandler({
          appHandler,
          params: { chainId, id: airdrop.id },
          test: async ({ fetch }) => {
            const res = await fetch({
              method: "PATCH",
              body: JSON.stringify(data),
            });
            const json = await res.json();
            expect(res.status).toStrictEqual(422);
            expect(json.error).toStrictEqual("Invalid airdrop contract address");
          },
        });
      });

      test("should success to update tokenLogo", async () => {
        const airdrop = await jestPrisma.client.airdrop.create({
          data: {
            chainId: 11155111,
            title: `Sample airdrop`,
            contractAddress: Uint8Array.from(Buffer.from(sampleAirdropAddress.slice(2), "hex")),
            templateName: Uint8Array.from(Buffer.from(TemplateNames.Standard.slice(2), "hex")),
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
        await testApiHandler({
          appHandler,
          params: { chainId, id: airdrop.id },
          test: async ({ fetch }) => {
            const res = await fetch({
              method: "PATCH",
              // Update tokenLogo
              body: JSON.stringify(newData),
            });

            expect(res.status).toStrictEqual(200);
            const airdropAfterRaw = await jestPrisma.client.airdrop.findUnique({
              where: { id: airdrop.id },
            });
            if (!airdropAfterRaw) throw new Error("Airdrop not found");
            const airdropAfter = AirdropUtils.toHexString(airdropAfterRaw);

            const expectedData = {
              ...AirdropUtils.toHexString(airdrop),
              ...newData,
            };

            Object.keys(airdropAfter).map((key: string) => {
              const value = airdropAfter[key as keyof typeof airdropAfter];
              const expectedValue = expectedData[key as keyof typeof airdropAfter];
              if (value instanceof Date) {
                expect(value.getTime()).toEqual((expectedValue as Date).getTime());
              } else if (typeof value === "string" && value.startsWith("0x")) {
                expect(value.toLowerCase()).toEqual((expectedValue as string).toLowerCase());
              } else {
                expect(value).toEqual(expectedValue);
              }
            });
          },
        });
      });

      test("should fail to update template after contract is registered", async () => {
        const airdrop = await jestPrisma.client.airdrop.create({
          data: {
            chainId: 11155111,
            title: `Sample airdrop`,
            contractAddress: Uint8Array.from(Buffer.from(sampleAirdropAddress.slice(2), "hex")),
            templateName: Uint8Array.from(Buffer.from(TemplateNames.Standard.slice(2), "hex")),
            owner: Uint8Array.from(Buffer.from(sampleOwnerAddress.slice(2), "hex")),
            tokenAddress: Uint8Array.from(Buffer.from(YMWK.slice(2), "hex")),
            tokenName: "18 Decimals Sample Token",
            tokenSymbol: "SMPL18",
            tokenDecimals: 18,
            tokenLogo: "https://example.com/logo.png",
          },
        });

        expect(uint8ObjectToHexString(airdrop.templateName)).toEqual(TemplateNames.Standard);

        mockedSession = {
          expires: "expires",
          user: {
            address: uint8ObjectToHexString(airdrop.owner),
          },
        };

        const newData = {
          templateName: TemplateNames.LinearVesting,
        };
        await testApiHandler({
          appHandler,
          params: { chainId, id: airdrop.id },
          test: async ({ fetch }) => {
            const res = await fetch({
              method: "PATCH",
              body: JSON.stringify(newData),
            });

            expect(res.status).toStrictEqual(422);
            const airdropAfterRaw = await jestPrisma.client.airdrop.findUnique({
              where: { id: airdrop.id },
            });
            if (!airdropAfterRaw) throw new Error("Airdrop not found");

            expect(uint8ObjectToHexString(airdropAfterRaw.templateName)).toEqual(
              TemplateNames.Standard,
            );
          },
        });
      });

      test("should success to update template before contract is registered", async () => {
        const airdrop = await jestPrisma.client.airdrop.findFirst();
        if (!airdrop) throw new Error("Airdrop not found");

        expect(uint8ObjectToHexString(airdrop.templateName)).toEqual(TemplateNames.Standard);

        mockedSession = {
          expires: "expires",
          user: {
            address: uint8ObjectToHexString(airdrop.owner),
          },
        };

        const newData = {
          templateName: TemplateNames.LinearVesting,
        };
        await testApiHandler({
          appHandler,
          params: { chainId, id: airdrop.id },
          test: async ({ fetch }) => {
            const res = await fetch({
              method: "PATCH",
              body: JSON.stringify(newData),
            });

            expect(res.status).toStrictEqual(200);
            const airdropAfterRaw = await jestPrisma.client.airdrop.findUnique({
              where: { id: airdrop.id },
            });
            if (!airdropAfterRaw) throw new Error("Airdrop not found");

            expect(uint8ObjectToHexString(airdropAfterRaw.templateName)).toEqual(
              TemplateNames.LinearVesting,
            );
          },
        });
      });

      test("should success to update contract address after merkle tree is registered if merkle root matches", async () => {
        const airdrop = await jestPrisma.client.airdrop.create({
          data: {
            chainId: 11155111,
            title: `Sample airdrop`,
            contractAddress: null,
            templateName: Uint8Array.from(Buffer.from(TemplateNames.Standard.slice(2), "hex")),
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

        const filePath = path.join(__dirname, "../../../../lib/sample/merkletree.json");
        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found at path: ${filePath}`);
        }

        const buffer = fs.readFileSync(filePath);
        const json = JSON.parse(buffer.toString("utf-8"));
        const itemKey = `${chainId}/${airdrop.id}-merkletree.json`;
        const command = new PutObjectCommand({
          Body: buffer,
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: itemKey,
          ContentType: "application/json",
        });
        const response = await s3Client.send(command);

        const newData = {
          contractAddress: sampleAirdropAddress,
        };
        await testApiHandler({
          appHandler,
          params: { chainId, id: airdrop.id },
          test: async ({ fetch }) => {
            const res = await fetch({
              method: "PATCH",
              body: JSON.stringify(newData),
            });

            expect(res.status).toStrictEqual(200);
          },
        });
      });

      test("should fail to update contract address after merkle tree with a different merkleRoot is registered", async () => {
        const airdrop = await jestPrisma.client.airdrop.create({
          data: {
            chainId: 11155111,
            title: `Sample airdrop`,
            contractAddress: null,
            templateName: Uint8Array.from(Buffer.from(TemplateNames.Standard.slice(2), "hex")),
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

        const filePath = path.join(__dirname, "../../../../lib/sample/merkletree.json");
        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found at path: ${filePath}`);
        }

        const buffer = fs.readFileSync(filePath);
        const json = JSON.parse(buffer.toString("utf-8"));
        // Edit Merkle root
        json.merkleRoot = "0xfeea224f956367a8d8b915442393a5fc7973baa54029e852fb6b7df516f6dd71";
        var buf = Buffer.from(JSON.stringify(json));
        const itemKey = `${chainId}/${airdrop.id}-merkletree.json`;
        const command = new PutObjectCommand({
          Body: buf,
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: itemKey,
          ContentType: "application/json",
        });
        const response = await s3Client.send(command);

        const newData = {
          contractAddress: sampleAirdropAddress,
        };
        await testApiHandler({
          appHandler,
          params: { chainId, id: airdrop.id },
          test: async ({ fetch }) => {
            const res = await fetch({
              method: "PATCH",
              body: JSON.stringify(newData),
            });

            const data = await res.json();
            expect(res.status).toStrictEqual(422);
            expect(data.error).toStrictEqual(
              "Contract does not match merkle root with merkle tree file",
            );
          },
        });
      });
    });
  });
});

describe("DELETE /api/airdrop/:id - Delete an airdrop", () => {
  describe("Not Signed in", () => {
    test("should fail to delete an airdrop", async () => {
      const airdrop = await jestPrisma.client.airdrop.findFirst();
      if (!airdrop) throw new Error("Airdrop not found");

      await testApiHandler({
        appHandler,
        params: { chainId, id: airdrop.id },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "DELETE",
          });
          expect(res.status).toStrictEqual(401);
          const airdropAfter = await jestPrisma.client.airdrop.findUnique({
            where: { id: airdrop.id },
          });
          expect(airdropAfter).not.toBeNull();
        },
      });
    });
  });
  describe("Signed in", () => {
    test("should fail to delete an airdrop from non-owner", async () => {
      const airdrop = await jestPrisma.client.airdrop.findFirst();
      if (!airdrop) throw new Error("Airdrop not found");

      mockedSession = {
        expires: "expires",
        user: {
          address: "0x1234",
        },
      };
      await testApiHandler({
        appHandler,
        params: { chainId, id: airdrop.id },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "DELETE",
          });
          expect(res.status).toStrictEqual(403);
          const airdropAfter = await jestPrisma.client.airdrop.findUnique({
            where: { id: airdrop.id },
          });
          expect(airdropAfter).not.toBeNull();
        },
      });
    });
    test("should success to delete an airdrop from owner", async () => {
      const airdrop = await jestPrisma.client.airdrop.findFirst();
      if (!airdrop) throw new Error("Airdrop not found");

      mockedSession = {
        expires: "expires",
        user: {
          address: uint8ObjectToHexString(airdrop.owner),
        },
      };
      await testApiHandler({
        appHandler,
        params: { chainId, id: airdrop.id },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "DELETE",
          });
          expect(res.status).toStrictEqual(200);

          const airdropAfter = await jestPrisma.client.airdrop.findUnique({
            where: { id: airdrop.id },
          });
          expect(airdropAfter).toBeNull();
        },
      });
    });
  });
});
