import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const proxyMock = vi.fn();
vi.mock("@/lib/proxy-clientes", () => ({ proxyParaClientes: (...args: unknown[]) => proxyMock(...args) }));

describe("PUT /api/usuarios/me/senha", () => {
  it("proxya a troca de senha pra -clientes", async () => {
    proxyMock.mockResolvedValue(new Response(null, { status: 200 }));
    const { PUT } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/usuarios/me/senha", {
      method: "PUT",
      body: JSON.stringify({ senhaAtual: "atual123", novaSenha: "nova12345" }),
    });
    await PUT(request);

    expect(proxyMock).toHaveBeenCalledWith("/usuarios/me/senha", "PUT", {
      senhaAtual: "atual123",
      novaSenha: "nova12345",
    });
  });
});
