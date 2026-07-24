# Design system — Índice Real

Derivado via `/davi-ux:design-system` em 2026-07-21 e revisado em 2026-07-23 depois da aprovação
da nova home. Ferramenta interna para analistas e administradores de crédito: precisa continuar
precisa e densa onde há trabalho operacional, mas agora assume uma presença de produto mais
forte. A direção aprovada é **editorial analítica** — tipografia expressiva, composição
assimétrica, cor com função e painéis que lembram instrumentos de leitura.

O mundo visual continua sendo a **régua de crédito**: score de 300–850, cinco faixas, índices,
marcadores, linhas de referência e progressão de risco para confiança. A nova linguagem não
substitui esse conceito por decoração genérica; ela amplia o mesmo conceito para cabeçalhos,
cards, navegação e estados interativos.

## Princípios da direção visual aprovada

1. **Expressiva na entrada, eficiente no trabalho.** Home, login e cabeçalhos de rota podem ter
   escala tipográfica e composição mais marcantes. Tabelas, formulários e gráficos preservam
   densidade, legibilidade e velocidade de leitura.
2. **Cor é orientação.** Azul identifica a ação principal e a marca; as séries distinguem áreas
   ou categorias; as faixas continuam reservadas a risco e score. Cor nunca é ruído sem papel.
3. **Instrumento, não brinquedo.** Linhas, grades, índices, numeração e painéis constroem a
   identidade. Raio excessivo, ilustração genérica, efeitos “fofos” e sombras difusas não entram.
4. **Motion confirma hierarquia e interação.** Entradas curtas, stagger controlado e resposta
   de hover ajudam a compreender a composição. Não há loops decorativos nem animação de fatos.
5. **Uma linguagem, densidades diferentes.** Todas as páginas compartilham marca, tipografia,
   superfícies, estados e motion, mas não precisam copiar o hero da home.

## Marca

**Nome**: Índice Real. **Slogan**: "Um número. De verdade." — decidido em 2026-07-21, ver
histórico de curadoria na conversa que gerou este trecho (nome descartou opções mais literais —
Régua, Crivo, Gabarito — por soarem palavra de dicionário reaproveitada em vez de nome de marca).

"Índice" no sentido matemático — a marca de posição de um valor dentro de um conjunto — e "real"
no duplo sentido de verdadeiro/genuíno e da moeda. O produto entrega um valor (o score) puxado de
um conjunto de dados reais; o nome descreve exatamente isso, sem repetir "crédito" ou "score" no
próprio nome.

**Traço (logomark)**: "Í indexado" — um glifo só, não um ícone narrativo. Três blocos, zero
curva, sem raio: um pé/base (`--apagado`), a haste (`--tinta`), e um marcador quadrado no topo
(`--acento`) — a mesma peça que o "í" de índice e o "i" que a matemática usa em somatório indexado
(Σᵢ). Implementado em `src/components/Logomark.tsx` e em `src/app/icon.svg` (favicon, cores
fixas em hex porque favicon não tem acesso a `var(--token)`).

**Wordmark**: "ÍNDICE" em `--tinta`, peso 700; "REAL" em `--acento`, peso 500 — a cor já carrega o
trocadilho sem precisar de um segundo elemento gráfico. Em áreas compactas a logomark pode
aparecer sozinha; em navegação desktop há espaço para usar logomark + wordmark quando isso
melhorar reconhecimento sem comprimir os links.

## Cores — tokens semânticos, light + dark nativos (nunca "luz invertida")

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--papel` | `#F7F7F5` | `#14161A` | fundo geral |
| `--superficie` | `#FFFFFF` | `#1C1F26` | cards/painéis |
| `--tinta` | `#1A1D23` | `#E8E9EA` | texto principal |
| `--apagado` | `#6B7280` | `#9AA0AC` | texto secundário |
| `--acento` | `#1D4E89` | `#6699CC` | ação primária, foco, link |
| `--aviso` | `#B45309` | `#D99A3D` | atenção, não crítico |
| `--critico` | `#B91C1C` | `#E05252` | erro |
| `--linha` | `#D8D9D6` | `#2C3038` | borda/divisor |

