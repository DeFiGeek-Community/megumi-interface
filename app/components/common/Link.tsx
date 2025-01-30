import NextLink from "next/link";
import { Link as ChakraUILink } from "@chakra-ui/react";

type LinkProps = React.ComponentProps<typeof ChakraUILink> & React.ComponentProps<typeof NextLink>;

export const Link = ({ children, ...props }: LinkProps) => {
  return (
    <ChakraUILink {...props} as={NextLink}>
      {children}
    </ChakraUILink>
  );
};
