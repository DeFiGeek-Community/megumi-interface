import { parseArgs } from "node:util";
import { PrismaClient } from "@prisma/client";
import { TemplateType } from "@/app/lib/constants/templates";

interface ParseArgsOptionConfig {
  type: "string" | "boolean";
}
interface ParseArgsOptionsConfig {
  [key: string]: ParseArgsOptionConfig;
}
const options: ParseArgsOptionsConfig = {
  environment: { type: "string" },
};

const prisma = new PrismaClient();
const encoder = new TextEncoder();
const YMWK = "0xdE2832DE0b4C0b4b6742e60186E290622B2B766C".toLowerCase(); // Sepolia YMWK
async function main() {
  const {
    values: { environment },
  } = parseArgs({ options });

  switch (environment) {
    case "development":
      /** data for development */
      break;
    case "test":
      /** data for test environment */
      const airdrop = await prisma.airdrop.create({
        data: {
          contractAddress: null,
          templateName: Uint8Array.from(Buffer.from(TemplateType.STANDARD.slice(2), "hex")),
          owner: Uint8Array.from(Buffer.from("0xabcd".slice(2), "hex")),
          tokenAddress: Uint8Array.from(Buffer.from(YMWK.slice(2), "hex")),
          tokenName: "Yamawake DAO Token",
          tokenSymbol: "YMWK",
          tokenDecimals: 18,
          tokenLogo: "https://example.com/logo.png",
        },
      });
      break;
    default:
      break;
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
