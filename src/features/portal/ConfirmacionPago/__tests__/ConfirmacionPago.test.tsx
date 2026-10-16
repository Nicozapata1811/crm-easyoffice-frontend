/** All data here is synthetic. */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarMediosPago } from "../../../../api/portal";
import { obtenerTramite } from "../../../../api/tramites";
import { renderEn } from "../../../backoffice/Clientes/__tests__/renderConSesion";
import { TRAMITE, TRAMITE_A_PAGAR } from "../../../tramites/__tests__/fixtures";
import { pagar } from "../../Pago/checkout";
import { MEDIOS, ORDEN_LISTA } from "../../Pago/__tests__/fixtures";
import { ConfirmacionPago } from "../ConfirmacionPago";

vi.mock("../../../../api/portal", () => ({ listarMediosPago: vi.fn() }));
vi.mock("../../../../api/tramites", () => ({ obtenerTramite: vi.fn() }));
vi.mock("../../Pago/checkout", async (original) => ({
  ...(await original()),
  pagar: vi.fn(),
}));

function renderPago() {
  return renderEn("/tramites/7/pago", [
    { path: "/tramites/:tramiteId/pago", element: <ConfirmacionPago /> },
    { path: "/pagos/:ordenId/:resultado", element: <p>Resultado</p> },
  ]);
}

describe("ConfirmacionPago", () => {
  beforeEach(() => {
    vi.mocked(obtenerTramite).mockResolvedValue(TRAMITE_A_PAGAR);
    vi.mocked(listarMediosPago).mockResolvedValue(MEDIOS);
    vi.mocked(pagar).mockReset();
  });

  it("charges the case's sale: plan plus the signature, labelled as examples", async () => {
    renderPago();

    expect(await screen.findByText("Domicilio tributario · Plan semestral")).toBeInTheDocument();
    expect(screen.getByText("Firma electrónica avanzada")).toBeInTheDocument();
    expect(screen.getByText(/\$44\.990/)).toBeInTheDocument();
    expect(screen.getByText(/Valores de ejemplo/)).toBeInTheDocument();
  });

  it("pays the case's sale with the method the client picks", async () => {
    vi.mocked(pagar).mockResolvedValue(ORDEN_LISTA);
    const user = userEvent.setup();
    renderPago();

    await user.click(await screen.findByRole("radio", { name: /Flow/ }));
    await user.click(screen.getByRole("button", { name: "Pagar y enviar a firma" }));

    expect(pagar).toHaveBeenLastCalledWith(31, "flow", expect.any(Object));
  });

  it("has nothing to pay before the draft is confirmed", async () => {
    vi.mocked(obtenerTramite).mockResolvedValue(TRAMITE);
    renderPago();

    expect(await screen.findByText(/no tiene un pago pendiente/)).toBeInTheDocument();
  });
});
