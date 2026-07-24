import { describe, expect, it, vi } from "vitest";

const getMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: getMock }),
}));

describe("getToken", () => {
  it("lê o valor do cookie de sessão via next/headers", async () => {
    getMock.mockReturnValue({ value: "jwt-de-teste" });
    const { getToken } = await import("./session");

    await expect(getToken()).resolves.toBe("jwt-de-teste");
    expect(getMock).toHaveBeenCalledWith("sessao");
  });

  it("retorna undefined quando não há cookie de sessão", async () => {
    getMock.mockReturnValue(undefined);
    const { getToken } = await import("./session");

    await expect(getToken()).resolves.toBeUndefined();
  });
});
