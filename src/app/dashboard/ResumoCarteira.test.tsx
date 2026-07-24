import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResumoCarteira } from "./ResumoCarteira";

describe("ResumoCarteira", () => {
  it("mostra o total de clientes e o score médio arredondado, com a faixa correspondente", () => {
    render(<ResumoCarteira totalClientes={149391} scoreMedio={712.428} />);

    expect(screen.getByLabelText("Indicadores da carteira")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.queryByText("Resumo da carteira")).not.toBeInTheDocument();
    expect(screen.getByText("149.391")).toBeInTheDocument();
    expect(screen.getByTestId("regua-score-numero")).toHaveTextContent("712");
    expect(screen.getByText("Bom")).toBeInTheDocument();
  });

  it("rotula como 'Registros analisados' e deixa claro que não é o cadastro real de clientes", () => {
    render(<ResumoCarteira totalClientes={149391} scoreMedio={712} />);

    expect(screen.getByText("Registros analisados")).toBeInTheDocument();
    expect(screen.queryByText("Clientes")).not.toBeInTheDocument();
    expect(screen.getByText(/base histórica.*modelo/i)).toBeInTheDocument();
  });

  it("aceita rótulo customizado e omite a legenda quando vazia (dashboard de carteira real)", () => {
    render(<ResumoCarteira totalClientes={2} scoreMedio={620} rotuloTotal="Clientes ativos" legenda="" />);

    expect(screen.getByText("Clientes ativos")).toBeInTheDocument();
    expect(screen.queryByText("Registros analisados")).not.toBeInTheDocument();
    expect(screen.queryByText(/base histórica/i)).not.toBeInTheDocument();
  });

  it("não quebra quando scoreMedio é nulo (nenhum cliente com score calculado ainda)", () => {
    render(<ResumoCarteira totalClientes={2} scoreMedio={null} rotuloTotal="Clientes ativos" />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/sem score calculado/i)).toBeInTheDocument();
  });
});
