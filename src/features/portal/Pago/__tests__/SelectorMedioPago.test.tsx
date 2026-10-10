/** All data here is synthetic. */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SelectorMedioPago } from "../SelectorMedioPago";
import { MEDIOS } from "./fixtures";

function Selector() {
  const [elegido, setElegido] = useState(MEDIOS[0].codigo);
  return <SelectorMedioPago medios={MEDIOS} elegido={elegido} onElegir={setElegido} />;
}

describe("SelectorMedioPago", () => {
  it("moves the choice with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<Selector />);

    await user.tab();
    expect(screen.getByRole("radio", { name: /Klap/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("radio", { name: /Flow/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /Klap/ })).toHaveAttribute("aria-checked", "false");
  });

  it("shows each provider's logo", () => {
    render(<Selector />);

    expect(screen.getByRole("img", { name: "Klap" })).toHaveAttribute("src", "/medios-pago/klap.png");
    expect(screen.getByRole("img", { name: "Flow" })).toHaveAttribute("src", "/medios-pago/flow.svg");
  });
});
