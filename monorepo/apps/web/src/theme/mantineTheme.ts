import { MantineThemeOverride } from "@mantine/core";

const mantineTheme: MantineThemeOverride = {
  fontFamily: "Euclid Circular B, Arial, Helvetica, sans-serif",
  primaryColor: "brand",
  colors: {
    brand: [
      "#e6ecf2", // 0
      "#c2d0e0", // 1
      "#9bb3cc", // 2
      "#7496b8", // 3
      "#527ca7", // 4
      "#38628d", // 5
      "#254a6e", // 6
      "#193a57", // 7
      "#122F47", // 8 (main)
      "#0a1a28", // 9
    ],
  },
  components: {
    Text: {
      defaultProps: {
        size: "12px",
        c: "#495057",
        fw: 400,
        lh:"100%"
      },
    },
    TextInput: {
      defaultProps: {
        size: "sm",
        radius: "4px",
        h: "36px",
        border: "1px solid #CED4DA",
      },
      styles:{
        error:{
            fontSize:12,
            color:"#FC4E4E",
            fontWeight:400,
        }
      }
    },
    PasswordInput: {
      defaultProps: {
        size: "sm",
        radius: "4px",
        h: "36px",
      },
      styles:{
        error:{
            fontSize:12,
            color:"#FC4E4E",
            fontWeight:400,
        }
      }
    },
    Button: {
      defaultProps: {
        size: "sm",
        radius: "xl",
        h: "36px",
        fz: 12,
        lh: 16,
        px: 24,
        lts:"0.15rem"
      },
      styles:{
        error:{
            fontSize:12,
            color:"#FC4E4E",
            fontWeight:400,
        }
      }
    },
    Modal: {
      defaultProps: {
        radius: 24,
        padding:32,
      },
      styles: {
        title: {
          fontWeight: 400,
          fontSize: 24,
        },
      },
    },
  },
};

export default mantineTheme;
