import { testApiHandler } from "next-test-api-route-handler";
import * as appHandler from "./routes";
import { PrismaClient } from "@prisma/client";
import { describe } from "node:test";
const prisma = new PrismaClient();

describe("/api/airdrop CRUD API", () => {
  test("PATCH /api/airdrop/:id - Update a airdrop", async () => {
    // TODO
    expect(true).toBe(true);
  });
  test("DELETE /api/airdrop/:id - Delete a airdrop", async () => {
    // TODO
  });
});