Contraste verificado (fórmula WCAG real, não presumido) — todos os pares texto/fundo acima
passam AA (≥4.5:1) nos dois temas.

### Faixas de score — única cor com função de dado, não decoração

| Token | Light | Dark | Contraste light vs `--papel` |
|---|---|---|---|
| `--faixa-ruim` | `#B91C1C` | `#E05252` | 6.03 (AA) |
| `--faixa-regular` | `#C2662B` | `#E08A4D` | 3.74 (AA-large) |
| `--faixa-bom` | `#A68A1F` | `#D4B043` | 3.12 (AA-large) |
| `--faixa-muito-bom` | `#4C7A3D` | `#7BAF64` | 4.71 (AA) |
| `--faixa-excelente` | `#2D6B4F` | `#4FA184` | 5.88 (AA) |

**Regra**: `--faixa-regular` e `--faixa-bom` no tema claro só atingem 3:1 (limiar de objeto
gráfico não-textual da WCAG, não o de texto). Essas 5 cores são pra **swatch/indicador/borda**,
nunca pra texto direto — o nome da faixa ("Regular", "Bom"...) sempre renderiza em `--tinta`; a
cor da faixa só marca um ponto, chip de fundo com texto escuro, ou borda.

### Segmento (dashboard e simulador) — reaproveita a régua de score, não uma paleta nova

`DistribuicaoPorSegmento` (dashboard) e os 6 cards "Comece de um perfil" do simulador
(`CasosReaisSimulador.tsx`) usam a **mesma** cor por segmento — `corDoSegmento()` em
`src/lib/segmentos.ts`, único lugar que define o mapeamento, os dois pontos de uso só chamam a
função (nunca reescrevem o hex/token). Os 6 clusters (GMM, K=6 desde o retreino do ADR 0004/0005
do `-dados` — era K=4) têm leitura de risco real (ver comentário de `ORDEM_SEGMENTOS`), por isso
a cor vem de `--faixa-*` (a mesma régua do score) em vez de uma paleta categórica própria —
padronizar as duas telas era o pedido explícito ("usa as cores do simulador"), e como o
simulador já usava `--faixa-*` por segmento, o dashboard passou a usar a mesma função.

Só existem 5 tokens `--faixa-*` pra 6 segmentos — os dois de menor risco (0 e 1, os únicos com
perfil "renda não informada") dividem `--faixa-excelente`; risco entre eles fica diferenciado
por nome/descrição no card, não por cor exclusiva (decisão registrada no ADR 0005 do `-dados`,
não inventar uma 6ª cor fora da régua pra resolver isso).

Desde o ADR 0007 do `-dados`, o índice do cluster é canônico por risco real ascendente (0 =
sempre menor risco, 5 = sempre maior) — antes disso o índice mudava de ordem a cada retreino
mesmo sem mudança de cluster de verdade (achado real: capar idade em 80, ADR 0006, trocou 4 dos
6 índices na mesma sessão, sem mudar nenhum cluster). A tabela abaixo só é estável agora por
causa dessa reordenação — não assumir que o número volta a mudar sozinho a cada retreino.

| Segmento | Nome | Token |
|---|---|---|
| 5 | No vermelho | `--faixa-ruim` |
| 4 | Endividamento crítico | `--faixa-regular` |
| 3 | Aperto no orçamento | `--faixa-bom` |
| 2 | Cliente de confiança | `--faixa-muito-bom` |
| 1 | Pagador tranquilo | `--faixa-excelente` |
| 0 | Pagador exemplar | `--faixa-excelente` |

