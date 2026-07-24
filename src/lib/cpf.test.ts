import { describe, expect, it } from "vitest";
import { isValidCpf } from "./cpf";

describe("isValidCpf", () => {
  it("aceita CPF válido (dígito verificador mod-11 correto)", () => {
    expect(isValidCpf("111.444.777-35")).toBe(true);
    expect(isValidCpf("11144477735")).toBe(true);
  });

  it("rejeita CPF com dígito verificador errado", () => {
    expect(isValidCpf("111.444.777-36")).toBe(false);
  });

  it("rejeita CPF com todos os dígitos iguais", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });

  it("rejeita CPF com quantidade errada de dígitos", () => {
    expect(isValidCpf("123456")).toBe(false);
  });
});
