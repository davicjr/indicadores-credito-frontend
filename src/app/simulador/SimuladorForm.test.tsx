import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SimuladorForm } from "./SimuladorForm";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

function respostaSimulacao(score: number, faixa: string) {
  return new Response(
    JSON.stringify({
      score,
      faixa,
      segmento: 2,
      modeloUsado: "logistic",
      contribuicoes: [
        { feature: "times_90_days_late", contribuicao: 0.6 },
        { feature: "age", contribuicao: -0.4 },
      ],
    }),
    { status: 200 }
  );
}

// Campos ficam divididos em 3 abas (Perfil / Situação financeira / Histórico de atraso) — só a
// primeira vem aberta, então o teste precisa navegar entre elas, igual um usuário real faria.
async function preencherCamposFinanceiros(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText("Idade"), "30");

  await usuario.click(screen.getByRole("tab", { name: "Situação financeira" }));
  await usuario.type(screen.getByLabelText("Utilização de crédito rotativo"), "0.25");
  await usuario.type(screen.getByLabelText("Razão dívida/renda"), "0.18");
  await usuario.type(screen.getByLabelText("Linhas de crédito abertas"), "2");
  await usuario.type(screen.getByLabelText("Empréstimos imobiliários"), "0");

  await usuario.click(screen.getByRole("tab", { name: "Histórico de atraso" }));
  await usuario.type(screen.getByLabelText("Atrasos de 30 a 59 dias"), "0");
  await usuario.type(screen.getByLabelText("Atrasos de 60 a 89 dias"), "0");
  await usuario.type(screen.getByLabelText("Atrasos de 90 dias ou mais"), "0");
}

describe("SimuladorForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respostaSimulacao(712, "Bom")));
  });

  it("mostra grupos com Perfil primeiro e campos de cada grupo em ordem alfabética", async () => {
    const usuario = userEvent.setup();
    render(<SimuladorForm pesos={[]} />);

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Perfil",
      "Situação financeira",
      "Histórico de atraso",
    ]);

    await usuario.click(screen.getByRole("tab", { name: "Situação financeira" }));
    const labels = screen
      .getAllByRole("spinbutton")
      .filter((campo) => !campo.closest("[hidden]"))
      .map((campo) => campo.getAttribute("aria-label") ?? campo.getAttribute("name"));
    expect(labels).toEqual([
      "emprestimosImobiliarios",
      "linhasCreditoAbertas",
      "razaoDividaRenda",
      "rendaMensal",
      "utilizacaoCreditoRotativo",
    ]);
  });

  it("simula e mostra o resultado na régua de score, com explicabilidade", async () => {
    const usuario = userEvent.setup();
    render(<SimuladorForm pesos={[]} />);

    await preencherCamposFinanceiros(usuario);
    await usuario.click(screen.getByRole("button", { name: "Simular score" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/simulador",
      expect.objectContaining({ method: "POST", body: expect.stringContaining('"idade":30') })
    );
    expect(await screen.findByTestId("regua-score-numero")).toHaveTextContent("712");
    expect(screen.getByText("Bom")).toBeInTheDocument();
    expect(screen.getByText("Atrasos de 90 dias ou mais")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Por que este score?" })).toBeInTheDocument();
    expect(screen.getByText("Histórico mais estável, com poucos atrasos.")).toBeInTheDocument();
    expect(screen.getByText("30 anos")).toBeInTheDocument();
  });

  it("mostra erro quando a simulação falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ mensagem: "gold indisponível" }), { status: 503 })
      )
    );
    const usuario = userEvent.setup();
    render(<SimuladorForm pesos={[]} />);

    await preencherCamposFinanceiros(usuario);
    await usuario.click(screen.getByRole("button", { name: "Simular score" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("gold indisponível");
  });

  it("simular de novo depois de um resultado compara os dois cenários lado a lado", async () => {
    const usuario = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respostaSimulacao(712, "Bom"))
      .mockResolvedValueOnce(respostaSimulacao(580, "Regular"));
    vi.stubGlobal("fetch", fetchMock);

    render(<SimuladorForm pesos={[]} />);
    await preencherCamposFinanceiros(usuario);
    await usuario.click(screen.getByRole("button", { name: "Simular score" }));
    await screen.findByTestId("regua-score-numero");

    // o formulário mantém os valores preenchidos (permite reenviar/ajustar sem repetir tudo) —
    // reenvia direto, sem repreencher, matching o comportamento real do "simular outro cenário"
    await usuario.click(screen.getByRole("button", { name: "Simular outro cenário" }));
    await usuario.click(screen.getByRole("button", { name: "Simular score" }));

    const numeros = await screen.findAllByTestId("regua-score-numero");
    expect(numeros.map((numero) => numero.textContent)).toEqual(expect.arrayContaining(["580", "712"]));
  });

  it("depois do resultado, permite cadastrar o cliente com os dados financeiros já preenchidos", async () => {
    const usuario = userEvent.setup();
    render(<SimuladorForm pesos={[]} />);

    await preencherCamposFinanceiros(usuario);
    await usuario.click(screen.getByRole("button", { name: "Simular score" }));
    await screen.findByTestId("regua-score-numero");

    await usuario.click(screen.getByRole("button", { name: "Cadastrar este cliente" }));

    expect(screen.getByLabelText("CPF")).toBeInTheDocument();
    expect(screen.getByLabelText("Linhas de crédito abertas")).toHaveValue(2);
  });

  it("clicar num caso real preenche o formulário com os valores reais daquele segmento", async () => {
    const usuario = userEvent.setup();
    render(<SimuladorForm pesos={[]} />);

    await usuario.click(screen.getByRole("button", { name: "Cliente de confiança" }));

    expect(screen.getByLabelText("Idade")).toHaveValue(55);
    expect(screen.getByLabelText("Utilização de crédito rotativo")).toHaveValue(0.14);
    expect(screen.getByLabelText("Atrasos de 90 dias ou mais")).toHaveValue(0);
  });

  it("mostra o peso real do campo no modelo quando os pesos são fornecidos", () => {
    render(
      <SimuladorForm
        pesos={[
          { feature: "revolving_utilization", peso: 0.6448 },
          { feature: "times_90_days_late", peso: 0.3181 },
          { feature: "monthly_income", peso: -0.3111 },
          { feature: "times_30_59_days_late", peso: 0.3071 },
          { feature: "age", peso: -0.2768 },
          { feature: "times_60_89_days_late", peso: 0.1994 },
          { feature: "open_credit_lines", peso: 0.1127 },
          { feature: "real_estate_loans", peso: 0.0898 },
          { feature: "dependents", peso: 0.047 },
          { feature: "debt_ratio", peso: 0.0419 },
        ]}
      />
    );

    // Idade é o único campo visível por padrão (aba "Perfil" vem aberta) — é o 5º em peso
    // real entre os pesos de teste acima.
    expect(screen.getByText("#5")).toHaveAttribute("title", "peso #5 de 10");
  });
});
