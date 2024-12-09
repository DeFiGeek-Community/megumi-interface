import { describe } from "node:test";
import { testApiHandler } from "next-test-api-route-handler";
import type { Session } from "next-auth";
import { uint8ObjectToHexString } from "@/app/lib/utils";
import { TemplateType } from "@/app/lib/constants/templates";
import * as appHandler from "./routes";
import { zeroAddress } from "viem";

const YMWK = "0xdE2832DE0b4C0b4b6742e60186E290622B2B766C".toLowerCase(); // Sepolia YMWK
const YMWK_INFO = {
  tokenName: "Yamawake DAO Token",
  tokenSymbol: "YMWK",
  tokenDecimals: 18,
};
const chainId = "11155111"; // Sepolia
let mockedSession: Session | null = null;

jest.mock("../../auth/authOptions", () => ({
  authOptions: {
    adapter: {},
    providers: [],
    callbacks: {},
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockedSession)),
}));

afterEach(() => {
  mockedSession = null;
});

describe("POST /api/airdrops Create a new airdrop", () => {
  const basicMockData = {
    contractAddress: null,
    templateName: TemplateType.STANDARD,
    owner: "0xabcd",
    tokenAddress: YMWK,
    tokenLogo: "https://example.com/logo.png",
  };

  test("no session", async () => {
    await testApiHandler({
      appHandler,
      params: { chainId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          body: JSON.stringify(basicMockData),
        });
        expect(res.status).toStrictEqual(401);
      },
    });
  });

  describe("with session", () => {
    test("Success create airdrop", async () => {
      const expectedData = {
        ...basicMockData,
        ...YMWK_INFO,
      };

      mockedSession = {
        expires: "expires",
        user: {
          address: "0x1234",
        },
      };

      await testApiHandler({
        appHandler,
        params: { chainId },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "POST",
            body: JSON.stringify(basicMockData),
          });
          expect(res.status).toStrictEqual(201);
          const {
            contractAddress,
            templateName,
            owner,
            tokenAddress,
            tokenName,
            tokenSymbol,
            tokenDecimals,
            tokenLogo,
          } = await res.json();

          const resData = {
            contractAddress: contractAddress,
            templateName: uint8ObjectToHexString(templateName),
            owner: uint8ObjectToHexString(owner),
            tokenAddress: uint8ObjectToHexString(tokenAddress),
            tokenName,
            tokenSymbol,
            tokenDecimals,
            tokenLogo,
          };
          expect(resData).toEqual(expectedData);
        },
      });
    });

    test("Invalid contract", async () => {
      const sampleData = {
        ...basicMockData,
        contractAddress: zeroAddress,
      };

      mockedSession = {
        expires: "expires",
        user: {
          address: "0x1234",
        },
      };

      await testApiHandler({
        appHandler,
        params: { chainId },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "POST",
            body: JSON.stringify(sampleData),
          });
          expect(res.status).toStrictEqual(422);
          const { error } = await res.json();
          expect(error.contractAddress).toContain("ContractFunctionExecutionError");
        },
      });
    });

    test("No tokenAddress", async () => {
      const sampleData = {
        ...basicMockData,
        tokenAddress: undefined,
      };

      mockedSession = {
        expires: "expires",
        user: {
          address: "0x1234",
        },
      };

      await testApiHandler({
        appHandler,
        params: { chainId },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "POST",
            body: JSON.stringify(sampleData),
          });
          expect(res.status).toStrictEqual(422);
          const { error } = await res.json();
          expect(error.tokenAddress).toEqual("Token address is required");
        },
      });
    });

    test("Invalid tokenAddress", async () => {
      const sampleData = {
        ...basicMockData,
        tokenAddress: zeroAddress,
      };

      mockedSession = {
        expires: "expires",
        user: {
          address: "0x1234",
        },
      };

      await testApiHandler({
        appHandler,
        params: { chainId },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "POST",
            body: JSON.stringify(sampleData),
          });
          expect(res.status).toStrictEqual(422);
          const { error } = await res.json();
          expect(error).toContain("ContractFunctionExecutionError");
        },
      });
    });

    test("Invalid tokenLogo", async () => {
      const sampleData = {
        ...basicMockData,
        tokenLogo: "asdf",
      };

      mockedSession = {
        expires: "expires",
        user: {
          address: "0x1234",
        },
      };

      await testApiHandler({
        appHandler,
        params: { chainId },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "POST",
            body: JSON.stringify(sampleData),
          });
          expect(res.status).toStrictEqual(422);
          const { error } = await res.json();
          expect(error.tokenLogo).toEqual("Invalid URL");
        },
      });
    });
  });

  test("GET /api/airdrops - Retrieve all airdrops", async () => {
    const expectedData = {
      contractAddress: null,
      templateName: TemplateType.STANDARD,
      owner: "0xabcd",
      tokenAddress: YMWK,
      tokenName: "Yamawake DAO Token",
      tokenSymbol: "YMWK",
      tokenDecimals: 18,
      tokenLogo: "https://example.com/logo.png",
    };

    await testApiHandler({
      appHandler,
      params: { chainId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "GET",
        });
        expect(res.status).toStrictEqual(200);
        const airdrops = await res.json();

        Object.keys(expectedData).map((key: string) => {
          expect(airdrops[airdrops.length - 1][key]).toStrictEqual(
            expectedData[key as keyof typeof expectedData],
          );
        });
      },
    });
  });
});