### Séries analíticas — identidade sem significado de status

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--serie-1` | `#1D5A9E` | `#5B93D6` | bucket 1 |
| `--serie-2` | `#96731A` | `#B78A2E` | bucket 2 |
| `--serie-3` | `#0D8F7A` | `#1FAE7A` | bucket 3 |
| `--serie-4` | `#7A3B69` | `#B366A0` | bucket 4 |
| `--serie-5` | `#4F962C` | `#559933` | bucket 5 |

Esses tokens distinguem séries ou áreas analíticas quando a cor ajuda a reconhecer o domínio.
Eles não transformam cada barra de uma mesma medida em uma categoria diferente. Histogramas e
distribuições de uma única métrica usam uma única hue (`--serie-4` no card de variáveis), com
rótulo e valor diretos; score e segmento usam exclusivamente suas cores semânticas. Não criar
efeito arco-íris em buckets sequenciais nem inventar uma 6ª hue sem validar contraste e CVD.

### Mecanismo do tema

`data-theme="light"|"dark"` no `<html>`, aplicado por script inline no `<head>` **antes da
primeira pintura** (evita flash de tema errado). Ordem de resolução: preferência salva em
`localStorage` → `prefers-color-scheme` do sistema → `light` como fallback final.

### Tons derivados e gradientes

`color-mix()` pode criar fundos, bordas e estados tonais a partir dos tokens existentes. Isso
não autoriza uma nova cor: a origem semântica precisa continuar explícita.

- Fundo tonal de card: normalmente 5–12% do token sobre `--superficie`.
- Borda tonal: normalmente 25–40% do token sobre `--linha` ou transparente.
- Gradiente permitido: transição curta entre um tom derivado e `--superficie`/`--papel`, para
  dar profundidade a hero, painel de destaque ou estado selecionado.
- Gradiente proibido: arco-íris, múltiplas cores sem semântica, texto em gradiente, fundo que
  comprometa leitura ou qualquer hex solto dentro do componente.
- As cinco faixas podem aparecer juntas somente quando representam a régua/escala de risco.

## Tipografia — 3 papéis, uma família só

Revisado em 2026-07-23: a dupla original (Space Grotesk + Inter) foi trocada por soar genérica
demais — é literalmente a combinação mais repetida em ferramentas/templates gerados por IA (v0,
SaaS boilerplate), o oposto do que uma marca própria precisa. A troca também é o momento de
corrigir tracking negativo excessivo (-0.05 a -0.08em) que sobrava de ajuste feito para as formas
largas do Space Grotesk — nenhum título deveria passar de ~-2%, ver `references/type_scale_ratios.md`
da skill `davi-frontend:typography-scale`.

| Papel | Fonte | Uso |
|---|---|---|
| Display | IBM Plex Serif | títulos de página/seção — voz editorial sem sair do registro técnico (é a serifa "de engenharia" da IBM, não uma serifa quente/decorativa; não é Fraunces do ti-helpdesk) |
| Texto | IBM Plex Sans | interface (labels, botões, corpo) — legibilidade em densidade alta |
| Dados | IBM Plex Mono, `font-variant-numeric: tabular-nums` | números, ids, timestamps, **e o dígito grande do score** (é dado, não título, mesmo sendo o maior elemento da tela) |

As 3 fontes são uma família só (IBM Plex) em 3 otimizações — serifada no display, grotesca na
interface, monoespaçada no dado — em vez de 3 fontes de origens/desenhistas diferentes coladas.
Isso é o que dá coerência (voz única reconhecível) sem cair em geometric-sans genérico: a família
nasceu como o sistema tipográfico interno da IBM, desenhada para instrumentação técnica/dados —
alinhado com o conceito de "régua de crédito" e "instrumento, não brinquedo" antes mesmo da
escolha de peso ou tamanho. Efeito colateral bom: `--fonte-dados` deixa de ser a peça solta do
trio (antes vinha de uma família totalmente diferente das outras duas) e passa a ser parte do
mesmo sistema.

