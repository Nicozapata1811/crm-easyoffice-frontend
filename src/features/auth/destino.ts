/** Only same-origin paths, so ?siguiente= cannot send the user elsewhere. */
export function destinoSeguro(siguiente: string | null, porDefecto: string): string {
  if (siguiente?.startsWith("/") && !siguiente.startsWith("//")) return siguiente;
  return porDefecto;
}
