import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const proxyMock = vi.fn();
vi.mock("@/lib/proxy-clientes", () => ({ proxyParaClientes: (...args: unknown[]) => proxyMock(...args) }));

describe("GET /api/usuarios/[id]", () => {
  it("proxya a busca de usuário por id pra -clientes", async () => {
    proxyMock.mockResolvedValue(new Response(JSON.stringify({ id: "u1" }), { status: 200 }));
    const { GET } = await import("./route");

    await GET(new NextRequest("http://localhost:3000/api/usuarios/u1"), { params: Promise.resolve({ id: "u1" }) });

    expect(proxyMock).toHaveBeenCalledWith("/usuarios/u1", "GET");
  });
});

describe("PUT /api/usuarios/[id]", () => {
  it("proxya a atualização de usuário pra -clientes com o id da rota", async () => {
    proxyMock.mockResolvedValue(new Response(JSON.stringify({ id: "u1" }), { status: 200 }));
    const { PUT } = await import("./route");

    const corpo = { usuario: "novo1", papel: "ADMIN" };
    const request = new NextRequest("http://localhost:3000/api/usuarios/u1", {
      method: "PUT",
      body: JSON.stringify(corpo),
    });
    await PUT(request, { params: Promise.resolve({ id: "u1" }) });

    expect(proxyMock).toHaveBeenCalledWith("/usuarios/u1", "PUT", corpo);
  });
});

describe("DELETE /api/usuarios/[id]", () => {
  it("proxya a exclusão de usuário pra -clientes com o id da rota", async () => {
    proxyMock.mockResolvedValue(new Response(null, { status: 204 }));
    const { DELETE } = await import("./route");

    await DELETE(new NextRequest("http://localhost:3000/api/usuarios/u1", { method: "DELETE" }), {
      params: Promise.resolve({ id: "u1" }),
    });

    expect(proxyMock).toHaveBeenCalledWith("/usuarios/u1", "DELETE");
  });
});