`font-weight` disponível via `next/font/google`: 400/500/600/700 em Plex Serif e Plex Sans
(pesos estáticos, não variável — mesma lógica que já valia para Plex Mono). Título de rota/seção
usa 600–700; corpo usa 400, ação secundária de peso usa 500–600.

**Tracking do display**: nunca abaixo de aproximadamente -0.02em, mesmo no hero. Diferente do
geométrico largo do Space Grotesk, a serifa colide/perde legibilidade com tracking muito negativo.
Escala de referência usada nesta revisão — herói (~5rem): -0.018em; título de seção
(~2–2.5rem): -0.01 a -0.012em; título de card (~1.5–1.8rem): -0.005 a -0.008em. Tracking positivo
de sobretítulo/uppercase (`--fonte-dados`, 0.06–0.1em) não muda — é independente da fonte de
display.

Escala fluida `clamp()` em `rem`: `--fonte-tamanho-xs` (0.75rem) até `--fonte-tamanho-score`
(2.5–3.5rem, exclusivo do número do score).

### Hierarquia editorial

- **Hero de entrada:** `clamp(2.65rem, 6vw, 5.25rem)`, line-height próximo de 1 e tracking
  negativo. Restrito à home/login ou abertura equivalente; nunca em tabela ou modal.
- **Título de rota:** usa `--fonte-tamanho-2xl`, podendo crescer moderadamente quando houver
  uma introdução editorial. Uma página tem um único `h1`.
- **Título de seção:** entre `--fonte-tamanho-xl` e `--fonte-tamanho-2xl`, conforme hierarquia.
- **Título de card:** `--fonte-tamanho-lg`, peso 600, sem competir com o título da rota.
- **Sobretítulo/índice:** IBM Plex Mono, uppercase, tracking de 0.08–0.1em e tamanho
  `--fonte-tamanho-xs`. Serve para orientar ("CARTEIRA · VISÃO GERAL"), não para repetir o `h1`.
- Textos longos usam line-height de 1.5–1.7 e largura controlada; não atravessam o viewport.

## Ritmo e espaçamento

A unidade é 0.25rem. Valores preferenciais: `0.25`, `0.5`, `0.75`, `1`, `1.25`, `1.5`, `2`,
`2.5`, `3` e `4.5rem`. Não é necessário transformar cada valor em variável; é necessário
permanecer nessa escala e repetir o mesmo papel com o mesmo ritmo.

- Padding de página: `clamp(1.5rem, 3vw, 3rem)` no desktop, mínimo de `1rem` no mobile.
- Distância entre grandes blocos de rota: `clamp(2.5rem, 5vw, 4.5rem)` em composição editorial;
  `1.5–2rem` em telas operacionais densas.
- Padding de card: `1.25–1.75rem`; painéis de destaque podem chegar a `2rem`.
- Gap entre controles relacionados: `0.5–0.75rem`; entre grupos: `1–1.5rem`.
- Texto não deve encostar em borda decorativa, barra semântica ou linha geométrica.
- Espaço vertical expressa agrupamento; não usar borda em todo agrupamento que um `gap` resolve.

## Geometria e composição

**Raio zero, sem sombra difusa, profundidade só por borda de 1px (`--linha`).** Régua é reta e
precisa, não decorativa — mesma lógica de "instrumento, não enfeite" chegada por um caminho de
domínio próprio (crédito/régua), não copiada do ti-helpdesk (hospital/prancheta).

Elemento de assinatura: `<RegraDeScore>` — escala graduada horizontal com as 5 faixas e um
indicador na posição do score do cliente. Componente real e reutilizável (dashboard, lista de
clientes, simulador todos mostram score), não decoração — implementado no primeiro módulo que
precisar dele, não neste (esta skill deriva o standard, não implementa componente).

### Estrutura de página

Páginas autenticadas usam a mesma largura de conteúdo (`.moldura`) e uma composição em camadas:

