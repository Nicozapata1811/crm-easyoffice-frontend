import { render, screen } from "@testing-library/react";
import Button from "@mui/material/Button";
import { ThemeProvider } from "@mui/material/styles";
import { describe, expect, it } from "vitest";

import { EstadoPill, type TonoEstado } from "../components/EstadoPill";
import { theme } from "../theme";

/** WCAG contrast ratio between two colours given as `#RRGGBB` or `rgb(r, g, b)`. */
function contraste(a: string, b: string): number {
  const luminancia = (color: string) => {
    const canales = color.startsWith("#")
      ? [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16))
      : color.match(/\d+/g)!.slice(0, 3).map(Number);
    const [r, g, b] = canales.map((c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

/**
 * A computed colour as `rgb(r, g, b)`. MUI 9 sets button colours through CSS
 * variables, which jsdom does not resolve, so a `var(--x)` is read from the
 * element's own custom property.
 */
function colorDe(estilo: CSSStyleDeclaration, propiedad: "color" | "backgroundColor"): string {
  const valor = estilo[propiedad];
  const variable = valor.match(/^var\((--[\w-]+)\)$/)?.[1];
  const color = variable ? estilo.getPropertyValue(variable).trim() : valor;
  if (!color.startsWith("#")) return color;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

const conTema = (ui: React.ReactNode) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("Easy Office theme (HU-59)", () => {
  it("exposes the brand tokens", () => {
    const { palette, shape, typography } = theme;
    expect(palette.primary).toMatchObject({
      main: "#24D356",
      contrastText: "#1C1C1C",
      strong: "#15803D",
      soft: "#F1FCF4",
    });
    expect(palette.text.primary).toBe("#282828");
    expect(palette.background).toEqual({ default: "#F6F8F7", paper: "#FFFFFF" });
    expect(palette.divider).toBe("#E2E8E4");
    expect(shape.borderRadius).toBe(6);
    expect(typography.fontFamily).toMatch(/^"Albert Sans"/);
    expect(typography.h1.fontFamily).toMatch(/^"Lora"/);
    expect(typography.h2.fontFamily).toMatch(/^"Albert Sans"/);
  });

  it("renders a primary contained button with dark text on the brand green", () => {
    conTema(<Button variant="contained">Pagar</Button>);
    const estilo = getComputedStyle(screen.getByRole("button", { name: "Pagar" }));
    expect(colorDe(estilo, "color")).toBe("rgb(28, 28, 28)");
    expect(colorDe(estilo, "backgroundColor")).toBe("rgb(36, 211, 86)");
  });

  it("uses the text-safe green for a primary text button", () => {
    conTema(<Button>Ingresar</Button>);
    const estilo = getComputedStyle(screen.getByRole("button", { name: "Ingresar" }));
    expect(colorDe(estilo, "color")).toBe("rgb(21, 128, 61)");
  });

  it.each<TonoEstado>(["progreso", "completo", "espera", "alerta", "neutro"])(
    "gives the %s status pill a label and at least 4.5:1",
    (tono) => {
      conTema(<EstadoPill etiqueta={`Estado ${tono}`} tono={tono} />);
      const estilo = getComputedStyle(screen.getByText(`Estado ${tono}`));
      expect(contraste(colorDe(estilo, "color"), colorDe(estilo, "backgroundColor"))).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("keeps every text colour at 4.5:1 or more on the surfaces it is used on", () => {
    const { palette } = theme;
    const fondos = [palette.background.paper, palette.background.default];
    const pares: [string, string][] = [
      [palette.primary.contrastText, palette.primary.main],
      [palette.primary.contrastText, palette.primary.dark],
      [palette.primary.strong, palette.primary.soft],
      [palette.text.primary, palette.primary.soft],
      [palette.warning.strong, palette.background.paper],
      [palette.error.strong, palette.background.paper],
      [palette.success.main, palette.background.paper],
      ...[palette.text.primary, palette.text.secondary, palette.text.hint, palette.primary.strong].flatMap(
        (texto) => fondos.map((fondo): [string, string] => [texto, fondo]),
      ),
      ...[palette.dark.text, palette.dark.done, palette.dark.upcoming].map(
        (texto): [string, string] => [texto, palette.dark.background],
      ),
    ];
    for (const [texto, fondo] of pares) {
      expect(contraste(texto, fondo), `${texto} on ${fondo}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps input outlines at 3:1 against white", () => {
    expect(contraste(theme.palette.inputBorder, theme.palette.background.paper)).toBeGreaterThanOrEqual(3);
  });
});
