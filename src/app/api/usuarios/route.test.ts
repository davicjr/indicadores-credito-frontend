import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const proxyMock = vi.fn();
vi.mock("@/lib/proxy-clientes", () => ({ proxyParaClientes: (...args: unknown[]) => proxyMock(...args) }));

describe("POST /api/usuarios", () => {
  it("proxya a criação de usuário pra -clientes", async () => {
    proxyMock.mockResolvedValue(new Response(null, { status: 201 }));
    const { POST } = await import("./route");

    const corpo = { usuario: "novo1", senha: "senha1234", papel: "ANALISTA" };
    const request = new NextRequest("http://localhost:3000/api/usuarios", {
      method: "POST",
      body: JSON.stringify(corpo),
    });
    await POST(request);

    expect(proxyMock).toHaveBeenCalledWith("/usuarios", "POST", corpo);
  });
});
