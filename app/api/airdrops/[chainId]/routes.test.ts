import { describe } from "node:test";
import { testApiHandler } from "next-test-api-route-handler";
import type { Session } from "next-auth";
import { uint8ObjectToHexString } from "@/app/lib/utils";
import { TemplateType } from "@/app/lib/constants/templates";
import * as appHandler from "./routes";

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
  const chainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!;
  const tokenAddress = "0xdE2832DE0b4C0b4b6742e60186E290622B2B766C".toLowerCase(); // Sepolia YMWK
  const sampleData = {
    contractAddress: null,
    templateName: TemplateType.STANDARD,
    owner: "0xabcd",
    tokenAddress,
    tokenLogo: "https://example.com/logo.png",
  };
  const expectedData = {
    contractAddress: null,
    templateName: TemplateType.STANDARD,
    owner: "0xabcd",
    tokenAddress,
    tokenName: "Yamawake DAO Token",
    tokenSymbol: "YMWK",
    tokenDecimals: 18,
    tokenLogo: "https://example.com/logo.png",
  };
  test("no session", async () => {
    await testApiHandler({
      appHandler,
      params: { chainId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          body: JSON.stringify(sampleData),
        });
        expect(res.status).toStrictEqual(401);
      },
    });
  });

  test("with session", async () => {
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

  // test("GET /api/airdrops - Retrieve all airdrops", async () => {});
});
