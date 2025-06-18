import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#f0f0f0",
        color: "#222",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "md",
      },
      variants: {
        grey: {
          bg: "#f0f0f0",
          color: "#000",
          border: "1px solid #ccc",
          _hover: { bg: "#e0e0e0" },
          _active: { bg: "#d9d9d9" },
        },
        cta: {
          bg: "#000",
          color: "#fff",
          _hover: { bg: "#222" },
          _active: { bg: "#000" },
        },
      },
    },
  },
});

export default theme;
