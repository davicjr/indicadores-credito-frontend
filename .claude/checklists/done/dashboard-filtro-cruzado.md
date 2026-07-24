---
feature: dashboard interativo com filtro cruzado
status: done
created: 2026-07-22
---

# Dashboard interativo com filtro cruzado

Cross-repo (`indicadores-credito-clientes` + `indicadores-credito-frontend`). Clicar numa barra
de "Distribuição por faixa de score" ou "Distribuição por segmento" isola aquele recorte da
carteira — resumo, os 2 gráficos de distribuição e as métricas recalculam pro recorte, sem sair
do `/dashboard`. Filtro reflete na URL. Requisito completo em `docs/requisitos.md`. Estrutura
aprovada no `/davi-core:architect` (arquiteto propôs: `DashboardView` vira orquestrador único
client-side; `DistribuicaoMetricaClientes` perde o fetch próprio e vira componente puro).

**Fora de escopo** (adiado explicitamente pelo usuário): gauge de score arrastável como filtro
de range contínuo — ver `.claude/checklists/active/decisoes-produto.md`.

## Tarefas

### `indicadores-credito-clientes`
- [x] `ClienteRepository.buscarAtivos(faixa, segmento)` — mesma query null-safe de `buscar()`
- [x] `ClienteService.resumo(faixa, segmento)` / `distribuicaoPorMetrica(metrica, faixa, segmento)`
- [x] `ClienteController` — `@RequestParam(required = false)` faixa/segmento nos 2 endpoints
- [x] `GlobalExceptionHandler` — `MethodArgumentTypeMismatchException` → 400 `parametro_invalido`
- [x] Testes: filtro por faixa, por segmento, sem correspondência (zero, não erro), segmento
      não-numérico (400)

### `indicadores-credito-frontend`
- [x] `src/lib/filtro-carteira.ts` (tipo `FiltroCarteira`, parse/serialize de query, `rotuloFiltro`)
- [x] `clientes-api.ts` — `getResumoClientes`/`getDistribuicaoMetricaCliente` aceitam filtro
- [x] `src/app/api/clientes/resumo/route.ts` (novo — não existia BFF pro resumo)
- [x] `src/app/api/clientes/distribuicao/[metrica]/route.ts` repassa query string
- [x] `src/app/dashboard/page.tsx` lê `searchParams`, monta filtro inicial
- [x] `DashboardView.tsx` vira `"use client"`, orquestrador único de estado/fetch, sync com URL
- [x] `DistribuicaoPorFaixa.tsx` / `DistribuicaoPorSegmento.tsx` — perdem navegação pra
      `/clientes`, ganham clique in-page + esmaecimento das barras não selecionadas + `<button>`
      acessível na tabela sr-only (paridade teclado/mouse). Props `filtroAtivo`/`onSelecionar`
      opcionais — `/modelo` continua reaproveitando os mesmos componentes só leitura.
- [x] `DistribuicaoMetricaClientes.tsx` — vira componente puro (sem fetch próprio)
- [x] `FiltroCarteiraChip.tsx` (novo) — chip "Filtrando por: X ×"
- [x] `graficos.tsx` — nova constante `OPACIDADE_ESMAECIDA`

## Quality gates
- [x] Testes passando nos 2 repos (94/94 backend; `tsc --noEmit` limpo + 71 arquivos/227 testes
      frontend)
- [x] `/davi-core:review` — sem risco de segurança novo (query parametrizada via `@Param` do JPA,
      mesma autorização de `/clientes/**`; `segmento` não-numérico agora responde 400 em vez de
      500, inclusive no `GET /clientes` pré-existente que tinha o mesmo parâmetro)
- [x] Verificado de ponta a ponta — backend real via curl (`?faixa=Ruim`: 32→18 clientes,
      distribuição por segmento recalculada 9+9=18); frontend real logado (cookie de sessão
      real): clique em "Ruim" filtra tudo (resumo 32→18, score 562→532, métricas idade
      recalculadas), clique em "Cliente de confiança" substitui o filtro (não combina), clicar de
      novo limpa (toggle), deep-link `/dashboard?faixa=Ruim` renderiza já filtrado via SSR,
      `/modelo` (mesmos componentes, sem filtro) continua íntegro
- [x] `/davi-core:retro` — ver Notas

## Notas

**Achado real durante a verificação de ponta a ponta**: `DistribuicaoMetricaClientes.tsx`
(client component) importava `METRICAS_CLIENTES` como valor de runtime direto de
`clientes-api.ts`, o que arrastava `session.ts`/`next/headers` (server-only) pro bundle do
cliente e quebrava o build — corrigido numa sessão anterior replicando o padrão já usado em
`MetricasExplorador` (lista de métricas vira prop vinda do server). Reforça a mesma armadilha
pro filtro: qualquer novo helper client-safe precisa ser checado antes de virar import direto
num client component.

**Decisão de arquitetura**: em vez de cada gráfico buscar seu próprio dado (padrão que
`DistribuicaoMetricaClientes` já usava antes desta feature), `DashboardView` virou o único
orquestrador de fetch — um `Promise.all` cobrindo os 2 endpoints (resumo já bundla faixa+
segmento+totais numa chamada só) sempre que o filtro ou a métrica mudam. Evita dois mecanismos
de busca competindo pelo mesmo estado quando o filtro é setado por um card diferente do que
está sendo exibido.

**Bug real de corrida encontrado e corrigido**: o efeito que sincroniza o filtro com a URL
(pra sobreviver a F5/voltar do navegador) dependia do objeto `searchParams` do
`useSearchParams()`, cuja referência pode mudar a cada render sem o conteúdo mudar — isso
disparava o efeito à toa em todo clique e sobrescrevia o `setFiltro` otimista do handler antes
da URL real (assíncrona) confirmar a mudança. Corrigido trocando a dependência pra
`searchParams.toString()` (valor primitivo, estável). Only exposto porque o teste de interação
tinha um mock de `useSearchParams` que retornava uma instância nova a cada chamada — mas o
efeito era genuinamente frágil mesmo em produção (dependia de estabilidade de referência que o
Next não garante).

**Trade-off aceito, não resolvido**: `router.replace` pra refletir o filtro na URL faz o Next
re-executar o Server Component de `page.tsx` (confirmado via log: `GET /dashboard?faixa=Ruim`
aparece a cada clique), recalculando `getResumoClientes`/`getDistribuicaoMetricaCliente` no
servidor — cujo resultado é descartado, porque o `useState` de `DashboardView` já foi atualizado
pelo fetch client-side. É trabalho duplicado (RSC navigation payload + fetch REST direto), mas
inofensivo com 32 clientes reais. Registrar como candidato a revisão se a carteira crescer
muito: opção real seria mover tudo pro padrão 100% server-driven que `/clientes` já usa
(sem `useState` local, `router.replace` como único mecanismo), ao custo de metricaSelecionada
também precisar virar query param.

Working tree já tinha, em paralelo, uma simplificação visual dos gráficos de barra em andamento
(remoção de grade/eixo numérico redundante, `TooltipGrafico` compartilhado, `TickFaixaDuasLinhas`)
— não deu pra separar do `OPACIDADE_ESMAECIDA` desta feature sem quebrar o build (diff de
`graficos.tsx` veio como um hunk só), então foi commitado junto, já testado e íntegro.
