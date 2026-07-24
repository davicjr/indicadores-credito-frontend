---
feature: fundacao
status: done
created: 2026-07-21
---

# Fundação: completar o esqueleto Next.js

Primeiro módulo do roadmap. O scaffold do `init-projeto` só tinha `package.json` + pastas
vazias — sem `tsconfig.json`, `next.config`, layout raiz, config de lint/teste, e `npm install`
nunca tinha rodado. Sem isso, nenhum módulo seguinte sobe.

## Tarefas
- [x] `npm install` — `node`/`npm` do PATH não servem (node é o runtime interno do Cursor, sem
      npm); usar o Node do nvm (`~/.nvm/versions/node/v24.18.0/bin`)
- [x] `tsconfig.json`, `next.config.ts`
- [x] `eslint.config.mjs` (flat config, ESLint 9) — precisou excluir `next-env.d.ts` do lint
      (gerado pelo próprio Next.js com sintaxe que a regra `triple-slash-reference` rejeita)
- [x] `src/app/layout.tsx`, `page.tsx`, `globals.css` (reset mínimo — tokens vêm do módulo
      `design-system`, próximo do roadmap)
- [x] `vitest.config.ts` + `vitest.setup.ts` (jsdom, `@testing-library/jest-dom`) — só existia
      o script `test` no `package.json`, sem config nenhuma
- [x] `.github/dependabot.yml` (npm + github-actions) — mesmo padrão já usado no `-clientes`
- [x] `.gitignore` — `*.tsbuildinfo`

## Quality gates
- [x] Testes passando — `npm test -- --run`: 1/1 (smoke test do `Home`)
- [x] `npx tsc --noEmit` limpo, `npm run lint` limpo
- [x] `/davi-core:review` — sem achado de severidade alta
- [x] Verificado de ponta a ponta — `npm run dev` real, `curl localhost:3000` retornou 200 com
      o HTML renderizado (título, conteúdo)
- [ ] `/davi-core:retro` — roda no fechamento do roadmap inteiro

## Notas
- `npm audit` aponta 7 vulnerabilidades (1 crítica, 1 alta, 5 médias) — todas em
  `vite`/`vitest`/`esbuild`/`postcss`, **dev-only** (nenhuma entra no build de produção do
  Next.js). Force-fix pularia `vitest` pra v4 (breaking change não avaliado) e `next` pra v9
  (downgrade absurdo — o audit está sugerindo a versão errada por causa da árvore de
  dependências). Decisão: não forçar agora, `dependabot.yml` já cobre isso continuamente, mesmo
  raciocínio do rate limiting no `-clientes` — risco real mas baixo em ambiente só de dev.
- CSS é custom properties + reset simples, sem Tailwind (não estava nas deps do scaffold) — o
  módulo `design-system` decide se isso muda.
