import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarraComPiso } from "./graficos";

describe("BarraComPiso", () => {
  it("preserva os atributos visuais usados no feedback de seleção", () => {
    const { container } = render(
      <svg>
        <BarraComPiso
          width={20}
          height={10}
          fill="red"
          fillOpacity={0.35}
          stroke="blue"
          strokeOpacity={0.8}
          strokeWidth={2}
          className="selecionada"
        />
      </svg>
    );

    const barra = container.querySelector("rect");
    expect(barra).toHaveAttribute("fill-opacity", "0.35");
    expect(barra).toHaveAttribute("stroke", "blue");
    expect(barra).toHaveAttribute("stroke-opacity", "0.8");
    expect(barra).toHaveAttribute("stroke-width", "2");
    expect(barra).toHaveClass("selecionada");
  });
});
