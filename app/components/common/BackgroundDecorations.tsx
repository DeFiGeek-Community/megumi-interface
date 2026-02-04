"use client";
import { Box } from "@chakra-ui/react";

export default function BackgroundDecorations() {
  return (
    <>
      {/* Top-right gradient orb */}
      <Box
        position="fixed"
        top="-200px"
        right="-200px"
        width="600px"
        height="600px"
        borderRadius="full"
        background="radial-gradient(circle, rgba(252, 200, 98, 0.08) 0%, rgba(252, 200, 98, 0.02) 40%, transparent 70%)"
        pointerEvents="none"
        zIndex={0}
        filter="blur(40px)"
      />
      
      {/* Bottom-left gradient orb */}
      <Box
        position="fixed"
        bottom="-300px"
        left="-200px"
        width="700px"
        height="700px"
        borderRadius="full"
        background="radial-gradient(circle, rgba(237, 179, 111, 0.06) 0%, rgba(237, 179, 111, 0.02) 40%, transparent 70%)"
        pointerEvents="none"
        zIndex={0}
        filter="blur(60px)"
      />
      
      {/* Center accent glow */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="100%"
        height="100%"
        maxWidth="1200px"
        maxHeight="800px"
        borderRadius="full"
        background="radial-gradient(ellipse at center, rgba(252, 200, 98, 0.02) 0%, transparent 60%)"
        pointerEvents="none"
        zIndex={0}
      />

      {/* Small decorative dots */}
      <Box
        as="svg"
        position="fixed"
        top="30%"
        left="8%"
        width="100px"
        height="100px"
        opacity={0.15}
        pointerEvents="none"
        zIndex={0}
      >
        <circle cx="20" cy="20" r="2" fill="#FCC862" />
        <circle cx="50" cy="35" r="1.5" fill="#FFEA9F" />
        <circle cx="80" cy="15" r="1" fill="#EDB36F" />
        <circle cx="30" cy="60" r="1.5" fill="#FCC862" />
        <circle cx="70" cy="70" r="2" fill="#FFEA9F" />
      </Box>

      {/* Small decorative dots - right side */}
      <Box
        as="svg"
        position="fixed"
        bottom="40%"
        right="10%"
        width="80px"
        height="80px"
        opacity={0.12}
        pointerEvents="none"
        zIndex={0}
      >
        <circle cx="15" cy="15" r="1.5" fill="#FCC862" />
        <circle cx="45" cy="25" r="2" fill="#FFEA9F" />
        <circle cx="65" cy="55" r="1" fill="#EDB36F" />
        <circle cx="25" cy="50" r="1.5" fill="#FCC862" />
      </Box>
    </>
  );
}
