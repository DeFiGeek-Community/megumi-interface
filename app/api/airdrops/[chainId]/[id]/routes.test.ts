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
    const expectedData = convertAirdropWithUint8ArrayToHexString(airdrop);

    await testApiHandler({
      appHandler,
      params: { chainId, id: expectedData.id! },
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
// describe("PATCH /api/airdrop/:id - Update an airdrop", () => {
//   const basicMockData = {
//     contractAddress: null,
//     templateName: TemplateType.STANDARD,
//     owner: "0xabcd",
//     tokenAddress: YMWK,
//     tokenLogo: "https://example.com/logo.png",
//   };

//   test("no session", async () => {
//     await testApiHandler({
//       appHandler,
//       params: { chainId },
//       test: async ({ fetch }) => {
//         const res = await fetch({
//           method: "POST",
//           body: JSON.stringify(basicMockData),
//         });
//         expect(res.status).toStrictEqual(401);
//       },
//     });
//   });

//   describe("with session", () => {
//     test("not owner", async () => {
//       await testApiHandler({
//         appHandler,
//         params: { chainId },
//         test: async ({ fetch }) => {
//           const res = await fetch({
//             method: "POST",
//             body: JSON.stringify(basicMockData),
//           });
//           expect(res.status).toStrictEqual(422);
//           const { error } = await res.json();
//           expect(error.owner).toContain("ContractFunctionExecutionError");
//         },
//       });
//     });

//     test("Success create airdrop", async () => {
//       const expectedData = {
//         ...basicMockData,
//         ...YMWK_INFO,
//       };

//       mockedSession = {
//         expires: "expires",
//         user: {
//           address: "0x1234",
//         },
//       };

//       await testApiHandler({
//         appHandler,
//         params: { chainId },
//         test: async ({ fetch }) => {
//           const res = await fetch({
//             method: "POST",
//             body: JSON.stringify(basicMockData),
//           });
//           expect(res.status).toStrictEqual(201);
//           const {
//             contractAddress,
//             templateName,
//             owner,
//             tokenAddress,
//             tokenName,
//             tokenSymbol,
//             tokenDecimals,
//             tokenLogo,
//           } = await res.json();

//           const resData = {
//             contractAddress: contractAddress,
//             templateName: uint8ObjectToHexString(templateName),
//             owner: uint8ObjectToHexString(owner),
//             tokenAddress: uint8ObjectToHexString(tokenAddress),
//             tokenName,
//             tokenSymbol,
//             tokenDecimals,
//             tokenLogo,
//           };
//           expect(resData).toEqual(expectedData);
//         },
//       });
//     });

//     test("Invalid contract", async () => {
//       const sampleData = {
//         ...basicMockData,
//         contractAddress: zeroAddress,
//       };

//       mockedSession = {
//         expires: "expires",
//         user: {
//           address: "0x1234",
//         },
//       };

//       await testApiHandler({
//         appHandler,
//         params: { chainId },
//         test: async ({ fetch }) => {
//           const res = await fetch({
//             method: "POST",
//             body: JSON.stringify(sampleData),
//           });
//           expect(res.status).toStrictEqual(422);
//           const { error } = await res.json();
//           expect(error.contractAddress).toContain("ContractFunctionExecutionError");
//         },
//       });
//     });

//     test("No tokenAddress", async () => {
//       const sampleData = {
//         ...basicMockData,
//         tokenAddress: undefined,
//       };

//       mockedSession = {
//         expires: "expires",
//         user: {
//           address: "0x1234",
//         },
//       };

//       await testApiHandler({
//         appHandler,
//         params: { chainId },
//         test: async ({ fetch }) => {
//           const res = await fetch({
//             method: "POST",
//             body: JSON.stringify(sampleData),
//           });
//           expect(res.status).toStrictEqual(422);
//           const { error } = await res.json();
//           expect(error.tokenAddress).toEqual("Token address is required");
//         },
//       });
//     });

//     test("Invalid tokenAddress", async () => {
//       const sampleData = {
//         ...basicMockData,
//         tokenAddress: zeroAddress,
//       };

//       mockedSession = {
//         expires: "expires",
//         user: {
//           address: "0x1234",
//         },
//       };

//       await testApiHandler({
//         appHandler,
//         params: { chainId },
//         test: async ({ fetch }) => {
//           const res = await fetch({
//             method: "POST",
//             body: JSON.stringify(sampleData),
//           });
//           expect(res.status).toStrictEqual(422);
//           const { error } = await res.json();
//           expect(error).toContain("ContractFunctionExecutionError");
//         },
//       });
//     });

//     test("Invalid tokenLogo", async () => {
//       const sampleData = {
//         ...basicMockData,
//         tokenLogo: "asdf",
//       };

//       mockedSession = {
//         expires: "expires",
//         user: {
//           address: "0x1234",
//         },
//       };

//       await testApiHandler({
//         appHandler,
//         params: { chainId },
//         test: async ({ fetch }) => {
//           const res = await fetch({
//             method: "POST",
//             body: JSON.stringify(sampleData),
//           });
//           expect(res.status).toStrictEqual(422);
//           const { error } = await res.json();
//           expect(error.tokenLogo).toEqual("Invalid URL");
//         },
//       });
//     });
//   });
// });
// describe("DELETE /api/airdrop/:id - Delete a airdrop", async () => {
//   test("No page and limit specified", async () => {
//     const expectedData = {
//       contractAddress: null,
//       templateName: TemplateType.STANDARD,
//       owner: "0xabcd",
//       tokenAddress: YMWK,
//       tokenName: "Yamawake DAO Token20",
//       tokenSymbol: "YMWK",
//       tokenDecimals: 18,
//       tokenLogo: "https://example.com/logo.png",
//     };

//     await testApiHandler({
//       appHandler,
//       url: `/airdrops/${chainId}/`,
//       params: { chainId },
//       test: async ({ fetch }) => {
//         const res = await fetch({
//           method: "GET",
//         });
//         expect(res.status).toStrictEqual(200);
//         const data = await res.json();

//         expect(data.totalCount).toStrictEqual(30);
//         expect(data.page).toStrictEqual(1);
//         expect(data.limit).toStrictEqual(10);
//         expect(data.totalPages).toStrictEqual(3);

//         Object.keys(expectedData).map((key: string) => {
//           expect(data.airdrops[data.airdrops.length - 1][key]).toStrictEqual(
//             expectedData[key as keyof typeof expectedData],
//           );
//         });
//       },
//     });
//   });
//   test("page and limit specified", async () => {
//     const expectedData = {
//       contractAddress: null,
//       templateName: TemplateType.STANDARD,
//       owner: "0xabcd",
//       tokenAddress: YMWK,
//       tokenName: "Yamawake DAO Token24",
//       tokenSymbol: "YMWK",
//       tokenDecimals: 18,
//       tokenLogo: "https://example.com/logo.png",
//     };

//     const page = "2";
//     const limit = "3";
//     await testApiHandler({
//       appHandler,
//       url: `/airdrops/${chainId}/?page=${page}&limit=${limit}`,
//       params: { chainId },
//       test: async ({ fetch }) => {
//         const res = await fetch({
//           method: "GET",
//         });
//         expect(res.status).toStrictEqual(200);
//         const data = await res.json();

//         expect(data.totalCount).toStrictEqual(30);
//         expect(data.page).toStrictEqual(2);
//         expect(data.limit).toStrictEqual(3);
//         expect(data.totalPages).toStrictEqual(10);

//         Object.keys(expectedData).map((key: string) => {
//           expect(data.airdrops[data.airdrops.length - 1][key]).toStrictEqual(
//             expectedData[key as keyof typeof expectedData],
//           );
//         });
//       },
//     });
//   });
// });
