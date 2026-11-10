/** All data here is synthetic. */

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../../../../api/client";
import { listarClientes } from "../../../../../api/clientes";
import {
  buscarPersona,
  crearTramiteBackoffice,
  editarTramiteBackoffice,
  listarTiposIniciables,
  obtenerFormularioTramite,
  obtenerTramiteBackoffice,
} from "../../../../../api/tramites";
import {
  FORMULARIO_VEHICULO,
  SOLICITUD_VEHICULO,
  TRAMITE_VEHICULO,
} from "../../../../tramites/__tests__/fixtures";
import { renderEn } from "../../../Clientes/__tests__/renderConSesion";
import { NuevoTramite } from "../../NuevoTramite";
import { aSolicitudVehiculo, crearVehiculoSchema, normalizarPatente, valoresIniciales } from "../schema";

vi.mock("../../../../../api/clientes", () => ({ listarClientes: vi.fn() }));
vi.mock("../../../../../api/tramites", () => ({
  obtenerFormularioTramite: vi.fn(),
  obtenerTramiteBackoffice: vi.fn(),
  crearTramiteBackoffice: vi.fn(),
  editarTramiteBackoffice: vi.fn(),
  listarTiposIniciables: vi.fn(),
  buscarPersona: vi.fn(),
}));

const EMPRESA = {
  id: 41,
  folio: "CLI-000041",
  tipo: "empresa" as const,
  rut: "76543210-3",
  nombre: "Comercial Ficticia del Sur SpA",
  email: "contacto@empresa-ficticia.example",
  telefono: "",
  activo: true,
  created_at: "2026-10-01T10:00:00-03:00",
};

const ARRENDADOR = SOLICITUD_VEHICULO.arrendador;

function renderNuevo(ruta = "/backoffice/tramites/nuevo/arriendo-vehiculo") {
  return renderEn(ruta, [
    { path: "/backoffice/tramites/nuevo/:tipo", element: <NuevoTramite /> },
    { path: "/backoffice/tramites/:tramiteId/editar", element: <NuevoTramite /> },
    { path: "/backoffice/tramites/:tramiteId", element: <p>Detalle</p> },
  ]);
}

async function abrirFormulario(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: /Comercial Ficticia del Sur SpA/ }));
  await screen.findByRole("heading", { name: "Arriendo de vehículo" });
}

/** The owner's block: its field labels repeat the representative's. */
const arrendador = () => within(screen.getByRole("group", { name: "Arrendador" }));

async function escribir(
  user: ReturnType<typeof userEvent.setup>,
  etiqueta: string | RegExp,
  valor: string,
  donde: Pick<typeof screen, "getByLabelText"> = screen,
) {
  const campo = donde.getByLabelText(etiqueta);
  await user.clear(campo);
  await user.type(campo, valor);
}

/** Fill everything the client's records do not hold. */
async function completar(user: ReturnType<typeof userEvent.setup>) {
  await escribir(user, "Correo del representante", SOLICITUD_VEHICULO.representante.email);
  await escribir(user, "Domicilio de la empresa", SOLICITUD_VEHICULO.domicilio_empresa);
  const bloque = arrendador();
  await escribir(user, "RUT", ARRENDADOR.rut, bloque);
  await user.tab();
  await screen.findByText(/No está registrada/);
  await escribir(user, "Nombres", ARRENDADOR.nombres, bloque);
  await escribir(user, "Apellido paterno", ARRENDADOR.apellido_paterno, bloque);
  await escribir(user, "Apellido materno", ARRENDADOR.apellido_materno, bloque);
  await escribir(user, "Domicilio", ARRENDADOR.domicilio, bloque);
  await escribir(user, "Comuna", ARRENDADOR.comuna, bloque);
  await escribir(user, "Correo electrónico", ARRENDADOR.email, bloque);
  await escribir(user, "Marca", "Marca Ficticia");
  await escribir(user, "Modelo", "Modelo X");
  await escribir(user, "Año", "2021");
  await escribir(user, "Color", "Blanco");
  await escribir(user, "Patente", "bb-df 12");
  await escribir(user, "VIN o número de chasis", "9bwzzz377vt004251");
  await escribir(user, "Renta mensual", "250000");
  await user.type(screen.getByLabelText("Comuna", { selector: "[name=comuna]" }), "Santiago");
  const inicio = screen.getByLabelText("Inicio del arriendo");
  await user.clear(inicio);
  await user.type(inicio, "2026-10-02");
}

