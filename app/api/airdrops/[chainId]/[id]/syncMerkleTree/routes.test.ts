import { describe } from "node:test";
import { testApiHandler } from "next-test-api-route-handler";
import type { Session } from "next-auth";
import { deleteAllObjects } from "@/app/lib/utils";
import { TemplateType } from "@/app/lib/constants/templates";
import * as appHandler from "./routes";
import { lambdaClient } from "@/app/lib/aws";
import { InvokeCommand, LogType } from "@aws-sdk/client-lambda";

let mockedSession: Session | null = null;

jest.mock("../../../../auth/authOptions", () => ({
  authOptions: {
    adapter: {},
    providers: [],
    callbacks: {},
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockedSession)),
}));

jest.mock("../../../../../../prisma/client", () => ({
  prisma: jestPrisma.client,
}));

afterEach(async () => {
  mockedSession = null;
  await deleteAllObjects(process.env.AWS_S3_BUCKET_NAME!);
});

describe("Invoke lambda function", () => {
  test("Invoke lambda function directly", async () => {
    const functionName = "watchMegumiContractDeploymentStatusAndInsertMerkletree";
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify({}),
      LogType: LogType.Tail,
    });
    const { Payload, LogResult } = await lambdaClient.send(command);
    const response = Payload ? Buffer.from(Payload).toString() : "";
    const logs = LogResult ? Buffer.from(LogResult, "base64").toString() : "";
    const result = await JSON.parse(response);
    console.log(result);
    expect(result.statusCode).toStrictEqual(200);
  });
});
