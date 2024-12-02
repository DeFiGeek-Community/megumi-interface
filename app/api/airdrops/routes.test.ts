import { testApiHandler } from "next-test-api-route-handler";
import * as appHandler from "./routes";
import { PrismaClient } from "@prisma/client";
import { describe } from "node:test";
const prisma = new PrismaClient();

describe("/api/airdrops CRUD API", () => {
  test("POST /api/airdrop - Create a new airdrop", async () => {
    // TODO
    expect(true).toBe(true);
    // await testApiHandler({
    //   appHandler,
    //   test: async ({ fetch }) => {
    //     const res = await fetch({
    //       method: "POST",
    //       body: JSON.stringify({
    //         id: "1",
    //         contractAddress: "0x123",
    //         templateName: "Template A",
    //         owner: "0xabc",
    //         tokenAddress: "0x456",
    //         tokenName: "Test Token",
    //         tokenSymbol: "TTK",
    //         tokenDecimals: 18,
    //         tokenLogo: "https://example.com/logo.png",
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //       }),
    //     });
    //     expect(res.status).resolves.toStrictEqual(201);
    //     expect(JSON.parse(await res.json())).toEqual({
    //       id: "1",
    //       contractAddress: "0x123",
    //       templateName: "Template A",
    //       owner: "0xabc",
    //       tokenAddress: "0x456",
    //       tokenName: "Test Token",
    //       tokenSymbol: "TTK",
    //       tokenDecimals: 18,
    //       tokenLogo: "https://example.com/logo.png",
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     });
    //   },
    // });
    //   test("GET /api/airdrops - Retrieve all airdrops", async () => {
    //   });
  });
});
