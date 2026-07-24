import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExplicabilidadeScore } from "./ExplicabilidadeScore";

describe("ExplicabilidadeScore", () => {
  it("explica o impacto de cada fator somente naquele cenário", () => {
    render(
      <ExplicabilidadeScore
        contribuicoes={[
          { feature: "times_90_days_late", contribuicao: 0.6 },
          { feature: "age", contribuicao: -0.4 },
        ]}
        valores={{ times_90_days_late: "2", age: "36 anos" }}
      />
    );

    expect(screen.getByText("Atrasos de 90 dias ou mais")).toBeInTheDocument();
    expect(screen.getByText("Idade")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("36 anos")).toBeInTheDocument();
    expect(screen.getByText(/aumentou o risco estimado/i)).toBeInTheDocument();
    expect(screen.getByText(/reduziu o risco estimado/i)).toBeInTheDocument();
    expect(screen.getByText(/não representam pontos/i)).toBeInTheDocument();
  });

  it("usa o contexto de cliente real sem chamar o resultado de cenário", () => {
    render(
      <ExplicabilidadeScore
        contexto="cliente"
        contribuicoes={[{ feature: "age", contribuicao: -0.4 }]}
      />
    );

    expect(screen.getByText(/resultado deste cliente/i)).toBeInTheDocument();
    expect(screen.queryByText(/cenário/i)).not.toBeInTheDocument();
  });

  it("mostra todos os fatores recebidos, sem limitar a um top-N", () => {
    const contribuicoes = Array.from({ length: 10 }, (_, i) => ({
      feature: `feature_${i}`,
      contribuicao: 1 - i * 0.1,
    }));
    render(<ExplicabilidadeScore contribuicoes={contribuicoes} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(10);
  });

  it("ordena do fator que mais aumenta o risco (mais vermelho) pro que mais reduz (mais verde)", () => {
    render(
      <ExplicabilidadeScore
        contribuicoes={[
          { feature: "debt_ratio", contribuicao: 0.1 },
          { feature: "times_90_days_late", contribuicao: 0.6 },
          { feature: "monthly_income", contribuicao: -0.5 },
          { feature: "age", contribuicao: -0.2 },
        ]}
      />
    );

    const nomes = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(nomes[0]).toContain("Atrasos de 90 dias ou mais");
    expect(nomes[1]).toContain("Razão dívida/renda");
    expect(nomes[2]).toContain("Idade");
    expect(nomes[3]).toContain("Renda mensal");
  });

  it("mostra estado vazio quando não há contribuições", () => {
    render(<ExplicabilidadeScore contribuicoes={[]} />);

    expect(screen.getByText(/sem explicação disponível/i)).toBeInTheDocument();
  });
});
