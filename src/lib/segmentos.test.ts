import { describe, expect, it } from "vitest";
import {
  corDoSegmento,
  descricaoSegmento,
  nomeSegmento,
  ordenarPorGravidadeSegmento,
  ORDEM_SEGMENTOS,
} from "./segmentos";

describe("nomeSegmento", () => {
  it("mapeia cada segmento pro nome de negócio decidido a partir dos centróides reais (K=6, índice canônico por risco — ADR 0007)", () => {
    expect(nomeSegmento(5)).toBe("No vermelho");
    expect(nomeSegmento(4)).toBe("Endividamento crítico");
    expect(nomeSegmento(3)).toBe("Aperto no orçamento");
    expect(nomeSegmento(2)).toBe("Cliente de confiança");
    expect(nomeSegmento(1)).toBe("Pagador tranquilo");
    expect(nomeSegmento(0)).toBe("Pagador exemplar");
  });

  it("cai pro genérico quando o segmento é desconhecido (modelo pode mudar de K no futuro)", () => {
    expect(nomeSegmento(9)).toBe("Segmento 9");
  });

  it("explica o significado do perfil sem expor detalhes do algoritmo", () => {
    expect(descricaoSegmento(5)).toBe("Maior exposição a atrasos e uso elevado do crédito.");
    expect(descricaoSegmento(4)).toBe("Dívida bem acima da renda, com dado de origem sinalizado.");
  });
});

describe("corDoSegmento", () => {
  it("reaproveita a régua de score (mesma cor do simulador), por identidade de cluster", () => {
    expect(corDoSegmento(5)).toBe("var(--faixa-ruim)");
    expect(corDoSegmento(4)).toBe("var(--faixa-regular)");
    expect(corDoSegmento(3)).toBe("var(--faixa-bom)");
    expect(corDoSegmento(2)).toBe("var(--faixa-muito-bom)");
    expect(corDoSegmento(1)).toBe("var(--faixa-excelente)");
  });

  it("os dois segmentos de menor risco (renda não informada) dividem --faixa-excelente — só 5 tokens pra 6 segmentos (ADR 0005)", () => {
    expect(corDoSegmento(0)).toBe("var(--faixa-excelente)");
    expect(corDoSegmento(0)).toBe(corDoSegmento(1));
  });

  it("cai pro apagado quando o segmento é desconhecido", () => {
    expect(corDoSegmento(9)).toBe("var(--apagado)");
  });
});

describe("ORDEM_SEGMENTOS", () => {
  it("lista os 6 segmentos conhecidos em ordem de histórico de atraso, do maior risco pro menor", () => {
    expect(ORDEM_SEGMENTOS).toEqual([5, 4, 3, 2, 1, 0]);
  });
});

describe("ordenarPorGravidadeSegmento", () => {
  it("ordena itens pela mesma ordem de gravidade de ORDEM_SEGMENTOS, do pior pro melhor", () => {
    const itens = [{ segmento: 1 }, { segmento: 5 }, { segmento: 2 }];

    const ordenado = ordenarPorGravidadeSegmento(itens);

    expect(ordenado.map((i) => i.segmento)).toEqual([5, 2, 1]);
  });
});
