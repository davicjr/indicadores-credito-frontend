# Standard de frontend

Derivado via `/davi-ux:frontend-standards` em 2026-07-21 e atualizado em 2026-07-23 para reger a
migração visual incremental da plataforma. A aplicação já possui rotas reais, BFF, autenticação,
gráficos, formulários e uma suíte ampla; reforma visual não autoriza reescrever comportamento.

## 1. Produto e experiência

O usuário é interno — analista ou administrador de crédito autenticado. A interface precisa
equilibrar duas necessidades:

- entendimento rápido do contexto e do risco;
- eficiência em tarefas repetidas de consulta, simulação, cadastro e administração.

A nova home define a linguagem visual, não a densidade de todas as telas. Cada rota preserva seu
fluxo principal e aplica a hierarquia descrita em `design_system.md`.

## 2. Fontes de verdade

- Visual, tokens, composição, motion e acessibilidade: `design_system.md`.
- Configuração e achados da suíte: `testing.md`.
- Limites de decomposição: `.claude/memory/project_limites.md`.
- Contratos de dados e regras de negócio: backends `-clientes` e `-dados`; o frontend não
  recalcula score, segmento ou decisão.

Se código e standard divergirem durante a migração, a divergência deve ser resolvida na rota em
trabalho, não replicada para a próxima.

## 3. Arquitetura de componentes

### Localização

- `src/components/`: componente usado por duas ou mais rotas ou pertencente ao shell global.
- `src/app/<rota>/`: componente e CSS específicos daquela rota.
- Componente não sobe para `src/components/` por possibilidade futura; sobe quando a repetição
  real aparece ou quando é parte estrutural do shell.

### Critério de decomposição

Decompor por responsabilidade, estado e fronteira de reutilização — nunca somente por quantidade
de linhas. Uma composição visual sem lógica pode permanecer na rota; um bloco com estado,
acessibilidade própria ou repetição merece componente.

Durante a reforma:

- preservar props públicas e responsabilidades dos componentes de domínio;
- preferir envolver/compor em vez de duplicar JSX;
- não misturar mudança visual com alteração de endpoint, regra ou formato de estado;
- remover duplicação visual somente quando o padrão existir em pelo menos duas superfícies;
- evitar um componente genérico com dezenas de props de aparência.

### Server e Client Components

- Página e leitura inicial permanecem Server Components sempre que possível.
- `"use client"` só entra onde já existe interação real: formulário, menu, tabs, filtro, modal.
- Não transformar uma rota inteira em Client Component para animá-la; entrada visual usa CSS e
  os primitivos `MotionReveal`/`MotionStagger`.
- Dado recebido no servidor não é duplicado em estado client sem necessidade de interação.

### Nomenclatura

- Componentes, tipos, props e classes de domínio seguem o português já consolidado no projeto
  (`DetalheCliente`, `resumoInicial`, `.cabecalhoPagina`). APIs do React/Next e arquivos de
  convenção do framework mantêm seus nomes técnicos (`page.tsx`, `layout.tsx`, `loading.tsx`).
- Texto visível, labels, mensagens e `aria-label` em português.
- Classes CSS descrevem papel (`.cabecalhoPagina`, `.cartaoMetrica`), não aparência acidental
  (`.caixaAzul`, `.textoGrande`).

## 4. CSS e composição

- CSS Modules são o padrão. `globals.css` contém reset, tokens, tipografia base, acessibilidade e
  estruturas verdadeiramente globais.
- Não introduzir Tailwind, CSS-in-JS ou biblioteca de componentes durante a migração.
- Cor literal é proibida em rota/componente. Usar token ou `color-mix()` derivado de token.
- Style inline fica restrito a valor realmente dinâmico vindo dos dados (cor de faixa,
  posicionamento de indicador, tamanho calculado).
- Layout usa Grid/Flex e `clamp()`; não posicionar conteúdo principal com coordenada absoluta.
- Breakpoint nasce da quebra real do conteúdo, não de uma lista fixa de devices.
- Elemento visual recorrente em duas rotas deve virar primitivo compartilhado antes da terceira.

Padrões candidatos já identificados — só extrair quando a segunda aplicação confirmar a API:

- abertura de página (índice, título, descrição, ações);
- cabeçalho de seção;
- superfície/card com barra semântica;
- badge de status;
- botão/link de ação com seta.

## 5. Estado, dados e formulários

