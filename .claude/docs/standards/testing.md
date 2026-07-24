# Standard de testes (frontend)

Derivado da suíte do módulo `design-system` (primeiro componente real testado), 2026-07-21.

## Cleanup entre testes não é automático sem `test.globals`

Achado real: `@testing-library/react` só registra `afterEach(cleanup)` sozinho quando o runner
expõe `afterEach` como global (`test.globals: true` no `vitest.config.ts`). Este projeto não usa
`globals: true` de propósito (import explícito de `describe`/`it`/`expect` é mais rastreável) —
então **sem um `afterEach(cleanup)` explícito em `vitest.setup.ts`, o DOM de um teste vaza pro
próximo** (múltiplos `render()` acumulam elementos, `getByRole` passa a achar mais de um
resultado). Já resolvido em `vitest.setup.ts` — não remover.

## `@/` (path alias) precisa de config dupla

`tsconfig.json` resolve `@/*` pro type-checking e o `eslint-config-next` entende sozinho, mas o
**Vitest não herda isso automaticamente** — precisa de `resolve.alias` explícito em
`vitest.config.ts` apontando pra `src/`. Sem isso, `tsc`/lint passam limpos e os testes falham
com "Failed to resolve import", confundindo (parece erro de código, é config de teste).

## Componente client (`"use client"`) testa igual componente comum

`ThemeToggle` usa `useState`/`useEffect` e manipula `document`/`localStorage` diretamente — não
precisa de mock nem de setup especial além do ambiente `jsdom` já configurado. Testar
comportamento observável (clique → atributo no documento, clique → valor no `localStorage`), não
implementação interna.

## `middleware.ts` precisa morar dentro de `src/`, não na raiz

Achado real (módulo `autenticacao`): projeto usa layout `src/app/`, mas `middleware.ts` foi
criado na raiz do projeto (ao lado de `package.json`) — convenção padrão do Next.js quando não
há `src/`. Resultado: teste unitário (chama `middleware()` direto) passava normal, mas no
servidor dev real o arquivo nunca compilava nem era listado no log — nenhuma rota protegida
redirecionava, `/dashboard` sem sessão devolvia 404 puro em vez de 307 pro `/login`. Só
apareceu via verificação real (`curl` contra o servidor rodando), teste unitário não detecta
esse tipo de erro de posicionamento de arquivo. **Regra**: quando o projeto usa `src/`, todo
arquivo de convenção especial do Next (`middleware.ts`, e por extensão qualquer outro que o
framework busca por nome fixo) vai dentro de `src/`, no mesmo nível de `app/`.

## Barra de progresso (`<span>` de preenchimento) precisa de `display: block`

Achado real (módulo `dashboard`): `DistribuicaoPorFaixa`/`DistribuicaoPorSegmento` usam um
`<span>` interno com `width`/`height`/`background` inline pra desenhar a barra preenchida.
Testes unitários (RTL) passavam normal — verificam texto e atributo `style`, não renderização
visual. Só o screenshot real (`/davi-ux:verify-ui` via CDP) mostrou as barras completamente
vazias: `<span>` é `inline` por padrão, e elemento inline **ignora `width`/`height`** — só
`background` de um inline sem conteúdo não tem área nenhuma pra pintar. Corrigido com
`display: block` no CSS module. **Regra**: todo elemento decorativo que depende de
`width`/`height` via `style` inline precisa garantir `display: block`/`inline-block` no CSS —
teste de RTL não pega esse tipo de bug (não renderiza layout real), só screenshot pega.

## Espaçamento visual (fieldset/campos) — outro tipo que só o screenshot pega

Achado real (módulo `clientes`): `ClienteForm` (14 campos em 2 `<fieldset>`) passava nos 4 testes
(RTL só verifica presença/valor de campo, não espaçamento) mas o screenshot real mostrou campos
colados uns nos outros (borda do input de um campo tocando o label do próximo) e dois botões de
ação (`Editar`/`Inativar cliente`) sem gap nenhum entre si. Corrigido com classe `.grupo`
(`display:flex; flex-direction:column; gap:1rem`) nos fieldsets e `.acoes` (`gap:1rem`) no
wrapper dos botões. **Regra geral, reforça a de cima**: qualquer decisão de espaçamento/layout
(gap, margin, padding) só é confirmada de verdade por inspeção visual — teste de comportamento
não substitui `/davi-ux:verify-ui` com screenshot real em nenhum componente com layout próprio.

## Recharts não mede texto SVG em jsdom — tabela acessível resolve os dois problemas

Achado real (expansão pós-roadmap): `ResponsiveContainer` do Recharts depende de
`ResizeObserver` e de `getBoundingClientRect` reais — jsdom não implementa nenhum dos dois
(todo elemento é 0×0), resolvido com mock global em `vitest.setup.ts`. Mesmo com o mock, o
`YAxis` de categoria (`type="category"`) não renderiza o texto do rótulo em jsdom — Recharts
mede o texto via `getBBox()`/`getComputedTextLength()` de SVG, que jsdom também não implementa,
então ele assume largura zero e nunca desenha o `<text>`. **Não vale a pena mockar mais
internals do Recharts pra forçar isso a aparecer.** Solução adotada: todo gráfico Recharts vem
acompanhado de uma tabela HTML equivalente (mesmos dados, `<caption>`/`<th scope="col">`) — com
classe `.sr-only` quando o gráfico já é a apresentação principal, ou visível quando faz sentido
mostrar os dois (`InadimplenciaPorSegmento` mantém a tabela visível ao lado do gráfico). Resolve
dois problemas de uma vez: teste consulta a tabela (estável, sem depender de renderização SVG),
e leitor de tela tem uma versão real dos dados (gráfico marcado `aria-hidden`), que ele nunca
interpretaria direito de qualquer forma.

## `LabelList` do Recharts precisa de margem calculada, não `right: 24` de cabeça

Achado real via screenshot (não pego por nenhum teste): barra horizontal com o maior valor do
dataset preenche quase 100% da largura do `BarChart`, e o rótulo de `<LabelList
position="right">` fica sem espaço — corta o último dígito na borda do card. `margin.right` do
`BarChart` precisa reservar espaço pro maior número possível formatado (aqui, até 6 dígitos —
carteira real tem 149.390 clientes), não um valor arbitrário pequeno. Regra: ao adicionar
`LabelList` numérico numa borda, calcular a margem a partir do maior valor esperado, e conferir
com screenshot real usando o dado de produção (não um fixture pequeno de teste, que nunca bateria
nesse limite).