1. **Abertura:** índice/sobretítulo opcional, `h1`, descrição curta e ações da rota.
2. **Resumo/contexto:** KPIs, status, régua ou explicação que ajude a ler o restante.
3. **Área de trabalho:** filtros, tabs, formulário, tabela ou gráficos.
4. **Feedback:** vazio, carregando, erro e sucesso dentro da área a que pertencem.

O fundo pode receber uma ou duas linhas geométricas discretas derivadas de `--acento`, desde que
não atravessem texto interativo nem virem padrão repetido em todo card. A home pode ser mais
cenográfica; rotas operacionais usam esse recurso com parcimônia.

### Responsividade

- Referências de verificação: 1280px (desktop de trabalho) e 390px (mobile estreito).
- Grids de três colunas viram uma coluna quando o conteúdo cair abaixo de aproximadamente 20rem
  úteis por card; não espremer texto só para preservar quantidade de colunas.
- Abertura em duas colunas vira uma coluna antes de o painel secundário ficar menor que 21rem.
- Tabelas preservam semântica e podem usar contêiner com rolagem horizontal explícita; a página
  inteira não pode criar overflow.
- Ações empilham e ocupam largura disponível no mobile quando isso melhora o alvo de toque.
- Conteúdo precisa permanecer utilizável com zoom de 200%, não apenas “caber” no screenshot.

### Superfícies e cards

- Superfície padrão: `--superficie`, borda de 1px `--linha`, raio zero.
- Card de ação pode ter uma barra superior de 3px, placa de ícone tonal, índice numérico e um
  tom derivado no hover.
- Card de dados não levanta no hover se não for clicável.
- Card clicável pode mover no máximo `translateY(-4px)` e trocar borda/fundo usando os tokens de
  motion. A área inteira deve ser um único link/botão, sem controles interativos aninhados.
- Painel selecionado usa borda, marcador ou barra de cor; não depende somente da mudança de
  fundo para comunicar seleção.
- Divisores internos são linhas de 1px. Evitar caixas dentro de caixas sem necessidade real.

### Visualização de dados e dashboards

- Dashboard operacional começa por KPIs e segue diretamente para os cards analíticos. Títulos
  numerados de seção e parágrafos narrativos só entram quando mudam de fato a tarefa; não servem
  para repetir o título dos cards logo abaixo.
- Uma orientação de interação compartilhada aparece uma única vez no contexto da página. Não
  repetir “clique/selecione para filtrar” no rodapé de cada gráfico.
- Até aproximadamente 8 categorias, preferir barras horizontais com categoria e valor direto.
  Legenda só entra quando o rótulo direto for inviável ou houver mais de uma série sobreposta.
- Barras comparáveis usam trilho comum e a mesma escala. Percentuais de risco usam 0–100%;
  métricas de modelos usam a escala contratual da medida; eixos truncados precisam ser explícitos.
- Uma medida usa uma hue. Múltiplas cores só aparecem quando cada cor carrega categoria ou estado
  semântico real, como faixa de score, segmento ou proteção/risco.
- Tooltip complementa; nunca é a única forma de descobrir o valor. Todo gráfico mantém tabela
  equivalente para leitores de tela e `isAnimationActive={false}` para fatos numéricos.

### Iconografia

- Ícones de interface são SVGs de traço, `viewBox="0 0 24 24"`, `stroke: currentColor`,
  terminação quadrada e espessura visual consistente.
- Ícones decorativos recebem `aria-hidden="true"`; ações só com ícone exigem `aria-label`.
- Um ícone usado em duas ou mais áreas vira componente compartilhado. SVG específico de uma
  única rota pode ficar co-localizado.
- Emoji não é iconografia de produto.

### Navegação global

- A logomark sempre leva para `/`; na home recebe `aria-current="page"`.
- Alvo mínimo da marca e de ações só com ícone: 44×44px.
- Link ativo combina texto em `--tinta` com indicador em `--acento`; nunca depende só de cor.
- Navbar deve preservar uma linha no desktop. No mobile pode reorganizar links, mas não pode
  ocultar o acesso ao usuário nem criar overflow horizontal silencioso.
