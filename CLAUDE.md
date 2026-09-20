# CLAUDE.md — CRM Easy Office · Frontend

Context file for Claude Code. Read this before touching anything.

---

## What this project is

The React frontend for **CRM Easy Office**, a platform built for a Chilean
company that provides business formalisation services — tax domicile contracts,
sworn statements, lease agreements — to entrepreneurs and small companies.

Today the company runs this by hand: clients send their details over WhatsApp, an
executive retypes them into a template, generates the document, sends a draft
back, waits for confirmation, and then signs in batches. Three to four hours per
service, most of it waiting.

This frontend serves two distinct audiences:

- **Client portal** — self-service. The user is an entrepreneur who does not know
  the procedure. If the form does not guide them, the process falls back into an
  executive's hands and the whole project fails at its purpose.
- **Backoffice** — Easy Office staff: executives, supervisors, administrators.

**Academic context.** Capstone project (Duoc UC, Ingeniería en Informática,
PTY4614), three students, 18 weeks. The repository is public and audited.

---

## Stack

- React
- REST API consumed from a **separate backend repository** (Django + DRF)
- Docker for parity with the rest of the stack

The backend base URL comes from an environment variable. Never hardcode it.

---

## Authentication

Session-based with **httpOnly cookies**, not JWT in `localStorage`. This is a
deliberate security decision: tokens in browser storage are readable by any
script on the page, and this application handles personal data of real clients.

Requests are sent with credentials included. CSRF token handling follows Django's
convention.

---

## Screens

The prototype (static HTML, in the team's evidence repository) defines eight
screens. They are a **proposal pending validation with the counterpart** —
scheduled for week 6. Do not treat them as final requirements.

**Client portal**

1. Service catalogue
2. Tax domicile form, with validation before advancing
3. Document preview (draft)
4. Confirmation and payment
5. Case status and signers, with a timeline
6. My cases

**Backoffice**

7. Operational dashboard
8. Case detail with audit trail

Still to build: **case type configuration** — the screen that makes the
configurable engine visible. It is the highest-value missing screen.

---

## Two details from the prototype that carry meaning

- In the catalogue, each service shows whether it **requires payment** and
  whether it **requires signature**. Those are attributes of the case type's
  configuration, not hardcoded per service. The UI reflects configuration.
- Services are marked as *outside the MVP* or *requires human handling*. The
  prototype declares its own scope; keep that.

---

## Domain vocabulary

The backend uses Spanish domain names and so should the frontend's domain types,
because the domain is Chilean legal and administrative:

`tramite`, `tipoTramite`, `documento`, `plantilla`, `empresa`,
`representanteLegal`, `oficina`, `firmante`, `rolDeAvaluo`.

Component names, hooks, utilities and tests in English. Comments in English.
Commit messages in English.

**UI copy is in Chilean Spanish.** Written for someone who does not know the
procedure: plain wording, no legal jargon unless the document itself requires it.

---

## Validation rules that matter

- **RUT**: validate format and check digit client-side for immediate feedback.
  The backend validates again. Do **not** claim the RUT is verified against any
  government registry — there is no such integration and it is not in scope.
- **Rol de avalúo**: expected format `0000-00`.
- The form must block document generation when required fields are missing or
  inconsistent. Preventing a bad document is the point; the current manual
  process produces errors precisely because nothing checks before generating.
- Show the legal representative as coming from the company's stored record, not
  as something "detected automatically".

---

## Things not to do

- **No browser storage for application state.** No `localStorage`, no
  `sessionStorage` for session or business data. Component state and server state
  only.
- Don't invent integrations in the UI (government registries, external lookups).
  If the backend does not expose it, it does not exist.
- Don't display prices as final. Pricing has not been confirmed by the company;
  anything shown is an example value.
- Don't add a UI component library without asking. Every dependency has to be
  justifiable in an oral defence.
- Don't build screens that are outside the MVP scope listed below.
- Don't promise a measured time reduction in any copy. The
  three-to-four-hours-to-minutes figure is the client's expectation, to be
  measured, not a result achieved.

---

## MVP scope

**In scope**

Client portal for the priority flow (tax domicile) end to end · backoffice for
users, roles, clients, companies, cases, states and audit · case type
configuration screen.

**Out of scope**

The full 25–40 document catalogue · company incorporation (confirmed by the
counterpart as requiring human handling) · notary integration · replacing the
company's existing website · mobile app.

The platform will be **linked from** the company's existing site, not embedded in
it and not replacing it.

---

## Working conventions

- Branch per user story: `feature/HU-24-formulario-domicilio-tributario`
- Every commit references its GitHub issue: `refs #42`
- Nothing reaches `main` without a Pull Request reviewed by another team member
- Traceability chain the project is graded on:
  `requirement → user story → issue → commit/PR → test → evidence`

**Definition of Done**

- [ ] Acceptance criteria met
- [ ] PR reviewed by another member
- [ ] Tests for new logic passing
- [ ] Documentation updated
- [ ] Runs from scratch with the documented commands
- [ ] No real personal data, no secrets committed

---

## Data privacy — non-negotiable

The repository is **public**. No real personal data in fixtures, mock responses,
screenshots or tests. Use synthetic Chilean-looking data. Chile's Ley 21.719 on
personal data protection comes into force on 1 December 2026, and the counterpart
raised data protection as one of the reasons for this project.

---

## Current status (week 5 of 18)

Prototypes built, **not yet validated** with the counterpart. Validation meeting
is week 6.

**Still unknown — do not invent answers:**

- Final case states and the transitions the UI must reflect
- Exact roles and what each one may see
- Payment provider and where payment sits in the flow
- Whether the signature step is client-initiated or automatic
- Real document templates and whether their layout must be reproduced exactly

If a task depends on one of these, say so rather than assuming. Mark assumptions
in code as `// ASSUMPTION: pending validation with Easy Office`.
