import { describe, it, vi } from "vitest";
import { render } from "@testing-library/react";
import fs from "node:fs";
import { RegraDeScore } from "@/components/RegraDeScore";
import { DashboardView } from "./DashboardView";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams({ faixa: "Ruim" }),
}));

function remapearCss(cssBruto: string, html: string): string {
  const nomes = [...cssBruto.matchAll(/\.([a-zA-Z_-][\w-]*)/g)].map((m) => m[1]);
  let resultado = cssBruto;
  for (const nome of new Set(nomes)) {
    const re = new RegExp(`_${nome}_[a-f0-9]+`);
    const achado = html.match(re);
    if (achado) resultado = resultado.split(`.${nome}`).join(`.${achado[0]}`);
  }
  return resultado;
}

describe("verificação visual (temporário, não faz parte da suíte)", () => {
  it("serializa a régua nova e o cabeçalho com chip pra HTML estático", () => {
    const regua = render(<RegraDeScore score={562} faixa="Ruim" />);
    const dashboard = render(
      <DashboardView
        resumoInicial={{
          totalClientes: 32,
          scoreMedio: 562,
          distribuicaoPorFaixa: [{ faixa: "Ruim", quantidade: 18 }],
          distribuicaoPorSegmento: [{ segmento: 1, quantidade: 21 }],
        }}
        metricas={["idade"]}
        metricaInicial="idade"
        distribuicaoMetricaInicial={{ metrica: "idade", faixas: [{ min: 22, max: 33, quantidade: 6 }] }}
        filtroInicial={{ tipo: "faixa", valor: "Ruim" }}
      />
    );

    const css = fs.readFileSync(
      "/home/davicjr/Documentos/GitHub/indicadores-credito-frontend/src/app/globals.css",
      "utf-8"
    );
    const reguaCssBruto = fs.readFileSync(
      "/home/davicjr/Documentos/GitHub/indicadores-credito-frontend/src/components/RegraDeScore.module.css",
      "utf-8"
    );
    const dashCssBruto = fs.readFileSync(
      "/home/davicjr/Documentos/GitHub/indicadores-credito-frontend/src/app/dashboard/dashboard.module.css",
      "utf-8"
    );
    const reguaCss = remapearCss(reguaCssBruto, regua.container.innerHTML);
    const dashCss = remapearCss(dashCssBruto, dashboard.container.innerHTML);

    const pagina = `<!doctype html>
<html data-theme="dark">
<head><meta charset="utf-8"><style>${css}
${reguaCss}
${dashCss}
body{background:var(--papel);padding:1rem;font-family:sans-serif}
</style></head>
<body>
${dashboard.container.innerHTML}
</body></html>`;

    fs.writeFileSync(
      "/tmp/claude-1000/-home-davicjr-Documentos-GitHub/af2f5f22-90d4-472d-993d-e3bc9b470e3e/scratchpad/check-final.html",
      pagina
    );
  });
});