- O menu do usuário é uma superfície elevada por borda, não por sombra: identidade no topo,
  ações agrupadas, tema como controle explícito e saída visualmente separada como ação crítica.

## Botões e links de ação

Achado real pós-roadmap: `<button>` sem classe própria herdava o cinza nativo do navegador em
7+ lugares (forms de cliente/simulador/perfil/usuário, modal de confirmação) — destoava da régua
de crédito e foi um dos pontos citados como "feio". Resolvido em duas camadas:

- **Base global** (`globals.css`, seletor `button`): todo botão sem classe própria já sai com
  borda 1px (`--linha`), raio zero, fundo `--superficie` — nunca o cinza nativo.
- **`.botao` local por CSS module**: ação primária de cada tela (submit de form, confirmar do
  modal) usa fundo `--acento`/texto `--papel`, declarado no module da própria tela (mesmo
  padrão de duplicação pequena já usado em `.vazio`/`.link` entre modules).

Regra: todo `<button>` novo nasce com a base global de graça; só ganha `.botao` quando é a ação
primária/afirmativa da tela (nunca em ação secundária como "Cancelar").

- Ação primária: fundo `--acento`, texto de contraste e seta/ícone opcional.
- Ação secundária: `--superficie`, borda `--linha`; hover troca borda/texto para `--acento`.
- Ação destrutiva: transparente ou superfície neutra com texto/borda `--critico`; fundo crítico
  somente no hover/confirmado.
- Links de ação usam verbo e destino claros. Seta é reforço visual, não substitui o texto.
- Loading preserva largura do botão e usa `disabled`; não desloca a composição.

## Feedback global

- Estados integrais de rota usam `EstadoRota`: índice contextual, título orientado à recuperação
  e descrição objetiva. `carregando` expõe `role="status"`/`aria-busy`; `erro` usa anúncio
  assertivo e oferece “Tentar de novo” quando existe `reset`.
- Loading de rota pode animar apenas marcadores abstratos e linhas de preparação; conteúdo
  numérico e gráficos continuam estáticos. Em `prefers-reduced-motion`, esses marcadores param.
- `Modal` é o único primitivo de overlay: bloqueia scroll, move e contém o foco, restaura o
  elemento disparador, fecha com `Escape`/backdrop e usa `aria-labelledby`/`aria-describedby`.
- Confirmação destrutiva inicia o foco em “Cancelar”, comunica criticidade por sinal, texto e cor
  e mantém a ação irreversível explicitamente nomeada.
- Toasts apresentam tipo textual + símbolo, usam `status` para informação/sucesso e `alert` para
  erro, podem ser dispensados e nunca bloqueiam interação com o restante da tela.

## Motion

Motion aqui é **hierarquia, feedback e expressão controlada de marca**. A abertura de uma rota
pode revelar blocos em sequência; elementos clicáveis respondem a hover/press; a régua confirma
seleção. Nada fica se movendo enquanto a pessoa trabalha. **Dado numérico nunca anima seu
próprio valor** (altura de barra, número do score) — ele é um fato, aparece direto; o que anima
é a ênfase ao redor dele (opacidade, entrada/saída, borda e cor de estado). A logomark continua
sendo a única coreografia longa — ver seção específica abaixo.

### Tokens

| Token | Valor | Uso |
|---|---|---|
| `--motion-rapida` | 120ms | Micro-feedback: hover, toggle de estado (pill ativo, `aria-pressed`), saída de elemento |
| `--motion-padrao` | 180ms | Transição de conteúdo: fade de opacidade (barra esmaecida no filtro), cross-fade de número ao trocar |
| `--motion-entrada` | 240ms | Elemento novo entrando na tela: chip de filtro, modal, toast |
| `--motion-curva-entrada` | `cubic-bezier(0.16, 1, 0.3, 1)` | Decelera sem overshoot — "chega e assenta", nunca ultrapassa o alvo |
| `--motion-curva-saida` | `cubic-bezier(0.4, 0, 1, 1)` | Acelera pra sair — sai rápido, não demora se despedindo |

