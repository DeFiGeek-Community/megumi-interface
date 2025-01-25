import { TemplateNames, TemplateType } from "@/app/lib/constants/templates";

export const isSupportedTemplate = (templateName: string) => {
  return Object.values(TemplateNames)
    .map((v) => v as string)
    .includes(templateName);
};

export function getTemplateTypeByHex(hex: string): TemplateType {
  for (const [key, val] of Object.entries(TemplateNames)) {
    if (val === hex) {
      return key as TemplateType;
    }
  }
  throw new Error(`Template type not found for ${hex}`);
}

export function getTemplateKeyByHex(hex: string): keyof typeof TemplateType {
  let nameKey;
  for (const [key, value] of Object.entries(TemplateNames)) {
    if (value === hex) {
      nameKey = key as TemplateType;
      break;
    }
  }
  if (!nameKey) {
    throw new Error(`Template type not found for ${hex}`);
  }
  for (const [key, value] of Object.entries(TemplateType)) {
    if (value === nameKey) {
      return key as keyof typeof TemplateType;
    }
  }
  throw new Error(`Template type not found for ${hex}`);
}

export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? (error.message ? error.message : error.name) : `${error}`;
};

export const objectToKeyValueString = (obj: { [key: string]: any }) => {
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};

export const uuidToHex = (uuid: string): `0x${string}` => {
  return `0x${uuid.replace(/-/g, "").padEnd(64, "0")}`;
};

export const safeParseBigInt = (input: string): bigint => {
  const numericString = input.replace(/[^0-9]/g, "");
  if (numericString === "") return BigInt(0);

  try {
    return BigInt(numericString);
  } catch (error) {
    console.warn(`Could not convert ${input} to BigInt`);
    return BigInt(0);
  }
};
