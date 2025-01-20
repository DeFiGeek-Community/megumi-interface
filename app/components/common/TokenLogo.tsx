import { Image } from "@chakra-ui/react";
import type { ImageProps } from "@chakra-ui/react";

export function TokenLogo({
  airdropTitle,
  tokenName,
  tokenLogo,
  ...props
}: { airdropTitle: string; tokenName?: string | null; tokenLogo?: string | null } & ImageProps) {
  const defaultHeight = "64px";
  const defaultWidth = "64px";
  const defaultBorderRadius = "64px";
  const height = props.h ?? defaultHeight;
  const width = props.w ?? defaultWidth;
  const title = tokenName ? tokenName : airdropTitle;
  return (
    <Image
      alt={tokenName ? tokenName : airdropTitle}
      src={tokenLogo ? tokenLogo : ""}
      h={defaultHeight}
      w={defaultWidth}
      borderRadius={defaultBorderRadius}
      fallbackSrc={`https://via.placeholder.com/${parseInt(String(width))}x${parseInt(
        String(height),
      )}?text=${title}`}
      {...props}
    />
  );
}
