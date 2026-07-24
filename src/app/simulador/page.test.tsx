import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

const getImportanciaFeaturesMock = vi.fn();
vi.mock("@/lib/dados-api", () => ({
  getImportanciaFeatures: () => getImportanciaFeaturesMock(),
}));

describe("SimuladorPage", () => {
  it("renderiza o título e o formulário de simulação", async () => {
    getImportanciaFeaturesMock.mockResolvedValue([]);
    const { default: SimuladorPage } = await import("./page");

    render(await SimuladorPage());

    expect(screen.getByRole("heading", { name: "Simulador de score" })).toBeInTheDocument();
    expect(screen.getByLabelText("Idade")).toBeInTheDocument();
  });

  it("segue funcionando mesmo se a importância de features falhar (complemento, não bloqueio)", async () => {
    getImportanciaFeaturesMock.mockRejectedValue(new Error("-dados fora do ar"));
    const { default: SimuladorPage } = await import("./page");

    render(await SimuladorPage());

    expect(screen.getByRole("heading", { name: "Simulador de score" })).toBeInTheDocument();
  });
});
