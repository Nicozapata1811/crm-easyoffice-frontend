/** All data here is synthetic. */

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../../../api/auth";
import { listarVentasBackoffice } from "../../../../api/ventas";
import { RequirePermission } from "../../../../routes/RequirePermission";
import { PERMISOS } from "../../../auth/permisos";
import { EJECUTIVO, renderEn } from "../../Clientes/__tests__/renderConSesion";
import { ListaVentas } from "../ListaVentas";

vi.mock("../../../../api/auth", () => ({ getSesion: vi.fn() }));
vi.mock("../../../../api/ventas", () => ({ listarVentasBackoffice: vi.fn() }));

const rutas = [
  {
    path: "/backoffice/ventas",
    element: (
      <RequirePermission permiso={PERMISOS.verVentas}>
        <ListaVentas />
      </RequirePermission>
    ),
  },
];

describe("ListaVentas", () => {
  beforeEach(() => {
    vi.mocked(listarVentasBackoffice).mockReset();
    vi.mocked(listarVentasBackoffice).mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 9,
          folio: "VEN-000009",
          estado: "pagada",
          total: "18400",
          pagada_en: "2026-10-10T12:05:00Z",
          created_at: "2026-10-10T12:00:00Z",
          items: [],
          cliente: { id: 7, folio: "CLI-000007", nombre: "Camila Soto" },
          ordenes: [],
        },
      ],
    });
  });

  it("lists sales for staff who may see them", async () => {
    vi.mocked(getSesion).mockResolvedValue({ ...EJECUTIVO, permisos: [PERMISOS.verVentas] });
    renderEn("/backoffice/ventas", rutas);

    expect(await screen.findByText("VEN-000009")).toBeInTheDocument();
    expect(screen.getByText("Camila Soto")).toBeInTheDocument();
    expect(screen.getByText("Pagada")).toBeInTheDocument();
  });

  it("is hidden from staff without the permission", async () => {
    vi.mocked(getSesion).mockResolvedValue(EJECUTIVO);
    renderEn("/backoffice/ventas", rutas);

    expect(await screen.findByText("Sin acceso")).toBeInTheDocument();
    expect(listarVentasBackoffice).not.toHaveBeenCalled();
  });
});
