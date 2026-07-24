import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Logomark } from "./Logomark";

const usePathnameMock = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

function mockMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    }) as MediaQueryList) as typeof window.matchMedia;
}

beforeEach(() => {
  usePathnameMock.mockReturnValue("/dashboard");
  mockMatchMedia(false);
});

afterEach(() => {
  mockMatchMedia(false);
});

describe("Logomark", () => {
  it("renderiza os 3 blocos da marca (base, haste, marcador)", () => {
    const { container } = render(<Logomark tamanho="pequeno" />);

    const rects = container.querySelectorAll("rect");
    // 4 rects: anel de confirmação (invisível por padrão) + base + haste + marcador
    expect(rects).toHaveLength(4);
  });

  it("com prefers-reduced-motion, pula pro estado final e chama aoPousar sem animar", () => {
    mockMatchMedia(true);
    const aoPousar = vi.fn();

    render(<Logomark tamanho="pequeno" aoPousar={aoPousar} />);

    expect(aoPousar).toHaveBeenCalled();
  });

  it("sem prefers-reduced-motion, não chama aoPousar de imediato (roteiro ainda vai rodar)", () => {
    const aoPousar = vi.fn();

    render(<Logomark tamanho="pequeno" aoPousar={aoPousar} />);

    expect(aoPousar).not.toHaveBeenCalled();
  });

  it("passar o mouse não quebra o componente", () => {
    const { container } = render(<Logomark tamanho="grande" />);

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(() => fireEvent.mouseEnter(svg as Element)).not.toThrow();
  });

  it("tamanho grande e pequeno aplicam classes diferentes", () => {
    const { container: pequeno } = render(<Logomark tamanho="pequeno" />);
    const { container: grande } = render(<Logomark tamanho="grande" />);

    const classePequeno = pequeno.querySelector("svg")?.getAttribute("class");
    const classeGrande = grande.querySelector("svg")?.getAttribute("class");
    expect(classePequeno).not.toEqual(classeGrande);
  });

  it("troca de rota replaya o roteiro (Nav não remonta na navegação interna do Next)", () => {
    mockMatchMedia(true); // reduzido: aoPousar dispara síncrono, fácil de contar repetições
    const aoPousar = vi.fn();
    usePathnameMock.mockReturnValue("/dashboard");

    const { rerender } = render(<Logomark tamanho="pequeno" aoPousar={aoPousar} />);
    expect(aoPousar).toHaveBeenCalledTimes(1);

    usePathnameMock.mockReturnValue("/clientes");
    rerender(<Logomark tamanho="pequeno" aoPousar={aoPousar} />);

    expect(aoPousar).toHaveBeenCalledTimes(2);
  });
});
