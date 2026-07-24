import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MotionReveal, MotionStagger } from "./MotionReveal";

describe("MotionReveal", () => {
  it("preserva elemento semântico, classe externa e atributos", () => {
    const { container } = render(
      <MotionReveal as="section" className="cartao" aria-label="Resumo" delay={2} variant="fade">
        Conteúdo
      </MotionReveal>
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("cartao");
    expect(section).toHaveAttribute("aria-label", "Resumo");
  });

  it("mantém os itens como filhos diretos do agrupador", () => {
    const { container } = render(
      <MotionStagger as="ul">
        <li>Um</li>
        <li>Dois</li>
      </MotionStagger>
    );

    expect(container.querySelector("ul")?.children).toHaveLength(2);
  });
});
