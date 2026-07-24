import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const proxyMock = vi.fn();
vi.mock("@/lib/proxy-clientes", () => ({ proxyParaClientes: (...args: unknown[]) => proxyMock(...args) }));

describe("GET /api/clientes/resumo", () => {
  it("proxya o resumo da carteira real pra -clientes", async () => {
    proxyMock.mockResolvedValue(
      new Response(
        JSON.stringify({ totalClientes: 32, scoreMedio: 562, distribuicaoPorFaixa: [], distribuicaoPorSegmento: [] }),
        { status: 200 }
      )
    );
    const { GET } = await import("./route");

    await GET(new NextRequest("http://localhost:3000/api/clientes/resumo"));

    expect(proxyMock).toHaveBeenCalledWith("/clientes/resumo", "GET");
  });

  it("repassa a query string do filtro (faixa/segmento) pra -clientes", async () => {
    proxyMock.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
    const { GET } = await import("./route");

    await GET(new NextRequest("http://localhost:3000/api/clientes/resumo?segmento=1"));

    expect(proxyMock).toHaveBeenCalledWith("/clientes/resumo?segmento=1", "GET");
  });
});