describe("FormularioVehiculo (PLT-03)", () => {
  beforeEach(() => {
    vi.mocked(listarClientes).mockResolvedValue({ count: 1, next: null, previous: null, results: [EMPRESA] });
    vi.mocked(listarTiposIniciables).mockResolvedValue([
      { codigo: "arriendo-vehiculo", nombre: "Arriendo de vehículo", tipos_cliente: ["empresa"], formulario: "PLT-03" },
    ]);
    vi.mocked(obtenerFormularioTramite).mockResolvedValue(FORMULARIO_VEHICULO);
    vi.mocked(buscarPersona).mockReset();
    vi.mocked(buscarPersona).mockResolvedValue(null);
    vi.mocked(crearTramiteBackoffice).mockReset();
    vi.mocked(editarTramiteBackoffice).mockReset();
  });

  it("draws the type's own form, pre-filled, with the price split and no contract choices", async () => {
    const user = userEvent.setup();
    renderNuevo();
    await abrirFormulario(user);

    expect(listarClientes).toHaveBeenCalledWith(expect.objectContaining({ tipo: "empresa" }), expect.anything());
    expect(screen.getByLabelText("Razón social")).toHaveValue("Comercial Ficticia del Sur SpA");
    expect(screen.getByLabelText("RUT del representante")).toHaveValue("12345678-5");
    expect(screen.queryByText("Contacto para notificaciones")).not.toBeInTheDocument();
    expect(screen.queryByText("Contratación")).not.toBeInTheDocument();
    expect(screen.getByText("Neto").nextSibling).toHaveTextContent("$30.000");
    expect(screen.getByText("IVA (19 %)").nextSibling).toHaveTextContent("$5.700");
    expect(screen.getByText("Total").nextSibling).toHaveTextContent("$35.700");
    expect(screen.getByText(/Valor referencial, por confirmar/)).toBeInTheDocument();
  });

  it("generates nothing while the owner, the vehicle or the rent is missing or wrong", async () => {
    const user = userEvent.setup();
    renderNuevo();
    await abrirFormulario(user);
    await escribir(user, "RUT", "32333444-0", arrendador());
    await escribir(user, "Patente", "123ABC");
    await escribir(user, "Año", "1800");

    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(await screen.findByText(/dígito verificador no calza/)).toBeInTheDocument();
    expect(screen.getByText(/Escribe una patente chilena/)).toBeInTheDocument();
    expect(screen.getByText(/Indica el año, entre 1900 y 2027/)).toBeInTheDocument();
    expect(screen.getByText("Falta la marca.")).toBeInTheDocument();
    expect(screen.getByText(/Indica la renta mensual/)).toBeInTheDocument();
    expect(screen.getByText("Falta el domicilio de la empresa.")).toBeInTheDocument();
    expect(buscarPersona).not.toHaveBeenCalled();
    expect(crearTramiteBackoffice).not.toHaveBeenCalled();
  });

  it("sends the lease as the API expects it and goes to the case", async () => {
    vi.mocked(crearTramiteBackoffice).mockResolvedValue(TRAMITE_VEHICULO);
    const user = userEvent.setup();
    renderNuevo();
    await abrirFormulario(user);
    await completar(user);

    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(await screen.findByText("Detalle")).toBeInTheDocument();
    expect(crearTramiteBackoffice).toHaveBeenCalledWith({
      ...SOLICITUD_VEHICULO,
      tipo: "arriendo-vehiculo",
      cliente: 41,
    });
  }, 30_000);

  it("fills the owner from the record when the RUT is already a person", async () => {
    vi.mocked(buscarPersona).mockResolvedValue({
      ...ARRENDADOR,
      nacionalidad: "",
      estado_civil: "",
      profesion: "",
      region: "",
      email: "",
    });
    const user = userEvent.setup();
    renderNuevo();
    await abrirFormulario(user);
    const bloque = arrendador();
    await escribir(user, "Correo electrónico", "escrito@persona-ficticia.example", bloque);

    await escribir(user, "RUT", ARRENDADOR.rut, bloque);
    await user.tab();

    expect(await screen.findByText(/ya está registrada/)).toBeInTheDocument();
    expect(buscarPersona).toHaveBeenCalledWith("32333444-7");
    expect(bloque.getByLabelText("Nombres")).toHaveValue("Rodrigo Ignacio");
    expect(bloque.getByLabelText("Domicilio")).toHaveValue("Avenida Imaginaria 456");
    // The record has no email: what was typed stays.
    expect(bloque.getByLabelText("Correo electrónico")).toHaveValue("escrito@persona-ficticia.example");
  });

  it("copies the legal representative as the owner", async () => {
    const user = userEvent.setup();
    renderNuevo();
    await abrirFormulario(user);

    await user.click(screen.getByRole("button", { name: "El dueño es el representante legal" }));

    const bloque = arrendador();
    expect(bloque.getByLabelText("RUT")).toHaveValue("12345678-5");
    expect(bloque.getByLabelText("Nombres")).toHaveValue(
      (screen.getAllByLabelText("Nombres")[0] as HTMLInputElement).value,
    );
    expect(bloque.getByLabelText("Domicilio")).toHaveValue(
      (screen.getByLabelText("Domicilio particular") as HTMLInputElement).value,
    );
  });

  it("asks for the other payment method when it is not a transfer", async () => {
    const user = userEvent.setup();
    renderNuevo();
    await abrirFormulario(user);

    await user.click(screen.getByLabelText("Medio de pago"));
    await user.click(await screen.findByRole("option", { name: "Otro medio" }));
    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(await screen.findByText("Escribe el medio de pago.")).toBeInTheDocument();
  });

  it("shows the backend's error on the owner's field", async () => {
    vi.mocked(crearTramiteBackoffice).mockRejectedValue(
      new ApiError(400, { arrendador: { domicilio: ["Esta persona ya está registrada con otro dato."] } }, "400"),
    );
    const user = userEvent.setup();
    renderNuevo();
    await abrirFormulario(user);
    await completar(user);

    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(await screen.findByText("Esta persona ya está registrada con otro dato.")).toBeInTheDocument();
    expect(screen.getByText("Revisa los campos marcados.")).toBeInTheDocument();
  }, 30_000);

  it("edits a saved lease from the case's own values", async () => {
    vi.mocked(obtenerTramiteBackoffice).mockResolvedValue(TRAMITE_VEHICULO);
    vi.mocked(editarTramiteBackoffice).mockResolvedValue(TRAMITE_VEHICULO);
    const user = userEvent.setup();
    renderNuevo("/backoffice/tramites/12/editar");

    expect(await screen.findByRole("heading", { name: "Editar trámite TRA-000012" })).toBeInTheDocument();
    expect(obtenerFormularioTramite).toHaveBeenCalledWith("arriendo-vehiculo", 4, expect.anything());
    expect(screen.getByLabelText("Patente")).toHaveValue("BBDF12");
    expect(arrendador().getByLabelText("RUT")).toHaveValue("32333444-7");
    await escribir(user, "Renta mensual", "300000");
    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    await waitFor(() =>
      expect(editarTramiteBackoffice).toHaveBeenCalledWith(12, { ...SOLICITUD_VEHICULO, renta: 300000 }),
    );
  });
});

