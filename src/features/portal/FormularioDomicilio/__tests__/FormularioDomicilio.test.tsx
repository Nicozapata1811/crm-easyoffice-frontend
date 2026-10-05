import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RESPUESTA_CATALOGO } from "../../../../api/__tests__/catalogoFixture";
import { FormularioDomicilio } from "../FormularioDomicilio";

function renderAt(url: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <FormularioDomicilio />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function radio(nombre: RegExp) {
  return screen.findByRole("radio", { name: nombre });
}

describe("FormularioDomicilio plan selection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(RESPUESTA_CATALOGO, { headers: { "content-type": "application/json" } }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("preselects the plan from a valid deep link", async () => {
    renderAt("/tramites/domicilio-tributario/nuevo?plan=semestral&origen=sitio");

    expect(await radio(/Semestral/)).toBeChecked();
    expect(await radio(/Anual/)).not.toBeChecked();
  });

  it.each(["?plan=trimestral", "", "?plan="])(
    "shows the selector with nothing chosen for %j",
    async (query) => {
      renderAt(`/tramites/domicilio-tributario/nuevo${query}`);

      expect(await radio(/Anual/)).not.toBeChecked();
      expect(await radio(/Semestral/)).not.toBeChecked();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );

  it("marks prices as reference values", async () => {
    renderAt("/tramites/domicilio-tributario/nuevo");

    expect(await radio(/Anual · 12 meses · \$59\.990 \(precio referencial\)/)).toBeInTheDocument();
  });
});
