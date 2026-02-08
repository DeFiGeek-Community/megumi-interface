"use client";
import { Box, BoxProps } from "@chakra-ui/react";

interface GradientDividerProps extends Omit<BoxProps, "position"> {
    variant: "top" | "bottom";
}

export default function GradientDivider({ variant, ...props }: GradientDividerProps) {
    const isTop = variant === "top";

    return (
        <Box
            position="absolute"
            {...(isTop ? { top: "-1px" } : { bottom: "-1px" })}
            left={0}
            right={0}
            height="2px"
            background={
                isTop
                    ? "linear-gradient(90deg, transparent 0%, rgba(255, 212, 168, 0.3) 20%, rgba(252, 200, 98, 0.4) 50%, rgba(245, 169, 98, 0.3) 80%, transparent 100%)"
                    : "linear-gradient(90deg, transparent 0%, rgba(245, 169, 98, 0.3) 20%, rgba(252, 200, 98, 0.4) 50%, rgba(255, 212, 168, 0.3) 80%, transparent 100%)"
            }
            opacity={isTop ? 0.5 : 0.6}
            pointerEvents="none"
            {...props}
        />
    );
}
