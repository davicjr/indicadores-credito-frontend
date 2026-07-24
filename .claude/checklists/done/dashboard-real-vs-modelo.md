---
feature: dashboard real vs sobre o modelo
status: done
created: 2026-07-22
---

# Dashboard real vs Sobre o modelo

Checklist espelho — feature cross-repo, fonte de verdade completa em
`indicadores-credito-clientes/.claude/checklists/done/dashboard-real-vs-modelo.md`. Depende
de `GET /clientes/resumo` novo em `-clientes` (backend-first).

## Tarefas
- [x] `getResumoClientes()` em `src/lib/clientes-api.ts`
- [x] `ResumoCarteira` ganha props opcionais (`rotuloTotal`, `legenda`), `scoreMedio` vira
      `number | null`
- [x] Rota `/modelo` (`page.tsx` + `ModeloView.tsx`) recebe o conteúdo atual do dashboard
      (Resumo, DistribuicaoPorFaixa, DistribuicaoPorSegmento, InadimplenciaPorSegmento,
      MetricasCarteira)
- [x] `/dashboard` (`page.tsx` + `DashboardView.tsx`) passa a buscar `getResumoClientes()` —
      reaproveita `ResumoCarteira`/`DistribuicaoPorFaixa`/`DistribuicaoPorSegmento`, sem
      `InadimplenciaPorSegmento`/`MetricasCarteira` (não fazem sentido sem resultado real
      conhecido)
- [x] `Nav.tsx` ganha link "Sobre o modelo" → `/modelo`
- [x] `middleware.ts` protege `/modelo`

## Quality gates
- [x] `npx tsc --noEmit` + `npm test -- --run` passando (67 arquivos, 192 testes)
- [x] `/davi-core:review` — sem risco novo, mesma auth de `/clientes/**`
- [x] Verificado de ponta a ponta — screenshot real dos dois dashboards
- [x] `/davi-core:retro` — ver checklist de `-clientes`

## Notas

Ver checklist de `-clientes` (`done/dashboard-real-vs-modelo.md`) pro contexto completo da
decisão e o retro.

### Adendo — Distribuição dos clientes por métrica (2026-07-22)

Usuário notou, navegando o `/dashboard` real, que faltava paridade de gráficos com o `/modelo`
("as metricas n tem no dashboard... e o terceiro gráfico tbm"). Depois de esclarecido que
"Inadimplência por segmento" não dá pra fazer honestamente pra clientes ativos (resultado ainda
não aconteceu), implementado só o gráfico de distribuição por métrica, sem taxa:

- [x] `-clientes`: `GET /clientes/distribuicao/{metrica}` (85/85 testes backend)
- [x] `-frontend`: `getDistribuicaoMetricaCliente()`, rota BFF
      `/api/clientes/distribuicao/[metrica]`, componente `DistribuicaoMetricaClientes`
      integrado ao `DashboardView`
- [x] `npx tsc --noEmit` + `npm test -- --run` passando (68 arquivos, 194 testes)
- [x] Verificado de ponta a ponta: backend real (curl com JWT real, 32 clientes reais) +
      screenshot real do `/dashboard` com o gráfico renderizado + clique real no pill "Renda
      mensal" confirmado via log do servidor (`GET /api/clientes/distribuicao/rendaMensal 200`)
- Achado durante a verificação: `DistribuicaoMetricaClientes.tsx` importava `METRICAS_CLIENTES`
  como valor de runtime direto de `clientes-api.ts` (client component), o que arrastava
  `session.ts`/`next/headers` (server-only) pro bundle do cliente e quebrava o build
  ("You're importing a component that needs next/headers"). Corrigido replicando o padrão já
  usado em `MetricasExplorador`: a lista de métricas vira prop vinda do server component
  (`page.tsx`), o client component só importa `type` de `clientes-api.ts`.