Tokens declarados em `globals.css`. `prefers-reduced-motion` já é tratado num único lugar
global (regra existente no fim do arquivo, zera `transition-duration`/`animation-duration` de
qualquer elemento). Transições comuns só usam os tokens normalmente; os primitivos de entrada
abaixo concentram o único `no-preference` adicional, para o atraso do stagger também desaparecer
por completo quando a pessoa reduz movimento.

### Primitivos de entrada

Entradas de conteúdo usam `MotionReveal` e `MotionStagger`, ambos em
`src/components/MotionReveal.tsx`. As keyframes, os intervalos curtos entre etapas e o respeito
a `prefers-reduced-motion` ficam centralizados no CSS module do componente — uma página nunca
redeclara `@keyframes` pra repetir esse comportamento.

- `MotionReveal`: bloco lógico que acabou de entrar ou substituir outro conteúdo; `rise` é o
  padrão, `fade` evita movimento espacial em dados densos e `emphasis` fica restrito a marcadores
  auxiliares (nunca ao valor do dado).
- `MotionStagger`: grades de cards relacionados; anima apenas os filhos diretos em intervalos de
  40ms, sem exigir configuração em cada item.
- O elemento semântico é escolhido por `as` (`header`, `section`, `form` etc.), evitando uma
  `<div>` extra quando o próprio bloco já tem significado.
- Nunca envolver a raiz inteira da rota nem criar overlay entre páginas. Os primitivos revelam
  blocos independentes depois que o Next já concluiu a navegação; não são uma transição de rota.

### Onde anima

| Interação | O quê | Token |
|---|---|---|
| Filtro do dashboard (barra clicada) | Barras não-selecionadas esmaecem; a selecionada confirma com contorno e o card usa borda de acento | `--motion-padrao` |
| Chip "Filtrando por: X" | Entra com fade (sem slide/scale — raio zero não pede movimento espacial) | `--motion-entrada` in / `--motion-rapida` out |
| Resumo/métricas recalculando | Cross-fade do número antigo pro novo (opacity, não count-up) | `--motion-rapida` |
| Gráfico aguardando filtro | Conteúdo permanece visível e esmaece durante a busca; nunca some abruptamente nem anima o tamanho das barras | `--motion-padrao` |
| Pill de métrica ativo | Fundo/cor de texto | `--motion-rapida` |
| Hover em elemento clicável | Opacidade/cor | `--motion-rapida` |
| Card de navegação clicável | Borda/fundo + deslocamento vertical de até 4px | `--motion-padrao` |
| Régua ornamental de abertura | Segmentos entram em stagger, uma única vez | `--motion-entrada` |
| Cabeçalho de página | Blocos independentes entram via `MotionReveal` | `--motion-entrada` |
| Modal (abrir/fechar) | Fade | `--motion-entrada` in / `--motion-rapida` out, curva-saída |
| Toast | Fade | `--motion-entrada` in / `--motion-rapida` out |
| Botão em loading | Opacidade do botão (texto troca sem animação — evita layout thrash) | `--motion-rapida` |
| Foco em campo/botão (`outline`) | **Nunca anima** — precisa aparecer instantâneo pra quem navega por teclado | — |
| Navegação entre rotas | **Nunca anima** — sem overlay de transição, Next.js já troca instantâneo | — |
| Barra/valor de gráfico (Recharts) | **Nunca anima o valor em si** — `isAnimationActive={false}` continua correto | — |

### Nunca (motion de UI)

