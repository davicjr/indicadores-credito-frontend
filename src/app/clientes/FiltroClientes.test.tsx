import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FiltroClientes } from "./FiltroClientes";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  usePathname: () => "/clientes",
  useSearchParams: () => new URLSearchParams(),
}));

describe("FiltroClientes", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mostra os valores atuais pré-preenchidos, sem botão de submit", () => {
    render(<FiltroClientes nome="ana" faixa="Bom" segmento={1} status="inativo" />);

    expect(screen.getByLabelText("Buscar por nome")).toHaveValue("ana");
    expect(screen.getByLabelText("Faixa")).toHaveValue("Bom");
    expect(screen.getByLabelText("Segmento")).toHaveValue("1");
    expect(screen.getByLabelText("Status")).toHaveValue("inativo");
    expect(screen.queryByRole("button", { name: /filtrar/i })).not.toBeInTheDocument();
  });

  it("sem filtros ativos, campos ficam vazios/padrão (status mostra Ativos, o default do backend)", () => {
    render(<FiltroClientes />);

    expect(screen.getByLabelText("Buscar por nome")).toHaveValue("");
    expect(screen.getByLabelText("Faixa")).toHaveValue("");
    expect(screen.getByLabelText("Segmento")).toHaveValue("");
    expect(screen.getByLabelText("Status")).toHaveValue("");
  });

  it("lista as 3 opções de status: Ativos, Inativos, Todos", () => {
    render(<FiltroClientes />);

    const opcoes = Array.from((screen.getByLabelText("Status") as HTMLSelectElement).options).map(
      (option) => option.text
    );

    expect(opcoes).toEqual(["Ativos", "Inativos", "Todos"]);
  });

  it("trocar o status filtra na hora", async () => {
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FiltroClientes />);

    await usuario.selectOptions(screen.getByLabelText("Status"), "todos");

    expect(replaceMock).toHaveBeenCalledWith("/clientes?status=todos");
  });

  it("mostra a faixa em ordem alfabética e o segmento em ordem de histórico de atraso", () => {
    render(<FiltroClientes />);

    const faixas = Array.from((screen.getByLabelText("Faixa") as HTMLSelectElement).options).map(
      (option) => option.text
    );
    const segmentos = Array.from((screen.getByLabelText("Segmento") as HTMLSelectElement).options).map(
      (option) => option.text
    );

    expect(faixas).toEqual(["Todas", "Bom", "Excelente", "Muito Bom", "Regular", "Ruim"]);
    expect(segmentos).toEqual([
      "Todos",
      "No vermelho",
      "Endividamento crítico",
      "Aperto no orçamento",
      "Cliente de confiança",
      "Pagador tranquilo",
      "Pagador exemplar",
    ]);
  });

  it("trocar a faixa filtra na hora, sem esperar digitação", async () => {
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FiltroClientes />);

    await usuario.selectOptions(screen.getByLabelText("Faixa"), "Bom");

    expect(replaceMock).toHaveBeenCalledWith("/clientes?faixa=Bom");
  });

  it("digitar o nome só navega depois de parar de digitar (debounce)", async () => {
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FiltroClientes />);

    await usuario.type(screen.getByLabelText("Buscar por nome"), "ana");
    expect(replaceMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(350);

    expect(replaceMock).toHaveBeenCalledWith("/clientes?nome=ana");
  });
});
