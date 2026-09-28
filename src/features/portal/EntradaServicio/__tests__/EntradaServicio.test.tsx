import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { EntradaServicio } from "../EntradaServicio";

function Destino() {
  const { pathname, search } = useLocation();
  return <p>{`${pathname}${search}`}</p>;
}

function renderAt(url: string) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/" element={<Destino />} />
        <Route path="/tramites/domicilio-tributario/nuevo" element={<Destino />} />
        <Route path="/:servicioSlug" element={<EntradaServicio />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EntradaServicio", () => {
  it("sends a known service to its form, keeping the query string", () => {
    renderAt("/domicilio-tributario?plan=anual&origen=sitio");

    expect(
      screen.getByText("/tramites/domicilio-tributario/nuevo?plan=anual&origen=sitio"),
    ).toBeInTheDocument();
  });

  it("sends an unknown service to the catalogue", () => {
    renderAt("/servicio-que-no-existe?plan=anual");

    expect(screen.getByText("/")).toBeInTheDocument();
  });
});
