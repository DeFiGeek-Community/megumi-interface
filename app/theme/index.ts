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
      card: "rgba(20, 34, 54, 0.8)",
    },
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
    border: {
      subtle: "rgba(252, 200, 98, 0.1)",
      medium: "rgba(252, 200, 98, 0.3)",
      strong: "rgba(252, 200, 98, 0.5)",
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
        borderRadius: "16px",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
        _hover: {
          borderColor: "brand.border.medium",
          boxShadow: "0 0 20px rgba(252, 200, 98, 0.15)",
        },
      },
    },
  },
  Button: {
    variants: {
      gold: {
        bg: "linear-gradient(135deg, #FCC862 0%, #FFEA9F 50%, #EDB36F 100%)",
        color: "brand.bg.primary",
        fontWeight: "600",
        _hover: {
          boxShadow: "0 0 20px rgba(252, 200, 98, 0.4)",
          transform: "translateY(-1px)",
          _disabled: {
            bg: "linear-gradient(135deg, #FCC862 0%, #FFEA9F 50%, #EDB36F 100%)",
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
        color: "brand.gold.500",
        _hover: {
          bg: "rgba(252, 200, 98, 0.1)",
          borderColor: "brand.gold.500",
          boxShadow: "0 0 15px rgba(252, 200, 98, 0.2)",
        },
      },
      goldGhost: {
        bg: "transparent",
        color: "brand.gold.500",
        _hover: {
          bg: "rgba(252, 200, 98, 0.1)",
          textShadow: "0 0 10px rgba(252, 200, 98, 0.5)",
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
        borderRadius: "16px",
      },
      header: {
        borderBottomWidth: "1px",
        borderColor: "brand.border.subtle",
      },
      closeButton: {
        _hover: {
          bg: "rgba(252, 200, 98, 0.1)",
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
        borderRadius: "12px",
      },
      item: {
        bg: "transparent",
        _hover: {
          bg: "rgba(252, 200, 98, 0.1)",
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
        bgGradient: "linear(to-r, brand.gold.100, brand.gold.500, brand.gold.600)",
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
