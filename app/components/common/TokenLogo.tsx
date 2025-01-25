import { useState } from "react";
import { Avatar, Image, SkeletonCircle, Box } from "@chakra-ui/react";
import type { ImageProps } from "@chakra-ui/react";

type TokenLogoProps = {
  airdropTitle: string;
  tokenName?: string | null;
  tokenLogo?: string | null;
} & ImageProps;

export function TokenLogo({ airdropTitle, tokenName, tokenLogo, ...props }: TokenLogoProps) {
  const defaultSize = "64px";
  const title = tokenName ?? airdropTitle;
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(true);

  if (!tokenLogo || !isValid) {
    return (
      <Avatar
        w={props.w ?? props.width ?? defaultSize}
        h={props.h ?? props.height ?? defaultSize}
        name={tokenName || airdropTitle}
        bg="gray.500"
      />
    );
  }

  return (
    <>
      <Box
        display={isLoading ? "block" : "none"}
        position="relative"
        w={props.w ?? defaultSize}
        h={props.h ?? defaultSize}
        {...props}
      >
        <SkeletonCircle position={"absolute"} top={0} left={0} w="100%" h="100%" />
      </Box>
      <Image
        src={tokenLogo as string}
        alt={title}
        w={props.w ?? defaultSize}
        h={props.h ?? defaultSize}
        borderRadius="full"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsValid(false);
          setIsLoading(false);
        }}
        display={isLoading ? "none" : "block"}
        {...props}
      />
    </>
  );
}
