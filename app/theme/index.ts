import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const colors = {
  brand: {
    bg: {
      primary: "#0E192B",
      secondary: "#142236",
      tertiary: "#1a2d47",
      card: "rgba(20, 34, 54, 0.85)",
    },
    // Original gold palette
    gold: {
      50: "#FFF9E6",
      100: "#FFEA9F",
      200: "#FFE085",
      300: "#FFD66B",
      400: "#FFEA9F",
      500: "#FCC862",
      600: "#EDB36F",
      700: "#D9A05C",
      800: "#C48D49",
      900: "#AF7A36",
    },
    // Warm orange palette - nurturing warmth
    warm: {
      50: "#FFF5EB",
      100: "#FFE8D4",
      200: "#FFD4A8",
      300: "#FFC088",
      400: "#FFAB68",
      500: "#F5A962",
      600: "#E8965A",
      700: "#D98347",
      800: "#C97034",
      900: "#B85D21",
    },
    // Soft peach - gentle blessings
    peach: {
      light: "#FFE4D1",
      medium: "#FFD4B8",
      glow: "rgba(255, 212, 168, 0.15)",
    },
    border: {
      subtle: "rgba(252, 200, 98, 0.1)",
      medium: "rgba(252, 200, 98, 0.3)",
      strong: "rgba(252, 200, 98, 0.5)",
      warm: "rgba(245, 169, 98, 0.2)",
    },
    // Glow effects - blessing light
    glow: {
      gold: "rgba(252, 200, 98, 0.3)",
      warm: "rgba(245, 169, 98, 0.25)",
      soft: "rgba(255, 212, 168, 0.2)",
    },
  },
};

const components = {
  Card: {
    baseStyle: {
      container: {
        bg: "brand.bg.card",
        borderColor: "brand.border.subtle",
        borderWidth: "1px",
        borderRadius: "20px", // Softer, more organic shape
        backdropFilter: "blur(12px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        _hover: {
          borderColor: "brand.border.warm",
          boxShadow: "0 4px 30px rgba(245, 169, 98, 0.15), 0 0 20px rgba(252, 200, 98, 0.1)",
          transform: "translateY(-2px)",
        },
      },
    },
  },
  Button: {
    variants: {
      // Warm nurturing gradient - like parent bird's care
      gold: {
        bg: "linear-gradient(135deg, #F5A962 0%, #FCC862 35%, #FFEA9F 65%, #EDB36F 100%)",
        color: "brand.bg.primary",
        fontWeight: "600",
        borderRadius: "12px",
        _hover: {
          boxShadow: "0 4px 25px rgba(245, 169, 98, 0.4), 0 0 15px rgba(252, 200, 98, 0.3)",
          transform: "translateY(-2px)",
          _disabled: {
            bg: "linear-gradient(135deg, #F5A962 0%, #FCC862 35%, #FFEA9F 65%, #EDB36F 100%)",
          },
        },
        _active: {
          transform: "translateY(0)",
        },
      },
      goldOutline: {
        bg: "transparent",
        border: "1px solid",
        borderColor: "brand.border.strong",
        borderRadius: "12px",
        color: "brand.gold.500",
        _hover: {
          bg: "rgba(245, 169, 98, 0.08)",
          borderColor: "brand.warm.500",
          boxShadow: "0 0 20px rgba(245, 169, 98, 0.15)",
        },
      },
      goldGhost: {
        bg: "transparent",
        color: "brand.gold.500",
        _hover: {
          bg: "rgba(245, 169, 98, 0.08)",
          textShadow: "0 0 12px rgba(252, 200, 98, 0.4)",
        },
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: "brand.bg.secondary",
        borderColor: "brand.border.subtle",
        borderWidth: "1px",
        borderRadius: "20px",
      },
      header: {
        borderBottomWidth: "1px",
        borderColor: "brand.border.subtle",
      },
      closeButton: {
        _hover: {
          bg: "rgba(245, 169, 98, 0.1)",
        },
      },
    },
  },
  Menu: {
    baseStyle: {
      list: {
        bg: "brand.bg.secondary",
        borderColor: "brand.border.subtle",
        borderWidth: "1px",
        borderRadius: "16px",
      },
      item: {
        bg: "transparent",
        _hover: {
          bg: "rgba(245, 169, 98, 0.08)",
        },
      },
    },
  },
  Tag: {
    baseStyle: {
      container: {
        bg: "brand.bg.tertiary",
        borderRadius: "full",
      },
    },
  },
  Skeleton: {
    baseStyle: {
      borderRadius: "16px",
      startColor: "brand.bg.card",
      endColor: "brand.border.subtle",
    },
  },
  Heading: {
    variants: {
      gradient: {
        bgGradient: "linear(to-r, brand.warm.200, brand.gold.500, brand.warm.500, brand.gold.600)",
        bgClip: "text",
        fontWeight: "bold",
      },
    },
  },
};

const styles = {
  global: {
    body: {
      bg: "brand.bg.primary",
      color: "white",
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  components,
  styles,
});

export default theme;
