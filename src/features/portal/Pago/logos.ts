/**
 * Official provider logos, served from public/medios-pago/. Heights differ
 * because Klap's PNG has wide margins and Flow's SVG has none.
 */
export const LOGO_MEDIO_PAGO: Record<string, { src: string; alto: number }> = {
  klap: { src: "/medios-pago/klap.png", alto: 36 },
  flow: { src: "/medios-pago/flow.svg", alto: 26 },
};