describe("vehicle lease schema", () => {
  const schema = crearVehiculoSchema("2026-10-16");
  const validos = valoresIniciales(FORMULARIO_VEHICULO, TRAMITE_VEHICULO);

  it("accepts a saved lease and returns the API's payload", () => {
    expect(aSolicitudVehiculo(schema.parse(validos))).toEqual(SOLICITUD_VEHICULO);
  });

  it.each([
    ["BBDF12", "BBDF12"],
    ["ab-12.34", "AB1234"],
    ["bbd 12", "BBD12"],
  ])("normalises the plate %s", (escrita, guardada) => {
    expect(normalizarPatente(escrita)).toBe(guardada);
    expect(schema.parse({ ...validos, vehiculo: { ...validos.vehiculo, patente: escrita } }).vehiculo.patente).toBe(
      guardada,
    );
  });

  it.each([
    [{ fecha: "2026-10-17" }, "fecha"],
    [{ plazo_meses: "0" }, "plazo_meses"],
    [{ plazo_meses: "100" }, "plazo_meses"],
    [{ dia_pago: "29" }, "dia_pago"],
    [{ renta: "25.000" }, "renta"],
    [{ medio_pago: "otro" as const, medio_pago_otro: " " }, "medio_pago_otro"],
    [{ vehiculo: { ...validos.vehiculo, vin: "abc" } }, "vehiculo.vin"],
    [{ arrendador: { ...validos.arrendador, email: "sin-arroba" } }, "arrendador.email"],
  ])("refuses %o", (cambio, campo) => {
    const resultado = schema.safeParse({ ...validos, ...cambio });

    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues.map((issue) => issue.path.join("."))).toContain(campo);
  });
});
