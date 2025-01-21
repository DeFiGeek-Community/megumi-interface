// Forked from Megumi PoC ver.
// https://github.com/DeFiGeek-Community/megumi/blob/736d5b0836fec201a920cf2900584cec4b84b41c/packages/user-app/pages/create-merkle-tree-manual.tsx
import { isAddress } from "viem";
import { parseBalanceMap } from "./shared";

export const validate = (text: string): { valid: boolean; error: string } => {
  let valid = true;
  let error = "";

  if (text !== "") {
    let spl = text.split(/\r?\n/);
    for (let i = 0; i < spl.length; i++) {
      valid &&= spl[i].includes(",");
      if (valid) {
        let result: string[] = spl[i].split(",");
        valid &&= result.length === 2;
        if (!valid) {
          error = "each line must contain two elements";
          break;
        }
        valid &&= result[0] !== "" && result[1] !== "";
        if (!valid) {
          error = "address and/or amount is a blank character";
          break;
        }
        valid &&= isAddress(result[0]);
        if (!valid) {
          error = "address is not valid";
          break;
        }
        valid &&= !Number.isNaN(result[1]);
        if (!valid) {
          error = "amount is only number";
          break;
        }
        valid &&= Number.isInteger(Number(result[1]));
        if (!valid) {
          error = "amount is only integer";
          break;
        }
      } else {
        error = "string does not contain a comma";
        break;
      }
    }
  }
  return { valid, error };
};

export const generateAirdropListFromText = (text: string) => {
  let snapshotAmountDict: { [address: `0x${string}`]: bigint } = {};
  let airdropAmountList: { address: `0x${string}`; amount: bigint }[] = [];
  let ttlAirdropAmount = BigInt(0);

  if (text !== "") {
    let spl = text.split(/\r?\n/);
    spl.forEach(function (elm) {
      let result: string[] = elm.split(",");
      snapshotAmountDict[result[0] as `0x${string}`] = BigInt(result[1]);
    });

    let snapshotAmountList = Object.entries(snapshotAmountDict).sort((p1, p2) => {
      let p1Key = p1[0];
      let p2Key = p2[0];
      if (p1Key < p2Key) {
        return -1;
      }
      if (p1Key > p2Key) {
        return 1;
      }
      return 0;
    });

    snapshotAmountList.map((elm) => {
      ttlAirdropAmount = ttlAirdropAmount + elm[1];
      airdropAmountList.push({ address: elm[0] as `0x${string}`, amount: elm[1] });
    });

    const merkleTree = parseBalanceMap(ttlAirdropAmount.toString(), airdropAmountList);

    return merkleTree;
  }
};
