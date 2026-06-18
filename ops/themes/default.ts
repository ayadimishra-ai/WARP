"use client";

import {
  ActionIcon,
  Button,
  Pagination,
  Tooltip,
  createTheme,
} from "@mantine/core";

export const theme = createTheme({
  // primaryColor: '#FF9E1B',
  colors: {
    primary: [
      "#FFA93C",
      "#FF9E1B",
      "#FF9E1B",
      "#FF9E1B",
      "#FF9E1B",
      "#FF9E1B",
      "#FF9E1B",
      "#FF9E1B",
      "#FF9E1B",
      "#FC960C",
    ],
    secondary: [
      "#EEFCFA", // GREEN LIGHT BASE
      "#C0F5F0", // PASTEL GREEN LIGHT
      "#72D0C6",
      "#72D0C6",
      "#72D0C6",
      "#72D0C6",
      "#72D0C6",
      "#72D0C6",
      "#72D0C6",
      "#1C9689", //DARK GREEN
    ],
    tertiary: [
      "#EEFCFA", // GREEN LIGHT BASE
      "#C0F5F0", // PASTEL GREEN LIGHT
      "#72D0C6",
      "#72D0C6",
      "#72D0C6",
      "#72D0C6",
      "#72D0C6",
      "#72D0C6",
      "#72D0C6",
      "#1C9689", //DARK GREEN,
    ],
    quaternary: [
      "#666",
      "#666",
      "#666",
      "#666",
      "#666",
      "#666",
      "#666",
      "#666",
      "#666",
      "#666",
    ],
    white: [
      "#fff",
      "#fff",
      "#fff",
      "#fff",
      "#fff",
      "#fff",
      "#fff",
      "#fff",
      "#fff",
      "#fff",
    ],
    black: [
      "#000",
      "#000",
      "#000",
      "#000",
      "#000",
      "#000",
      "#000",
      "#000",
      "#000",
      "#000",
    ],
    grey: [
      "#EEE",
      "#EEE",
      "#EEE",
      "#EEE",
      "#EEE",
      "#EEE",
      "#EEE",
      "#EEE",
      "#EEE",
      "#EEE",
    ],
    success: [
      "#03F4AC",
      "#03F4AC",
      "#03F4AC",
      "#03F4AC",
      "#03F4AC",
      "#03F4AC",
      "#03F4AC",
      "#03F4AC",
      "#03F4AC",
      "#03F4AC",
    ],
    failure: [
      "#FF8080",
      "#FF8080",
      "#FF8080",
      "#FF8080",
      "#FF8080",
      "#FF8080",
      "#FF8080",
      "#FF8080",
      "#FF8080",
      "#FF8080",
    ],
    partialReject: [
      "#FDA92F",
      "#FDA92F",
      "#FDA92F",
      "#FDA92F",
      "#FDA92F",
      "#FDA92F",
      "#FDA92F",
      "#FDA92F",
      "#FDA92F",
      "#FDA92F",
    ],
  },
  components: {
    Button: Button.extend({
      vars: (themeOpt, props) => {
        // console.log(123, themeOpt);
        if (props.variant === "primaryButton") {
          return {
            root: {
              "--button-height": "34px",
              "--button-padding-x": "16px",
              "--button-padding-y": "8px",
              fontSize: 12,
              borderRadius: 20,
              fontWeight: 600,
              "--button-bg": themeOpt.colors.primary[0],
              "--button-hover": themeOpt.colors.primary[9],
            },
          };
        }
        if (props.variant === "secondaryButton") {
          return {
            root: {
              "--button-height": "34px",
              "--button-padding-x": "16px",
              "--button-padding-y": "8px",
              "--button-fz": "12px",
              "--button-radius": "20px",
              "--button-bg": themeOpt.colors.white[5],
              "--button-hover": themeOpt.colors.secondary[5],
              "--button-color": themeOpt.colors.secondary[5],
              "--button-hover-color": themeOpt.colors.white[5],
              fontWeight: 600,
              border: "1px solid",
              borderColor: themeOpt.colors.secondary[5],
            },
          };
        }
        if (props.variant === "tertiaryButton") {
          return {
            root: {
              "--button-height": "34px",
              "--button-padding-x": "16px",
              "--button-padding-y": "8px",
              "--button-fz": "12px",
              "--button-radius": "20px",
              "--button-bg": themeOpt.colors.white[5],
              "--button-hover": themeOpt.colors.quaternary[5],
              "--button-color": themeOpt.colors.quaternary[5],
              "--button-hover-color": themeOpt.colors.white[5],
              fontWeight: 600,
              border: "1px solid",
              borderColor: themeOpt.colors.quaternary[5],
            },
          };
        }

        return { root: {} };
      },
    }),
    ActionIcon: ActionIcon.extend({
      vars: (themeOpt, props) => {
        return {
          root: {
            "--ai-bg": "transparent",
            "--ai-hover": "transparent",

            thead: {
              backgroundColor: "#F6F8FB",
            },
          },
        };
      },
    }),

    Pagination: Pagination.extend({
      vars: (themeOpt, props) => {
        return {
          control: {
            borderColor: "#fff",
          },
          root: {
            "--pagination-active-color": "#fff",
            "--pagination-active-bg": "#72D0C6",
            "--pagination-bg": "#F7F9FB",
            "--pagination-control-radius": "20px",
          },
        };
      },
    }),
    Tooltip: Tooltip.extend({
      vars: (themeOpt, props) => {
        return {
          tooltip: {
            "--tooltip-bg": "#003B52",
            fontSize: 12,
            color: "#fff",
            lineHeight: "16px",
            borderRadius: 6,
            padding: "12px",
            maxWidth: "400px",
          },
        };
      },
    }),
  },
});
