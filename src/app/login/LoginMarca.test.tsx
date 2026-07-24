import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginMarca } from "./LoginMarca";

vi.mock("next/navigation", () => ({
  usePathname: () => "/login",
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

afterEach(() => {
  mockMatchMedia(false);
});

describe("LoginMarca", () => {
  it("mostra o wordmark, o subtítulo e a régua de faixas", () => {
    const { container } = render(<LoginMarca />);

    expect(screen.getByText("ÍNDICE")).toBeInTheDocument();
    expect(screen.getByText("REAL")).toBeInTheDocument();
    expect(screen.getByText("Um número. De verdade.")).toBeInTheDocument();
    expect(container.querySelectorAll("svg rect")).toHaveLength(4);
  });

  it("com prefers-reduced-motion, a logo pousa de imediato e o brilho da régua acende", () => {
    mockMatchMedia(true);
    const { container } = render(<LoginMarca />);

    expect(container.querySelector('[class*="brilhoAtivo"]')).not.toBeNull();
  });

  it("sem prefers-reduced-motion, o brilho ainda não acendeu na primeira renderização", () => {
    mockMatchMedia(false);
    const { container } = render(<LoginMarca />);

    expect(container.querySelector('[class*="brilhoAtivo"]')).toBeNull();
  });
});
