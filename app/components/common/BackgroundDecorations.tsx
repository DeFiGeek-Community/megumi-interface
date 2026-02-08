"use client";
import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

// Gentle floating animation for light particles (blessings)
const floatGentle = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
  25% { transform: translateY(-15px) translateX(5px); opacity: 0.8; }
  50% { transform: translateY(-8px) translateX(-3px); opacity: 0.5; }
  75% { transform: translateY(-20px) translateX(8px); opacity: 0.7; }
`;

// Ripple expansion animation (blessing circulation)
const rippleExpand = keyframes`
  0% { transform: scale(0.8); opacity: 0.3; }
  50% { transform: scale(1); opacity: 0.15; }
  100% { transform: scale(1.2); opacity: 0; }
`;

// Gentle wave flow (nurturing movement)
const waveFlow = keyframes`
  0% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(30px) translateY(-10px); }
  100% { transform: translateX(0) translateY(0); }
`;

// Soft pulse for warm orbs
const softPulse = keyframes`
  0%, 100% { opacity: 0.08; transform: scale(1); }
  50% { opacity: 0.12; transform: scale(1.05); }
`;

export default function BackgroundDecorations() {
  return (
    <>
      {/* Main warm gradient orb - top right (parent's warmth) */}
      <Box
        position="fixed"
        top="-150px"
        right="-150px"
        width="700px"
        height="700px"
        borderRadius="full"
        background="radial-gradient(circle, rgba(245, 169, 98, 0.12) 0%, rgba(252, 200, 98, 0.06) 40%, transparent 70%)"
        pointerEvents="none"
        zIndex={0}
        filter="blur(60px)"
        animation={`${softPulse} 8s ease-in-out infinite`}
      />

      {/* Warm orb - bottom left (nurturing glow) */}
      <Box
        position="fixed"
        bottom="-200px"
        left="-150px"
        width="600px"
        height="600px"
        borderRadius="full"
        background="radial-gradient(circle, rgba(255, 212, 168, 0.1) 0%, rgba(245, 169, 98, 0.05) 40%, transparent 70%)"
        pointerEvents="none"
        zIndex={0}
        filter="blur(50px)"
        animation={`${softPulse} 10s ease-in-out infinite 2s`}
      />

      {/* Ripple circles - blessing circulation (center) */}
      <Box
        position="fixed"
        top="40%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="500px"
        height="500px"
        pointerEvents="none"
        zIndex={0}
      >
        {/* Inner ripple */}
        <Box
          position="absolute"
          inset="100px"
          borderRadius="full"
          border="1px solid"
          borderColor="rgba(252, 200, 98, 0.08)"
          animation={`${rippleExpand} 6s ease-out infinite`}
        />
        {/* Middle ripple */}
        <Box
          position="absolute"
          inset="50px"
          borderRadius="full"
          border="1px solid"
          borderColor="rgba(245, 169, 98, 0.06)"
          animation={`${rippleExpand} 6s ease-out infinite 2s`}
        />
        {/* Outer ripple */}
        <Box
          position="absolute"
          inset="0"
          borderRadius="full"
          border="1px solid"
          borderColor="rgba(255, 212, 168, 0.04)"
          animation={`${rippleExpand} 6s ease-out infinite 4s`}
        />
      </Box>

      {/* Center soft glow - nurturing warmth */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="100%"
        height="100%"
        maxWidth="1400px"
        maxHeight="900px"
        borderRadius="full"
        background="radial-gradient(ellipse at center, rgba(245, 169, 98, 0.03) 0%, rgba(252, 200, 98, 0.015) 40%, transparent 70%)"
        pointerEvents="none"
        zIndex={0}
      />

      {/* Additional floating particles - center area */}
      <Box
        as="svg"
        position="fixed"
        top="45%"
        left="30%"
        width="80px"
        height="100px"
        opacity={0.5}
        pointerEvents="none"
        zIndex={0}
      >
        <circle cx="20" cy="40" r="1.5" fill="#FCC862" opacity="0.4">
          <animate attributeName="cy" values="40;25;40" dur="7s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="70" r="2" fill="#FFEA9F" opacity="0.3">
          <animate attributeName="cy" values="70;55;70" dur="5.8s" repeatCount="indefinite" />
        </circle>
      </Box>
    </>
  );
}
