---
feature: autenticacao
status: done
created: 2026-07-21
---

# Autenticação: login BFF, cookie httpOnly, middleware de rotas protegidas

Terceiro módulo do roadmap. `-clientes` é dono do JWT (`POST /auth/login` retorna `{token}`
bruto, sem cookie). Frontend implementa o padrão BFF: uma Route Handler própria chama
`-clientes` no servidor e seta o cookie `httpOnly` — o JS do browser nunca vê o token.

## Tarefas
- [x] `src/lib/env.ts` — leitura obrigatória de `DADOS_API_URL`/`CLIENTES_API_URL` (sem
      `NEXT_PUBLIC_`, nunca expostas ao client)
- [x] `src/lib/session.ts` — nome do cookie + opções (`httpOnly`, `secure` em produção,
      `sameSite: lax`, `maxAge` espelhando `JWT_EXPIRACAO_MINUTOS` do `-clientes`)
- [x] `src/app/api/auth/login/route.ts` + teste (3 testes) — chama `-clientes`, propaga erro
      original em caso de credenciais inválidas, seta cookie em caso de sucesso
- [x] `src/app/api/auth/logout/route.ts` + teste (1 teste) — limpa o cookie
- [x] `src/middleware.ts` + teste (5 testes) — redireciona `/dashboard`, `/clientes`,
      `/simulador` sem sessão pro `/login`; redireciona `/login` com sessão pro `/dashboard`
- [x] `src/components/LoginForm.tsx` + teste (2 testes) — client component, form controlado,
      erro exibido via `role="alert"`
- [x] `src/components/LogoutButton.tsx` + teste (1 teste)
- [x] `src/app/login/page.tsx`
- [x] `.env.local`/`.env.example` reescritos sem prefixo `NEXT_PUBLIC_`
- [x] `.claude/docs/standards/testing.md` — achado novo documentado

## Quality gates
- [x] Testes passando — `npm test -- --run`: 16/16 (7 arquivos)
- [x] `npx tsc --noEmit` e `npm run lint` limpos
- [x] Verificado de ponta a ponta contra os serviços reais rodando (`-clientes` via
      `mvn spring-boot:run`, frontend via `npm run dev`):
      1. login com credenciais erradas → `401` + `credenciais_invalidas`
      2. login com credenciais reais (admin bootstrap do `-clientes`) → `200` +
         `Set-Cookie: sessao=<jwt>; HttpOnly; SameSite=lax; Max-Age=3600`
      3. `GET /dashboard` sem cookie → `307` pro `/login`
      4. `GET /dashboard` com cookie válido → passa pelo middleware (404 esperado, página
         ainda não existe — é o próximo módulo)
      5. `GET /login` com cookie válido → `307` pro `/dashboard`
      6. logout → cookie expirado (`Max-Age=0`), `GET /dashboard` volta a redirecionar
- [x] `/davi-core:retro` — roda no fechamento do roadmap inteiro

## Notas
- **Bug real achado só na verificação de ponta a ponta**: `middleware.ts` criado na raiz do
  projeto (convenção padrão do Next sem `src/`). Como este projeto usa `src/app/`, o Next
  esperava `src/middleware.ts` e simplesmente nunca compilava o arquivo — nenhuma evidência no
  log do dev server, nenhum erro, só `/dashboard` devolvendo 404 puro em vez do redirect. Os 5
  testes unitários passavam normalmente (chamam `middleware()` direto, não dependem de onde o
  arquivo está no disco) — só o `curl` contra o servidor real expôs o problema. Corrigido
  movendo pra `src/middleware.ts`. Documentado em `testing.md` como regra geral.
- Confirma de novo o padrão do resto da sessão: verificação real pegou um bug que testes
  automatizados não pegam por construção (não é sobre lógica, é sobre onde o arquivo mora).
