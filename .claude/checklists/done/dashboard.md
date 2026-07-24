---
feature: dashboard
status: done
created: 2026-07-21
---

# Dashboard: analytics de carteira (consome `-dados`, somente leitura)

Quarto módulo do roadmap. Server Component fetch direto em `-dados` (sem BFF/route handler —
`-dados` não tem autenticação própria, é serviço público de leitura consumido só internamente).
Rota protegida pelo middleware do módulo `autenticacao`.

## Tarefas
- [x] `src/lib/dados-api.ts` + teste (3 testes) — `getCarteira()`/`getInadimplenciaPorSegmento()`,
      mapeia snake_case da API pra camelCase, lança erro em resposta não-ok (vira `error.tsx`)
- [x] `src/lib/faixas.ts` + teste (5 testes) — ordem canônica da régua de crédito
      (Ruim→Regular→Bom→Muito Bom→Excelente) e mapeamento faixa→token de cor
- [x] `src/app/dashboard/dashboard.module.css` — CSS Module (primeira tela com layout visual
      real; decisão "sem Tailwind" do scaffold seguida, CSS puro nativo do Next)
- [x] `ResumoCarteira`, `DistribuicaoPorFaixa`, `DistribuicaoPorSegmento`,
      `InadimplenciaPorSegmento`, `DashboardView` — cada um com teste (happy path + estado vazio
      onde aplicável)
- [x] `page.tsx` (Server Component, `Promise.all` das 2 chamadas) + teste mockando `dados-api`
- [x] `loading.tsx` / `error.tsx` — convenção nativa do App Router pros estados carregando/erro
- [x] `.claude/docs/standards/testing.md` — achado novo documentado

## Quality gates
- [x] Testes passando — `npm test -- --run`: 33/33 (15 arquivos)
- [x] `npx tsc --noEmit` e `npm run lint` limpos
- [x] Verificado de ponta a ponta contra `-dados` real (uvicorn, gold.parquet real de 149.390
      clientes) e `-clientes` real (sessão via login):
      1. `GET /dashboard` sem sessão → `307` pro `/login` (middleware, reconfirmado)
      2. `GET /dashboard` com sessão → `200`, dados reais renderizados (149.390 clientes, score
         médio 580, 5 faixas, 4 segmentos, taxas de inadimplência de 1,7% a 34,8%)
      3. Screenshot real via CDP (claro + escuro) — achou e corrigiu bug visual real (ver Notas)
      4. Estado de erro real: gold.parquet renomeado temporariamente → `-dados` responde `503` →
         `error.tsx` renderiza mensagem amigável + botão "Tentar de novo" (confirmado via
         screenshot, HTML puro via curl não mostra pois o error boundary só resolve no client)
      5. gold.parquet restaurado, `200` confirmado de novo antes de seguir
- [x] `/davi-core:retro` — roda no fechamento do roadmap inteiro

## Notas
- **Bug visual real achado só no screenshot**: as barras de `DistribuicaoPorFaixa`/
  `DistribuicaoPorSegmento` usam um `<span>` de preenchimento com `width`/`background` inline —
  `<span>` é `inline` por padrão e ignora `width`/`height`, então as barras apareciam
  completamente vazias (cinza, sem cor nenhuma) apesar do teste unitário passar (RTL não
  renderiza layout de verdade, só verifica atributos). Corrigido com `display: block` no CSS
  Module. Documentado em `testing.md` como regra geral pra qualquer barra/indicador futuro
  (`clientes`, `simulador` vão reusar o mesmo padrão visual da régua de crédito).
- Segmentos (0-3, saída do GMM) ainda não têm nome de negócio definido (`CLAUDE.md` do
  `-dados` já registra isso) — UI mostra "Segmento N" cru de propósito, não inventa rótulo.
- `<RegraDeScore>` (elemento de assinatura do design system, indicador de posição num único
  score) não nasceu aqui — o dashboard mostra *distribuição agregada* entre faixas, não um score
  individual. Meu candidato natural continua sendo `clientes` (cada linha tem 1 score) ou
  `simulador` (1 score simulado) — decisão adiada de novo, registrada pra não esquecer.
