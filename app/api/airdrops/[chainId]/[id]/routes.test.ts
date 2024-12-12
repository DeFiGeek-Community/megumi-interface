import { describe } from "node:test";
import { testApiHandler } from "next-test-api-route-handler";
import type { Session } from "next-auth";
import { zeroAddress } from "viem";
import { convertAirdropWithUint8ArrayToHexString, uint8ObjectToHexString } from "@/app/lib/utils";
import { TemplateType } from "@/app/lib/constants/templates";
import * as appHandler from "./routes";

const YMWK = "0xdE2832DE0b4C0b4b6742e60186E290622B2B766C".toLowerCase(); // Sepolia YMWK
const YMWK_INFO = {
  tokenName: "Yamawake DAO Token",
  tokenSymbol: "YMWK",
  tokenDecimals: 18,
};
const chainId = "11155111"; // Sepolia
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

afterEach(() => {
  mockedSession = null;
});

describe("GET /api/airdrop/:id - Retrieve an airdrop detail", () => {
  test("Get detail", async () => {
    const airdrop = await jestPrisma.client.airdrop.findFirst();
    if (!airdrop) throw new Error("Airdrop not found");

    const expectedData = convertAirdropWithUint8ArrayToHexString(airdrop);

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
    TemplateType: TemplateType.STANDARD, // Can be updated only before the contract address is registered
    tokenLogo: "https://example.com/logo_updated.png",
  };

  test("no session", async () => {
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

  describe("with session", () => {
    test("not owner", async () => {
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
        params: { chainId, id: airdrop!.id },
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
    //   test("Success create airdrop", async () => {
    //     const expectedData = {
    //       ...basicMockData,
    //       ...YMWK_INFO,
    //     };
    //     mockedSession = {
    //       expires: "expires",
    //       user: {
    //         address: "0x1234",
    //       },
    //     };
    //     await testApiHandler({
    //       appHandler,
    //       params: { chainId },
    //       test: async ({ fetch }) => {
    //         const res = await fetch({
    //           method: "POST",
    //           body: JSON.stringify(basicMockData),
    //         });
    //         expect(res.status).toStrictEqual(201);
    //         const {
    //           contractAddress,
    //           templateName,
    //           owner,
    //           tokenAddress,
    //           tokenName,
    //           tokenSymbol,
    //           tokenDecimals,
    //           tokenLogo,
    //         } = await res.json();
    //         const resData = {
    //           contractAddress: contractAddress,
    //           templateName: uint8ObjectToHexString(templateName),
    //           owner: uint8ObjectToHexString(owner),
    //           tokenAddress: uint8ObjectToHexString(tokenAddress),
    //           tokenName,
    //           tokenSymbol,
    //           tokenDecimals,
    //           tokenLogo,
    //         };
    //         expect(resData).toEqual(expectedData);
    //       },
    //     });
    //   });
    //   test("Invalid contract", async () => {
    //     const sampleData = {
    //       ...basicMockData,
    //       contractAddress: zeroAddress,
    //     };
    //     mockedSession = {
    //       expires: "expires",
    //       user: {
    //         address: "0x1234",
    //       },
    //     };
    //     await testApiHandler({
    //       appHandler,
    //       params: { chainId },
    //       test: async ({ fetch }) => {
    //         const res = await fetch({
    //           method: "POST",
    //           body: JSON.stringify(sampleData),
    //         });
    //         expect(res.status).toStrictEqual(422);
    //         const { error } = await res.json();
    //         expect(error.contractAddress).toContain("ContractFunctionExecutionError");
    //       },
    //     });
    //   });
    //   test("No tokenAddress", async () => {
    //     const sampleData = {
    //       ...basicMockData,
    //       tokenAddress: undefined,
    //     };
    //     mockedSession = {
    //       expires: "expires",
    //       user: {
    //         address: "0x1234",
    //       },
    //     };
    //     await testApiHandler({
    //       appHandler,
    //       params: { chainId },
    //       test: async ({ fetch }) => {
    //         const res = await fetch({
    //           method: "POST",
    //           body: JSON.stringify(sampleData),
    //         });
    //         expect(res.status).toStrictEqual(422);
    //         const { error } = await res.json();
    //         expect(error.tokenAddress).toEqual("Token address is required");
    //       },
    //     });
    //   });
    //   test("Invalid tokenAddress", async () => {
    //     const sampleData = {
    //       ...basicMockData,
    //       tokenAddress: zeroAddress,
    //     };
    //     mockedSession = {
    //       expires: "expires",
    //       user: {
    //         address: "0x1234",
    //       },
    //     };
    //     await testApiHandler({
    //       appHandler,
    //       params: { chainId },
    //       test: async ({ fetch }) => {
    //         const res = await fetch({
    //           method: "POST",
    //           body: JSON.stringify(sampleData),
    //         });
    //         expect(res.status).toStrictEqual(422);
    //         const { error } = await res.json();
    //         expect(error).toContain("ContractFunctionExecutionError");
    //       },
    //     });
    //   });
    //   test("Invalid tokenLogo", async () => {
    //     const sampleData = {
    //       ...basicMockData,
    //       tokenLogo: "asdf",
    //     };
    //     mockedSession = {
    //       expires: "expires",
    //       user: {
    //         address: "0x1234",
    //       },
    //     };
    //     await testApiHandler({
    //       appHandler,
    //       params: { chainId },
    //       test: async ({ fetch }) => {
    //         const res = await fetch({
    //           method: "POST",
    //           body: JSON.stringify(sampleData),
    //         });
    //         expect(res.status).toStrictEqual(422);
    //         const { error } = await res.json();
    //         expect(error.tokenLogo).toEqual("Invalid URL");
    //       },
    //     });
    //   });
  });
});

describe("DELETE /api/airdrop/:id - Delete an airdrop", () => {
  test("no session", async () => {
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
  describe("with session", () => {
    test("Not owner", async () => {
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
          expect(res.status).toStrictEqual(401);
          const airdropAfter = await jestPrisma.client.airdrop.findUnique({
            where: { id: airdrop.id },
          });
          expect(airdropAfter).not.toBeNull();
        },
      });
    });
    test("Owner", async () => {
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
