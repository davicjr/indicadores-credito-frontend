import { describe, expect, it } from "vitest";
import { ordenarAlfabeticamente, proximoSort } from "./ordenacao";

describe("ordenarAlfabeticamente", () => {
  it("ordena pelo rótulo visível com regras de português e números naturais", () => {
    const itens = [
      { rotulo: "Utilização" },
      { rotulo: "Atrasos de 90 dias" },
      { rotulo: "Árvore" },
      { rotulo: "Atrasos de 30 dias" },
    ];

    expect(ordenarAlfabeticamente(itens, (item) => item.rotulo).map((item) => item.rotulo)).toEqual([
      "Árvore",
      "Atrasos de 30 dias",
      "Atrasos de 90 dias",
      "Utilização",
    ]);
  });

  it("não altera a lista recebida", () => {
    const itens = ["B", "A"];

    ordenarAlfabeticamente(itens, (item) => item);

    expect(itens).toEqual(["B", "A"]);
  });
});

describe("proximoSort", () => {
  it("de nenhuma ordenação, primeiro clique ordena ascendente", () => {
    expect(proximoSort(undefined, "nome")).toBe("nome,asc");
  });

  it("de ascendente no mesmo campo, próximo clique ordena descendente", () => {
    expect(proximoSort("nome,asc", "nome")).toBe("nome,desc");
  });

  it("de descendente no mesmo campo, próximo clique remove a ordenação", () => {
    expect(proximoSort("nome,desc", "nome")).toBeUndefined();
  });

  it("clicar num campo diferente do atual reinicia em ascendente", () => {
    expect(proximoSort("nome,desc", "score")).toBe("score,asc");
  });
});