- Server fetch é preferido para leitura inicial.
- Estado de UI local usa `useState`/`useReducer`; não há state manager global.
- URL continua fonte de verdade para filtro compartilhável do dashboard/listagem.
- Validação client-side antecipa CPF, e-mail, obrigatoriedade e coerência simples.
- Resposta 422 do backend é a fonte final e precisa continuar mapeada para erro de campo/form.
- Não adicionar `react-hook-form` ou equivalente durante uma mudança apenas visual.
- Loading preserva o conteúdo quando possível; erro aparece no contexto que falhou; sucesso usa
  toast e/ou atualização visível do estado.
- Loading/error integrais de rota reutilizam `EstadoRota`; não duplicar composição ou estilo
  inline em cada `loading.tsx`/`error.tsx`.
- Modal e confirmação passam exclusivamente por `Modal`/`ConfirmProvider`, preservando bloqueio
  de scroll, contenção e restauração de foco. Sucesso e falha assíncronos usam `ToastProvider`
  com o tipo semântico correspondente.

## 6. Acessibilidade

Cada superfície migrada precisa manter:

- HTML semântico e ordem de headings;
- navegação completa por teclado;
- foco visível e imediato;
- alvo mínimo de 44×44px para ação somente com ícone;
- nome acessível para ícone/controle sem texto;
- `aria-current`, `aria-selected`, `aria-expanded`, `aria-busy` e `aria-pressed` quando aplicável;
- tabela equivalente para gráficos;
- alternativa a conteúdo revelado por hover;
- contraste AA, reduced motion e zoom de 200%;
- ausência de overflow horizontal em 390px.

## 7. Performance

- Nenhuma dependência nova só para efeito visual.
- Motion comum usa CSS com `transform` e `opacity`; Anime.js permanece restrito à logomark.
- Recharts continua com animação de dado desativada.
- Dashboard mantém orientação de interação no orquestrador e cards focados em título, KPI e
  visualização; não duplicar instruções ou criar wrappers de seção sem função semântica.
- Imagem decorativa só entra se comunicar algo que CSS/SVG do sistema não consegue comunicar.
- Não adicionar listener global por efeito visual.
- Evitar layout thrashing: não medir DOM em loop nem animar dimensões de conteúdo.
- Manter a página como Server Component e o bundle client atual, salvo interação comprovada.

## 8. Protocolo de migração página a página

Uma rota ou superfície global por vez:

1. Capturar estado atual em desktop e mobile.
2. Ler o componente, CSS Module e testes da rota.
3. Definir o fluxo que não pode mudar.
4. Aplicar abertura, hierarquia, superfícies, cores e motion do novo sistema.
5. Reutilizar primitive existente; extrair nova somente após repetição real.
6. Testar comportamento da rota, typecheck e lint.
7. Verificar no navegador em 1280px e 390px, light e dark.
8. Conferir foco, teclado, reduced motion, loading, vazio, erro e modal relevante.
9. Encerrar a rota antes de começar a seguinte.

Não fazer uma passada global de “embelezamento” em todos os CSS Modules. Isso dificulta revisão,
mistura regressões e impede comparar antes/depois.

### Ordem recomendada

1. Shell global: navbar + menu do usuário.
2. Dashboard.
3. Clientes (lista e detalhe; modais do fluxo juntos).
4. Simulador.
5. Sobre o modelo.
6. Perfil.
7. Gestão de usuários.
8. Login e estados globais (modal/toast/loading/error) como fechamento de consistência.

A ordem pode mudar por decisão do usuário, mas uma etapa precisa fechar seus gates antes da
próxima.

## 9. Testes e verificação

Gate mínimo por etapa:

```bash
npx tsc --noEmit
npx eslint <arquivos alterados>
npx vitest run <testes da rota e dos componentes compartilhados>
```

O build de produção roda no fechamento de um conjunto, nunca simultaneamente ao `next dev` no
mesmo `.next/`. Teste RTL confirma estrutura/comportamento; screenshot real confirma layout,
fontes, overflow, contraste e estados visuais.

## 10. Colaboração e documentação

- Comentário explica decisão não óbvia, não narra CSS/JSX.
- Mudança de contrato ou arquitetura relevante recebe ADR em `docs/decisoes/`.
- Descoberta visual reproduzível entra em `testing.md`.
- Standard muda antes de uma nova regra ser replicada em várias rotas.
- Handoff design→dev é N/A neste projeto; a evidência é standard + código + screenshot + teste.
