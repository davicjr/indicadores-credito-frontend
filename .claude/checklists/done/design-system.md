---
feature: design-system
status: done
created: 2026-07-21
---

# Design system: tokens, tipografia, tema claro/escuro

Segundo módulo do roadmap (depois de `fundacao` + `frontend-standards`). Deriva e aplica o
design system — mundo do assunto "régua de crédito", tom sóbrio e denso. Aprovado via
`/davi-ux:design-system` em 2026-07-21.

## Tarefas
- [x] `.claude/docs/standards/design_system.md` — tokens (contraste WCAG verificado de verdade
      via cálculo real, não presumido), tipografia, geometria, regras
- [x] `src/app/globals.css` — tokens `light`/`dark` como custom properties, fallback
      `prefers-color-scheme`, `[data-theme]` explícito
- [x] `src/app/layout.tsx` — 3 fontes via `next/font/google` (Space Grotesk, Inter, IBM Plex
      Mono, self-hospedadas), script inline anti-FOUC + `suppressHydrationWarning` no `<html>`
- [x] `src/components/ThemeToggle.tsx` + `ThemeToggle.test.tsx` — prova real do mecanismo
      (3 testes: reflete tema atual, alterna e persiste, alterna de volta)
- [x] `.claude/docs/standards/testing.md` novo — achados de config do Vitest
- [x] CLAUDE.md — standards referenciados, convenção de tema nas Convenções

## Quality gates
- [x] Testes passando — `npm test -- --run`: 4/4
- [x] `npx tsc --noEmit` e `npm run lint` limpos
- [x] `/davi-core:review` — sem achado de severidade alta
- [x] Verificado de ponta a ponta — `npm run dev` real + screenshot via CDP (Chrome DevTools
      Protocol, script Node sem dependência) dos 2 temas: claro (`--papel` #F7F7F5, título em
      Space Grotesk visível) e escuro via `prefers-color-scheme` real (não force-dark do Chrome,
      que só inverte pixel — usei `Emulation.setEmulatedMedia`, o mesmo mecanismo que o
      navegador real usa)
- [ ] `/davi-core:retro` — roda no fechamento do roadmap inteiro

## Notas
- **2 bugs reais achados só na verificação de ponta a ponta**:
  1. Hydration mismatch — script anti-FOUC muda `data-theme` antes do React hidratar, React
     reclamava por não ser dono do atributo. `suppressHydrationWarning` no `<html>` (padrão
     oficial do Next.js pra esse caso), não em nenhum outro lugar da árvore.
  2. Cleanup do Testing Library entre testes não registrava sozinho sem `test.globals` —
     3 testes de `ThemeToggle` vazavam DOM entre si (`getByRole` achava múltiplos elementos).
     `afterEach(cleanup)` explícito em `vitest.setup.ts`.
- `<RegraDeScore>` (elemento de assinatura) fica documentado no design system mas não
  implementado — nasce no primeiro módulo que mostra score de verdade (`dashboard` ou
  `clientes`).
- `npm audit`: sem mudança desde a `fundacao` (7 vulnerabilidades dev-only, decisão já
  registrada lá).
