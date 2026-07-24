import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useTema } from "./useTema";

describe("useTema", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
  });

  it("reflete o tema atual do documento", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    const { result } = renderHook(() => useTema());

    expect(result.current.tema).toBe("dark");
  });

  it("alternar troca o tema, persiste em localStorage e atualiza o atributo", () => {
    document.documentElement.setAttribute("data-theme", "light");
    const { result } = renderHook(() => useTema());

    act(() => result.current.alternar());

    expect(result.current.tema).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("tema")).toBe("dark");
  });

  it("alternar de novo volta pro tema anterior", () => {
    document.documentElement.setAttribute("data-theme", "light");
    const { result } = renderHook(() => useTema());

    act(() => result.current.alternar());
    act(() => result.current.alternar());

    expect(result.current.tema).toBe("light");
  });
});
