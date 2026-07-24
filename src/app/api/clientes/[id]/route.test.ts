import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const proxyMock = vi.fn();
vi.mock("@/lib/proxy-clientes", () => ({ proxyParaClientes: (...args: unknown[]) => proxyMock(...args) }));

describe("PUT /api/clientes/[id]", () => {
  it("proxya atualização de cliente pra -clientes com o id da rota", async () => {
    proxyMock.mockResolvedValue(new Response(null, { status: 200 }));
    const { PUT } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/clientes/c1", {
      method: "PUT",
      body: JSON.stringify({ nome: "Ana Atualizada" }),
    });
    await PUT(request, { params: Promise.resolve({ id: "c1" }) });

    expect(proxyMock).toHaveBeenCalledWith("/clientes/c1", "PUT", { nome: "Ana Atualizada" });
  });
});
