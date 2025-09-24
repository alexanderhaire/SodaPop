import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "linear-gradient(135deg, #05060f 0%, #111b3a 100%)",
        color: "#f5f5ff",
        fontFamily: "'Space Grotesk', 'Poppins', sans-serif",
        backgroundAttachment: "fixed",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: "semibold",
        letterSpacing: "wide",
      },
      variants: {
        grey: {
          bg: "rgba(255, 255, 255, 0.08)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          backdropFilter: "blur(12px)",
          _hover: { bg: "rgba(255, 255, 255, 0.14)" },
          _active: { bg: "rgba(255, 255, 255, 0.18)" },
        },
        cta: {
          bgGradient: "linear(to-r, teal.300, cyan.400)",
          color: "gray.900",
          boxShadow: "0 12px 30px rgba(13, 148, 136, 0.35)",
          _hover: {
            bgGradient: "linear(to-r, teal.200, cyan.300)",
            transform: "translateY(-1px)",
            boxShadow: "0 14px 36px rgba(45, 212, 191, 0.4)",
          },
          _active: {
            transform: "translateY(0)",
            boxShadow: "0 10px 24px rgba(45, 212, 191, 0.28)",
          },
        },
        glass: {
          bg: "rgba(17, 25, 48, 0.75)",
          color: "white",
          border: "1px solid rgba(114, 140, 255, 0.2)",
          boxShadow: "0 16px 45px rgba(12, 22, 55, 0.55)",
          backdropFilter: "blur(18px)",
          _hover: {
            bg: "rgba(26, 36, 69, 0.9)",
            borderColor: "rgba(160, 186, 255, 0.35)",
          },
          _active: {
            bg: "rgba(20, 30, 60, 0.98)",
          },
        },
      },
    },
    Input: {
      variants: {
        glass: {
          field: {
            bg: "rgba(10, 16, 35, 0.82)",
            border: "1px solid rgba(126, 148, 255, 0.18)",
            color: "white",
            _placeholder: { color: "whiteAlpha.600" },
            _hover: { borderColor: "cyan.300" },
            _focus: {
              borderColor: "cyan.200",
              boxShadow: "0 0 0 1px rgba(165, 243, 252, 0.45)",
            },
          },
        },
      },
    },
    Textarea: {
      variants: {
        glass: {
          bg: "rgba(10, 16, 35, 0.82)",
          border: "1px solid rgba(126, 148, 255, 0.18)",
          color: "white",
          _placeholder: { color: "whiteAlpha.600" },
          _hover: { borderColor: "cyan.300" },
          _focus: {
            borderColor: "cyan.200",
            boxShadow: "0 0 0 1px rgba(165, 243, 252, 0.45)",
          },
        },
      },
    },
  },
});

export default theme;
