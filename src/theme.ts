import { createTheme } from "@mui/material/styles";
import { esES } from "@mui/material/locale";

/** The dark band behind the step indicator (FolioNav). */
interface DarkSurface {
  background: string;
  text: string;
  done: string;
  upcoming: string;
}

declare module "@mui/material/styles" {
  interface PaletteColor {
    /** Tinted background: active nav item, selected option, status pill. */
    soft: string;
    /** Text-safe shade (≥ 4.5:1 on white and on `soft`). */
    strong: string;
  }
  interface SimplePaletteColorOptions {
    soft?: string;
    strong?: string;
  }
  interface TypeText {
    /** Notes and table heads: lighter than `secondary`, still ≥ 4.5:1. */
    hint: string;
  }
  interface Palette {
    neutral: PaletteColor;
    dark: DarkSurface;
    /** Input and radio outlines: 3:1 against white (WCAG 1.4.11). */
    inputBorder: string;
  }
  interface PaletteOptions {
    neutral?: SimplePaletteColorOptions;
    dark?: DarkSurface;
    inputBorder?: string;
  }
}

/**
 * Easy Office brand values (RNF-12, HU-59), taken from the public styles of
 * easyoffice.cl. Components read them through the theme, never from here.
 *
 * ASSUMPTION: pending validation with Easy Office. The official palette and
 * logo (TA-06) are still open; background and border are our proposal.
 */
const marca = {
  verde: "#24D356",
  verdeHover: "#1EBD4C",
  verdeTexto: "#15803D",
  verdeSuave: "#F1FCF4",
  oscuro: "#1C1C1C",
  texto: "#282828",
  textoSecundario: "#5C6560",
  textoNota: "#6B7470",
  textoDeshabilitado: "#8A9099",
  superficie: "#FFFFFF",
  fondo: "#F6F8F7",
  borde: "#E2E8E4",
  bordeCampo: "#8C9590",
  sans: '"Albert Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: '"Lora", Georgia, serif',
} as const;

export const theme = createTheme(
  {
    shape: { borderRadius: 6 },
    palette: {
      // Dark text on the brand green: white on it is 2.0:1.
      primary: {
        main: marca.verde,
        dark: marca.verdeHover,
        contrastText: marca.oscuro,
        soft: marca.verdeSuave,
        strong: marca.verdeTexto,
      },
      success: { main: marca.verdeTexto, soft: "#DCF5E3", strong: "#14532D", contrastText: "#FFFFFF" },
      info: { main: "#1F6FD1", soft: "#E3EEFA", strong: "#1E4E8C" },
      warning: { main: "#B45309", soft: "#FDF0D5", strong: "#7A4204" },
      error: { main: "#B91C1C", soft: "#FCE8E8", strong: "#9F1F1F" },
      neutral: { main: marca.textoSecundario, soft: "#ECEFED", strong: "#454D49", contrastText: "#FFFFFF" },
      background: { default: marca.fondo, paper: marca.superficie },
      divider: marca.borde,
      inputBorder: marca.bordeCampo,
      text: {
        primary: marca.texto,
        secondary: marca.textoSecundario,
        hint: marca.textoNota,
        disabled: marca.textoDeshabilitado,
      },
      dark: { background: marca.oscuro, text: "#FFFFFF", done: "#BDBDBD", upcoming: "#9A9A9A" },
    },
    typography: {
      fontFamily: marca.sans,
      // Lora only for page titles, more compact than on the commercial site.
      h1: { fontFamily: marca.serif, fontWeight: 600, fontSize: 26, lineHeight: 1.25 },
      h2: { fontWeight: 600, fontSize: 17 },
      h3: { fontWeight: 600, fontSize: 16 },
      h6: { fontWeight: 700, fontSize: 17 },
      button: { textTransform: "none", fontWeight: 600, fontSize: 13.5 },
    },
    components: {
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          colorDefault: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }),
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: ({ theme }) => ({
            padding: "11px 22px",
            "&.Mui-focusVisible": {
              outline: `2px solid ${theme.palette.primary.strong}`,
              outlineOffset: 2,
            },
            variants: [
              {
                // Green text on white must be the text-safe shade.
                props: { color: "primary" },
                style: { "--variant-textColor": theme.palette.primary.strong },
              },
            ],
          }),
          outlined: ({ theme }) => ({ borderColor: theme.palette.inputBorder, color: theme.palette.text.primary }),
        },
      },
      MuiLink: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.primary.strong,
            "&:focus-visible": {
              outline: `2px solid ${theme.palette.primary.strong}`,
              outlineOffset: 2,
            },
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            fontSize: 13.5,
            [`&.Mui-focused .MuiOutlinedInput-notchedOutline`]: { borderColor: theme.palette.primary.strong },
          }),
          notchedOutline: ({ theme }) => ({ borderColor: theme.palette.inputBorder }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({ borderColor: theme.palette.divider }),
          head: ({ theme }) => ({
            fontSize: 11.5,
            color: theme.palette.text.hint,
            fontWeight: 600,
            borderBottomColor: theme.palette.inputBorder,
          }),
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: ({ theme }) => ({ backgroundColor: theme.palette.primary.soft }),
          bar: ({ theme }) => ({ backgroundColor: theme.palette.primary.strong }),
        },
      },
    },
  },
  esES,
);
