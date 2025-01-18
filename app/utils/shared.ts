import { TemplateNames } from "@/app/lib/constants/templates";

export const isSupportedTemplate = (templateName: string) => {
  return Object.values(TemplateNames)
    .map((v) => v as string)
    .includes(templateName);
};

export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? (error.message ? error.message : error.name) : `${error}`;
};

export const objectToKeyValueString = (obj: { [key: string]: any }) => {
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};
