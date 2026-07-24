import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const proxyMock = vi.fn();
vi.mock("@/lib/proxy-clientes", () => ({ proxyParaClientes: (...args: unknown[]) => proxyMock(...args) }));

describe("PATCH /api/usuarios/[id]/inativar", () => {
  it("proxya a inativação de usuário pra -clientes com o id da rota", async () => {
    proxyMock.mockResolvedValue(new Response(null, { status: 200 }));
    const { PATCH } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/usuarios/u1/inativar", { method: "PATCH" });
    await PATCH(request, { params: Promise.resolve({ id: "u1" }) });

    expect(proxyMock).toHaveBeenCalledWith("/usuarios/u1/inativar", "PATCH");
  });
});
