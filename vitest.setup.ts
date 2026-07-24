import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// sem test.globals no vitest.config.ts, o auto-cleanup do testing-library não se registra
// sozinho — precisa deste afterEach explícito, senão render() de um teste vaza pro próximo.
afterEach(cleanup);

// Recharts (ResponsiveContainer) depende de ResizeObserver e de getBoundingClientRect real —
// jsdom não implementa nenhum dos dois (todo elemento tem 0x0), então o gráfico nunca teria
// tamanho nos testes sem isso. Mock global, não afeta nada fora de componente com Recharts.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

Element.prototype.getBoundingClientRect = () =>
  ({
    width: 600,
    height: 300,
    top: 0,
    left: 0,
    bottom: 300,
    right: 600,
    x: 0,
    y: 0,
    toJSON() {},
  }) as DOMRect;

// jsdom não implementa matchMedia — usado pela Logomark pra checar prefers-reduced-motion.
// Default matches:false (motion ligado); um teste específico que precise do caminho reduzido
// sobrescreve window.matchMedia localmente.
window.matchMedia =
  window.matchMedia ||
  ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    }) as MediaQueryList);
