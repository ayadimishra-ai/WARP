import { MantineThemeOverride } from "@mantine/core";

const theme: MantineThemeOverride = {
  fontFamily: "Euclid Circular B",
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
  },
  colors: {
    questionSucces: ["#e3fff3"],
    questionWarning: ["#fff0ce"],
    orange: [
      "#fff4e5",
      "#fff0ce",
      "#ffdeb3",
      "#ffb34d",
      "#ff9d1a",
      "#ff9e1b",
      "#ffa93c",
      "#fc960c",
      "#ff9e1b",
      "#ff9e1b",
    ],
    // skyblue: [
    //   "#72D0C6",
    //   "#72D0C6",
    //   "#72D0C6",
    //   "#72D0C6",
    //   "#72D0C6",
    //   "#72D0C6",
    //   "#72D0C6",
    //   "#72D0C6",
    //   "#72D0C6",
    //   "#72D0C6",
    // ],
    skyblue: [
      "#038FC7", //Input,Select base border outline
      "#038FC7", //Active font color
      "#005C81", //Search box border
      "#038FC7", //Active and focus background
      "#038FC7",
      "#038FC7",
      "#005C81",
      "#005C81",
      "#D6F3FF",
      "#D6F3FF",
    ],

    darkNavy: [
      "#003B52",
      "#003B52",
      "#003B52",
      "#003B52",
      "#003B52",
      "#003B52",
      "#005C81",
      "#d6f3ff",
      "#038fc7",
      "#038fc7",
    ],
    darkColor: ["#666666"],
    radioCheckBoxError: ["#FC4E4E"],
    radioCheckBoxNormal: ["#005C81"],
  },
  primaryColor: "darkNavy",
  components: {
    Button: {
      styles: (theme, props) => {
        let background = "";
        let hoverBackgroundColor = "";
        let hoverTextColor = "";
        let color = "";
        let border = "";
        let hoverBorder = "";
        let activeBackgroundColor = "";

        if (props.color === "solidBtn") {
          background = "linear-gradient(94.76deg, #005c81 0.57%, #122f47 95%)";
          activeBackgroundColor = theme.colors.darkNavy[0];
          hoverBackgroundColor =
            "linear-gradient(94.76deg, #005C81 54.87%, #0F3751 87.92%, #122F47 95%)";
          color = "#fff";
        } else if (props.color === "outlineBtn") {
          background = "#fff";
          color = theme.colors.darkNavy[0];
          border = `1px solid ${theme.colors.darkNavy[0]}`;
          hoverBorder = `1px solid ${theme.colors.skyblue[2]}`;
          hoverBackgroundColor = "#fff";
          hoverTextColor = "#005C81";
          activeBackgroundColor = "#D9D9D9";
        } else if (props.color === "third_btn") {
          background = "#003B52";
          hoverBackgroundColor = "#003B52";
          hoverTextColor = "#003B52";
        } else if (props.color === "fourth_btn") {
          background = "#fff";
          color = theme.colors.darkColor[0];
          border = `1px solid ${theme.colors.darkColor[0]}`;
          hoverBackgroundColor = theme.colors.darkColor[0];
          hoverTextColor = "#fff";
        } else if (props.color === "aiGradientBtn") {
          background =
            "linear-gradient(var(--bg-angle,270.44deg), #f9daff 6.66%, #daf1ff 96.23%) padding-box, linear-gradient(var(--border-angle,270.44deg), #00a7e3 0.03%, #dcb2ff 52.88%, #ae41f6 99.96%) border-box";
          color = "#ae41f6";
          border = "1px solid transparent";
        } else if (props.color === "errorBtn") {
          background = "linear-gradient(94.76deg, #B00A0A 0.57%, #741416 95%)";
          activeBackgroundColor = "#B00A0A";
          hoverBackgroundColor = "linear-gradient(94.76deg, #B00A0A 54.87%, #8B0F11 87.92%, #741416 95%)";
          color = "#fff";
        }

        return {
          root: {
            borderRadius: 20,
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: "12px",
            background: background,
            color: color,
            border: border,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            "&:active": {
              background: activeBackgroundColor + "!important",
            },
            "&:hover": {
              background: hoverBackgroundColor,
              color: hoverTextColor,
              border: hoverBorder,
            },
            animation:
              props.color === "aiGradientBtn"
                ? "rotateGradient 9s linear infinite"
                : undefined,
            // For the animated gradient text
            ".mantine-Button-label":
              props.color === "aiGradientBtn"
                ? {
                  background:
                    "linear-gradient(270.44deg, #00a7e3 0.03%, #ae41f6 99.96%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }
                : undefined,
            "@keyframes rotateGradient": {
              "0%": { "--bg-angle": "0deg", "--border-angle": "0deg" },
              "5%": { "--bg-angle": "18deg", "--border-angle": "18deg" },
              "10%": { "--bg-angle": "36deg", "--border-angle": "36deg" },
              "15%": { "--bg-angle": "54deg", "--border-angle": "54deg" },
              "20%": { "--bg-angle": "72deg", "--border-angle": "72deg" },
              "25%": { "--bg-angle": "90deg", "--border-angle": "90deg" },
              "30%": { "--bg-angle": "108deg", "--border-angle": "108deg" },
              "35%": { "--bg-angle": "126deg", "--border-angle": "126deg" },
              "40%": { "--bg-angle": "144deg", "--border-angle": "144deg" },
              "45%": { "--bg-angle": "162deg", "--border-angle": "162deg" },
              "50%": { "--bg-angle": "180deg", "--border-angle": "180deg" },
              "55%": { "--bg-angle": "198deg", "--border-angle": "198deg" },
              "60%": { "--bg-angle": "216deg", "--border-angle": "216deg" },
              "65%": { "--bg-angle": "234deg", "--border-angle": "234deg" },
              "70%": { "--bg-angle": "252deg", "--border-angle": "252deg" },
              "75%": { "--bg-angle": "270deg", "--border-angle": "270deg" },
              "80%": { "--bg-angle": "288deg", "--border-angle": "288deg" },
              "85%": { "--bg-angle": "306deg", "--border-angle": "306deg" },
              "90%": { "--bg-angle": "324deg", "--border-angle": "324deg" },
              "95%": { "--bg-angle": "342deg", "--border-angle": "342deg" },
              "100%": { "--bg-angle": "360deg", "--border-angle": "360deg" },
            },
            "&:disabled": {
              background: "#EBF0F5 !important",
              color: "#9FA8B0 !important",
              border: "none !important",
            },
          },
        };
      },
    },
    Input: {
      styles: (theme, props) => ({
        input: {
          minHeight: 36,
          borderRadius: 4,
          padding: "0px 12px",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "22px",
          background: "",
          color: "#212529",
          borderColor: "#ced4da !important",
          outline: "none",
          "&:focus-within": {
            borderColor: "#038FC7 !important",
          },
          "&:disabled": {
            background: "#E4E9EE !important",
            color: "#9FA8B0 !important",
            borderColor: "#CED4DA !important",
            cursor: "not-allowed",
          },
          "&:[type=radio]": {
            borderColor: "#cdcdcd !important",
            background: "transparent !important",
          },
          "[type=radio]:checked": {
            borderColor: "#005c81 !important",
            background: "transparent !important",
          },
          "[type=checkbox]:checked": {
            borderColor: "#005c81 !important",
            background: "transparent !important",
          },
        },
      }),
    },
    Textarea: {
      styles: (theme, props) => ({
        input: {
          height: 75,
          borderRadius: 4,
          padding: "0px 12px",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "22px",
          background: "",
          color: "#495057",
          borderColor: "#ced4da !important",
          outline: "none",
          "&:focus-within": {
            borderColor: "#038FC7 !important",
          },
          "&:disabled": {
            background: "#E4E9EE !important",
            color: "#b2bbc3 !important",
            borderColor: "#D5DCE1 !important",
            cursor: "not-allowed",
          },
          "&:[type=radio]": {
            borderColor: "#cdcdcd !important",
            background: "transparent !important",
          },
          "[type=radio]:checked": {
            borderColor: "#005c81 !important",
            background: "transparent !important",
          },
          "[type=checkbox]:checked": {
            borderColor: "#005c81 !important",
            background: "transparent !important",
          },
        },
      }),
    },
    Select: {
      styles: (theme, params) => {
        return {
          input: {
            minHeight: 36,
            borderRadius: 4,
            padding: "0px 12px",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "22px",
            background: "",
            color: "#495057",
            borderColor: "#ced4da !important",
            outline: "none",
            paddingRight: 20,
            "&:focus-within": {
              borderColor: "#038FC7 !important",
            },
            "&:disabled": {
              background: "#E4E9EE !important",
              color: "#9FA8B0 !important",
              borderColor: "#D5DCE1 !important",
              cursor: "not-allowed",
            },
            "&:[type=radio]": {
              borderColor: "#cdcdcd !important",
              background: "transparent !important",
            },
            "[type=radio]:checked": {
              borderColor: "#005c81 !important",
              background: "transparent !important",
            },
            "[type=checkbox]:checked": {
              borderColor: "#005c81 !important",
              background: "transparent !important",
            },
          },
          item: {
            display: "flex",
            alignItems: "center",
            backgroundColor: "#fff",
            marginBottom: 4,
            //minHeight: 38,
            "&:hover": {
              backgroundColor: "#F8F9FA",
            },
            "&[data-selected]": {
              backgroundColor: "#D6F3FF",
              color: "#038FC7",
            },
          },
          dropdown: {
            border: "1px solid #CED4DA",
            borderRadius: "2px",
            marginTop: "-5px",
            boxShadow: "0px 10px 15px -5px rgba(0, 0, 0, 0.05);",
          },
        };
      },
    },
    MultiSelect: {
      styles: (theme, params) => {
        return {
          input: {
            minHeight: 36,
            borderRadius: 4,
            padding: "0px 12px",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "22px",
            background: "",
            color: "#495057",
            borderColor: "##038FC7 !important",
            outline: "none",
            paddingRight: 20,
            "&:focus-within": {
              borderColor: "#038FC7 !important",
            },
            "&:disabled": {
              background: "#E4E9EE !important",
              color: "#9FA8B0 !important",
              borderColor: "#CED4DA !important",
              cursor: "not-allowed",
            },
            "&:[type=radio]": {
              borderColor: "#cdcdcd !important",
              background: "transparent !important",
            },
            "[type=radio]:checked": {
              borderColor: "#005c81 !important",
              background: "transparent !important",
            },
            "[type=checkbox]:checked": {
              borderColor: "#005c81 !important",
              background: "transparent !important",
            },
          },
          item: {
            display: "flex",
            alignItems: "center",
            backgroundColor: "#fff",
            marginBottom: 4,
            minHeight: 38,
            "&:hover": {
              backgroundColor: "#F8F9FA",
            },
            "&[data-selected]": {
              backgroundColor: "#D6F3FF",
              color: "#038FC7",
            },
          },
          dropdown: {
            border: "1px solid #CED4DA",
            borderRadius: "2px",
            marginTop: "-5px",
            boxShadow: "0px 10px 15px -5px rgba(0, 0, 0, 0.05);",
          },
        };
      },
    },
    Autocomplete: {
      styles: (theme, props) => ({
        input: {
          minHeight: 36,
          borderRadius: 4,
          padding: "0px 12px",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "22px",
          background: "",
          color: "#495057",
          borderColor: "#ced4da !important",
          outline: "none",
          paddingRight: 20,
          "&:focus-within": {
            borderColor: "#038FC7 !important",
            background: "#fff !important",
          },
          "&:disabled": {
            background: "#ffffff !important",
            color: "#222222 !important",
            borderColor: "#D5DCE1 !important",
            cursor: "not-allowed",
          },
          "&:[type=radio]": {
            borderColor: "#cdcdcd !important",
            background: "transparent !important",
          },
          "[type=radio]:checked": {
            borderColor: "#005c81 !important",
            background: "transparent !important",
          },
          "[type=checkbox]:checked": {
            borderColor: "#005c81 !important",
            background: "transparent !important",
          },
        },
        item: {
          display: "flex",
          alignItems: "center",
          backgroundColor: "#fff",
          marginBottom: 4,
          minHeight: 38,
          "&:hover": {
            backgroundColor: "#F8F9FA",
          },
          "&[data-selected]": {
            backgroundColor: "#D6F3FF",
            color: "#038FC7",
          },
        },
      }),
    },
    Radio: {
      styles: (theme, props) => ({
        radio: {
          borderRadius: 20,
          padding: "8px",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "22px",
          background: "",
          color: "#cdcdcd",
          borderColor: "#ADB5BD",
          border: "2px solid",
          outline: "none",
          "&:hover": {
            //color: "#005c81 !important",
            border: "2px solid #005c81",
          },
          "&:checked": {
            borderColor: "#005c81 !important",
            background: "#ffffff !important",
          },
          "&:disabled": {
            background: "#ccd6da !important",
            borderColor: "#adb5bd !important",
            cursor: "not-allowed",
          },
        },
      }),
    },
    // for check box
    Checkbox: {
      styles: (theme, props) => ({
        input: {
          //borderRadius: theme.radius.sm, // You can set the border-radius here
          outline: "none",
          cursor: "pointer",
          "&:hover": {
            border: "1px solid #42af8e",
          },
          "&:checked": {
            borderColor: "#42af8e",
            background: "#42af8e",
          },
          "&:disabled": {
            background: "#CCD6DA",
            borderColor: "#ADB5BD",
            cursor: "not-allowed",
          },
        },
        label: {
          //color: "#333", // Adjust label color
          cursor: "pointer",
        },
      }),
    },
    Switch: {
      styles: (theme, props) => ({
        thumb: {
          width: 19,
          height: 18,
          left: 0,
          border: "1px solid #fff",
        },
        track: {
          backgroundColor: "#95A8B0 !important",
          borderColor: "#95A8B0",
          cursor: "pointer",
          width: 40,
          // "&:hover": {
          //   borderColor: "#005C81",
          //   backgroundColor: "transparent",
          //   "& .mantine-Switch-thumb": {
          //     borderColor: "#005C81",
          //   },
          // },
        },
        input: {
          "&:checked": {
            "& + .mantine-Switch-track": {
              backgroundColor: "#005C81 !important",
            },
            "& + .mantine-Switch-track .mantine-Switch-thumb": {
              left: 21,
            },
          },
        },
      }),
    },
    Tooltip: {
      styles: (theme, params) => {
        return {
          tooltip: {
            background: "#003B52",
            fontSize: 12,
            color: "#fff",
            lineHeight: "16px",
            borderRadius: 6,
            padding: "10px 12px",
            maxWidth: "700px",
          },
        };
      },
    },
  },
};
export default theme;
