import { createTheme } from "@mui/material/styles";
import { esES } from "@mui/material/locale";

/** Design tokens from the Easy Office prototype. */
export const tokens = {
  bg: "#F1F2ED",
  surface: "#FFFFFF",
  ink: "#182233",
  inkSoft: "#5B6472",
  inkFaint: "#8A9099",
  primary: "#1F4C3D",
  primaryDark: "#123027",
  primaryTint: "#E4ECE7",
  stamp: "#A24328",
  stampTint: "#F3E4DE",
  gold: "#AD8A34",
  goldTint: "#F2ECDA",
  border: "#DBDCD4",
  borderStrong: "#C3C5BB",
  success: "#2F7D4F",
  serif: '"Source Serif 4", Georgia, serif',
  sans: '"Inter", -apple-system, sans-serif',
} as const;

export const theme = createTheme(
  {
    shape: { borderRadius: 3 },
    palette: {
      background: { default: tokens.bg, paper: tokens.surface },
      primary: { main: tokens.primary, dark: tokens.primaryDark, light: tokens.primaryTint },
      success: { main: tokens.success },
      warning: { main: tokens.gold },
      error: { main: tokens.stamp },
      divider: tokens.border,
      text: { primary: tokens.ink, secondary: tokens.inkSoft, disabled: tokens.inkFaint },
    },
    typography: {
      fontFamily: tokens.sans,
      h1: { fontFamily: tokens.serif, fontWeight: 600, fontSize: 27, color: tokens.primaryDark },
      h2: { fontFamily: tokens.serif, fontWeight: 600, fontSize: 17 },
      h3: { fontFamily: tokens.serif, fontWeight: 600, fontSize: 16.5 },
      button: { textTransform: "none", fontWeight: 600, fontSize: 13.5 },
    },
    components: {
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { border: `1px solid ${tokens.border}`, borderRadius: 6 },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { padding: "11px 22px" },
          outlined: { borderColor: tokens.borderStrong, color: tokens.ink },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { backgroundColor: tokens.surface, fontSize: 13.5 },
          notchedOutline: { borderColor: tokens.borderStrong },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: tokens.border },
          head: { fontSize: 11.5, color: tokens.inkFaint, fontWeight: 600, borderBottomColor: tokens.borderStrong },
        },
      },
    },
  },
  esES,
);