- Bounce, spring, elastic — nenhuma curva com overshoot
- Duração > 240ms em transição comum de UI
- Loop decorativo (parallax contínuo, ícone pulsando, brilho infinito, marquee)
- Animar o valor representado por um gráfico (altura de barra, contador numérico subindo)
- Transição de página inteira / overlay de loading entre rotas
- Fade no `outline` de foco
- Animar `width`, `height`, `top` ou `left` quando `transform`/`opacity` resolvem o mesmo efeito

### Motion da logomark — a única exceção com licença criativa

A logomark ("Í indexado", ver seção Marca) é o único elemento com motion além do funcional —
roteiro "o índice encontra a posição", ~1,6s. Implementado em `src/components/Logomark.tsx` via
`anime.js` (`createTimeline`), não pelos tokens `--motion-*` acima — duração e coreografia
próprias, sem virar precedente pro resto da UI. Replaya a cada troca de rota (`usePathname` como
dependência do efeito) — o `Nav` não remonta na navegação interna do Next (mesmo layout, só
troca de página), então sem isso o roteiro só tocaria uma vez, no primeiro carregamento.

| Fase | O quê | Duração |
|---|---|---|
| Base | Eixo se desenha de dentro pra fora (`scaleX`) | 350ms |
| Haste | Sobe, pausa pra "conferir", completa até o topo (3 estágios) | 500ms, começa aos 250ms |
| Marcador | Entra de longe e desvia antes de encaixar na posição | 450ms, começa aos 750ms |
| Chegada | Pulso no marcador + anel de confirmação se expandindo | 450ms, começa aos 1200ms |

Hover na navbar dispara só um nudge no marcador (`scale` 1→1.08→1, 150ms) — não repete a
sequência inteira. `LoginMarca.tsx` usa o callback `aoPousar` do `Logomark` pra sincronizar um
brilho (CSS puro, não anime.js) passando pela régua de faixas no exato instante da chegada —
mesma divisão de responsabilidade: anime.js só na logo, o resto da plataforma em CSS.

## Nunca

- Gradiente multicolorido sem semântica, glassmorphism
- `dark:` do Tailwind — tema é por token (`--var`), nunca por classe condicional
- Sombra difusa — profundidade é sempre borda de 1px
- Cor fora da paleta de tokens (`--faixa-*` incluída — nunca outro tom de vermelho/verde solto)
- `outline: none` sem substituto visível de foco
- Converter toda página operacional em landing page
- Esconder informação essencial atrás de hover sem alternativa por foco/toque

## Acessibilidade

- `prefers-reduced-motion: reduce` zera toda animação/transição — tokens de motion (ver seção
  "Motion" acima) e a logomark (anime.js) respeitam a mesma media query
- Foco sempre visível — `outline` usando `--acento`, nunca removido sem substituto
- Contraste AA verificado nos pares texto/fundo (ver tabelas acima); faixas de score seguem a
  regra de uso gráfico, não textual
- Layout sem overflow horizontal em 390px e com zoom de 200%
- Áreas clicáveis de ícone com pelo menos 44×44px
- Estados selecionado, erro e sucesso não dependem apenas de cor

## Microcopy

Voz ativa. Nomes pelo que o usuário controla ("Cadastrar cliente", não "Executar POST").
Mensagem de erro diz o que aconteceu e como resolver — nunca só "erro". Tela vazia é convite à
ação, não aviso de ausência. Mesmo verbo do botão que disparou a ação aparece no toast de
confirmação.

## Disciplina

- Nunca hex solto em componente — sempre `var(--token)`
- `color-mix()` deriva tons, não cria paleta paralela
- Extrair primitivo só quando o padrão se repete em 2+ lugares
- CSS global contém tokens, reset e estruturas realmente globais; composição específica fica no
  CSS Module da rota ou do componente
- Não copiar inventário de UI de outro projeto — dashboard ≠ CRUD ≠ simulador, cada tela usa os
  tokens mas não herda componente pronto de outro contexto
- Toda migração visual é validada em light/dark, desktop/mobile e reduced motion antes de passar
  para a próxima rota
