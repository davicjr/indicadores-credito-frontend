import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const proxyMock = vi.fn();
vi.mock("@/lib/proxy-clientes", () => ({ proxyParaClientes: (...args: unknown[]) => proxyMock(...args) }));

describe("GET /api/clientes/distribuicao/[metrica]", () => {
  it("proxya a distribuição por métrica dos clientes reais pra -clientes", async () => {
    proxyMock.mockResolvedValue(new Response(JSON.stringify({ metrica: "idade", faixas: [] }), { status: 200 }));
    const { GET } = await import("./route");

    await GET(new NextRequest("http://localhost:3000/api/clientes/distribuicao/idade"), {
      params: Promise.resolve({ metrica: "idade" }),
    });

    expect(proxyMock).toHaveBeenCalledWith("/clientes/distribuicao/idade", "GET");
  });

  it("repassa a query string do filtro (faixa/segmento) pra -clientes", async () => {
    proxyMock.mockResolvedValue(new Response(JSON.stringify({ metrica: "idade", faixas: [] }), { status: 200 }));
    const { GET } = await import("./route");

    await GET(new NextRequest("http://localhost:3000/api/clientes/distribuicao/idade?faixa=Ruim"), {
      params: Promise.resolve({ metrica: "idade" }),
    });

    expect(proxyMock).toHaveBeenCalledWith("/clientes/distribuicao/idade?faixa=Ruim", "GET");
  });
});
