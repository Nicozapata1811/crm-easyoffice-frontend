const cargas = new Map<string, Promise<void>>();

/** Load an external script once; later calls for the same URL share the load. */
export function cargarScript(src: string): Promise<void> {
  const existente = cargas.get(src);
  if (existente) return existente;

  const carga = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      cargas.delete(src);
      script.remove();
      reject(new Error(`No se pudo cargar ${src}`));
    };
    document.head.appendChild(script);
  });
  cargas.set(src, carga);
  return carga;
}
