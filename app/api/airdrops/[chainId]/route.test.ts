import { describe } from "node:test";
import { testApiHandler } from "next-test-api-route-handler";
import type { Session } from "next-auth";
import { zeroAddress } from "viem";
import { uint8ObjectToHexString } from "@/app/utils/apiHelper";
import { TemplateNames } from "@/app/lib/constants/templates";
import * as appHandler from "./route";

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

jest.mock("../../../../prisma/client", () => ({
  prisma: jestPrisma.client,
}));

afterEach(() => {
  mockedSession = null;
});

describe("POST /api/airdrops Create a new airdrop", () => {
  const basicMockData = {
    chainId: 11155111,
    title: `YMWK Airdrop`,
    contractAddress: null,
    templateName: TemplateNames.STANDARD,
    owner: "0xabcd" as `0x${string}`,
    tokenAddress: YMWK,
    tokenLogo: "https://example.com/logo.png",
  };

  describe("Not signed in", () => {
    test("should reject the request if user is not signed in", async () => {
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
  });

  describe("Signed in", () => {
    test("should create a new airdrop", async () => {
      const expectedData = {
        ...basicMockData,
        ...YMWK_INFO,
      };

      mockedSession = {
        expires: "expires",
        user: {
          address: basicMockData.owner,
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
            chainId,
            title,
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
            chainId,
            title,
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

    // Airdrop should be created regardless of the contract address since it is not used in the creation
    test("should success the creation with invalid contract", async () => {
      const expectedData = {
        ...basicMockData,
        ...YMWK_INFO,
        contractAddress: "0x0000000000000000000000000000000000000001",
      };

      mockedSession = {
        expires: "expires",
        user: {
          address: basicMockData.owner,
        },
      };

      await testApiHandler({
        appHandler,
        params: { chainId },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "POST",
            body: JSON.stringify(expectedData),
          });
          expect(res.status).toStrictEqual(201);
          const {
            chainId,
            title,
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
            chainId,
            title,
            contractAddress: contractAddress,
            templateName: uint8ObjectToHexString(templateName),
            owner: uint8ObjectToHexString(owner),
            tokenAddress: uint8ObjectToHexString(tokenAddress),
            tokenName,
            tokenSymbol,
            tokenDecimals,
            tokenLogo,
          };
          expect(resData).toEqual({ ...expectedData, contractAddress: null });
        },
      });
    });

    test("should fail to create if no token address is given", async () => {
      const sampleData = {
        ...basicMockData,
        // Set undefined as a token address
        tokenAddress: undefined,
      };

      mockedSession = {
        expires: "expires",
        user: {
          address: basicMockData.owner,
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
          expect(error).toEqual("tokenAddress: Token address is invalid");
        },
      });
    });

    test("should fail to create if invalid token address is given", async () => {
      const sampleData = {
        ...basicMockData,
        // Set an invalid token address
        tokenAddress: zeroAddress,
      };

      mockedSession = {
        expires: "expires",
        user: {
          address: basicMockData.owner,
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
          expect(error).toContain(`The contract function "name" returned no data ("0x")`);
        },
      });
    });

    test("should fail to create if invalid tokenLogo URL is given", async () => {
      const sampleData = {
        ...basicMockData,
        tokenLogo: "asdf",
      };

      mockedSession = {
        expires: "expires",
        user: {
          address: basicMockData.owner,
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
          expect(error).toEqual("tokenLogo: Invalid URL");
        },
      });
    });
  });

  describe("GET /api/airdrops - Retrieve all airdrops", async () => {
    test("should return the list of airdrops if page and limit are NOT specified", async () => {
      const expectedData = {
        contractAddress: null,
        templateName: TemplateNames.STANDARD,
        owner: "0xabcd",
        tokenAddress: YMWK,
        tokenName: "Yamawake DAO Token20",
        tokenSymbol: "YMWK",
        tokenDecimals: 18,
        tokenLogo: "https://example.com/logo.png",
      };

      await testApiHandler({
        appHandler,
        url: `/airdrops/${chainId}/`,
        params: { chainId },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "GET",
          });
          expect(res.status).toStrictEqual(200);
          const data = await res.json();

          expect(data.totalCount).toStrictEqual(30);
          expect(data.page).toStrictEqual(1);
          expect(data.limit).toStrictEqual(10);
          expect(data.totalPages).toStrictEqual(3);

          Object.keys(expectedData).map((key: string) => {
            expect(data.airdrops[data.airdrops.length - 1][key]).toStrictEqual(
              expectedData[key as keyof typeof expectedData],
            );
          });
        },
      });
    });
    test("should return the list of airdrops if page and limit are specified", async () => {
      const expectedData = {
        chainId: 11155111,
        title: `YMWK Airdrop 24`,
        contractAddress: null,
        templateName: TemplateNames.STANDARD,
        owner: "0xabcd",
        tokenAddress: YMWK,
        tokenName: "Yamawake DAO Token24",
        tokenSymbol: "YMWK",
        tokenDecimals: 18,
        tokenLogo: "https://example.com/logo.png",
      };

      const page = "2";
      const limit = "3";
      await testApiHandler({
        appHandler,
        url: `/airdrops/${chainId}/?page=${page}&limit=${limit}`,
        params: { chainId },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: "GET",
          });
          expect(res.status).toStrictEqual(200);
          const data = await res.json();

          expect(data.totalCount).toStrictEqual(30);
          expect(data.page).toStrictEqual(2);
          expect(data.limit).toStrictEqual(3);
          expect(data.totalPages).toStrictEqual(10);

          Object.keys(expectedData).map((key: string) => {
            expect(data.airdrops[data.airdrops.length - 1][key]).toStrictEqual(
              expectedData[key as keyof typeof expectedData],
            );
          });
        },
      });
    });
  });
});
