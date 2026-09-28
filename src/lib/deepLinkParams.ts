/**
 * Query parameters of a deep link from the public website,
 * /{servicio}?plan=&origen=, as specified in the backend's
 * docs/integration/website-contract.md.
 */

import type { Plan } from "../api/catalogo";

export type ParamResult<T> =
  | { kind: "valid"; value: T }
  | { kind: "invalid"; raw: string }
  | { kind: "absent" };

export interface DeepLinkParams {
  plan: ParamResult<Plan>;
  origen: ParamResult<string>;
}

const ORIGEN_PATTERN = /^[a-z0-9_-]{1,50}$/;

export function parseDeepLinkParams(
  params: URLSearchParams,
  planes: readonly Plan[],
): DeepLinkParams {
  return {
    plan: parsePlan(params.get("plan"), planes),
    origen: parseOrigen(params.get("origen")),
  };
}

function parsePlan(raw: string | null, planes: readonly Plan[]): ParamResult<Plan> {
  const value = normalize(raw);
  if (!value) return { kind: "absent" };
  const plan = planes.find((candidato) => candidato.slug === value);
  return plan ? { kind: "valid", value: plan } : { kind: "invalid", raw: value };
}

function parseOrigen(raw: string | null): ParamResult<string> {
  const value = normalize(raw);
  if (!value) return { kind: "absent" };
  return ORIGEN_PATTERN.test(value)
    ? { kind: "valid", value }
    : { kind: "invalid", raw: value };
}

function normalize(raw: string | null): string {
  return (raw ?? "").trim().toLowerCase();
}
