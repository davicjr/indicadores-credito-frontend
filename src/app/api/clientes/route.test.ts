import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const proxyMock = vi.fn();
vi.mock("@/lib/proxy-clientes", () => ({ proxyParaClientes: (...args: unknown[]) => proxyMock(...args) }));

describe("POST /api/clientes", () => {
  it("proxya criação de cliente pra -clientes", async () => {
    proxyMock.mockResolvedValue(new Response(null, { status: 201 }));
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/clientes", {
      method: "POST",
      body: JSON.stringify({ nome: "Ana" }),
    });
    await POST(request);

    expect(proxyMock).toHaveBeenCalledWith("/clientes", "POST", { nome: "Ana" });
  });
});
