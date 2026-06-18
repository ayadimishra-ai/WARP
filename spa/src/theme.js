import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
    overrides: {
        MuiTooltip: {
            popper: {
                opacity: 1
            },
            tooltip: {
                backgroundColor: "#003B52",
                fontSize: "12px",
                color: "#fff",
                lineHeight: "16px",
                borderRadius: "6px",
                padding: "10px 12px",
                maxWidth: "400px",
                margin: '0px !important'
            },
        },
        // MuiPopover: {
        //     paper: {
        //         backgroundColor: "#003B52",
        //         fontSize: "12px",
        //         color: "#fff",
        //         lineHeight: "16px",
        //         borderRadius: "6px",
        //         padding: "10px 12px",
        //         maxWidth: "400px",
        //         margin: '0px !important',
        //         color: '#fff'
        //     }
        // }
    },
});

export default theme;