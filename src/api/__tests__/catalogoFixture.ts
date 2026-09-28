/** Catalogue response as the backend serves it. Prices are example values. */

export const RESPUESTA_CATALOGO = {
  servicios: [
    {
      slug: "domicilio-tributario",
      nombre: "Domicilio tributario",
      planes: [
        {
          slug: "anual",
          nombre: "Anual",
          meses: 12,
          precio: 59990,
          moneda: "CLP",
          precio_confirmado: false,
          enlace: "http://tramites.example.test/domicilio-tributario?plan=anual&origen=sitio",
        },
        {
          slug: "semestral",
          nombre: "Semestral",
          meses: 6,
          precio: 39990,
          moneda: "CLP",
          precio_confirmado: false,
          enlace: "http://tramites.example.test/domicilio-tributario?plan=semestral&origen=sitio",
        },
      ],
    },
  ],
};
