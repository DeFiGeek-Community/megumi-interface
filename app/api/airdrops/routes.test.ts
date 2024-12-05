import { describe } from "node:test";
import { testApiHandler } from "next-test-api-route-handler";
import type { Session } from "next-auth";
import { uint8ObjectToHexString } from "@/app/lib/utils";
import { TemplateType } from "@/app/lib/constants/templates";
import * as appHandler from "./routes";

let mockedSession: Session | null = null;

jest.mock("../auth/authOptions", () => ({
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
  const sampleData = {
    contractAddress: "0x1234",
    templateName: TemplateType.STANDARD,
    owner: "0xabcd",
    tokenAddress: "0x4567",
    tokenLogo: "https://example.com/logo.png",
  };
  const expectedData = {
    contractAddress: "0x1234",
    templateName: TemplateType.STANDARD,
    owner: "0xabcd",
    tokenAddress: "0x4567",
    tokenName: "Test Token",
    tokenSymbol: "TTK",
    tokenDecimals: 18,
    tokenLogo: "https://example.com/logo.png",
  };
  test("no session", async () => {
    await testApiHandler({
      appHandler,
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
          contractAddress: uint8ObjectToHexString(contractAddress),
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
