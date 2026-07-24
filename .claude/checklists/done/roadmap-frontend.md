---
feature: roadmap frontend (módulos)
status: done
created: 2026-07-21
---

# Roadmap: módulos do indicadores-credito-frontend

Sequência de dependência real. Não substitui o planejamento — cada módulo abaixo passa pelo
próprio `/davi-core:architect` (ou skill dedicada, quando indicado) antes de ganhar
estrutura/tarefas detalhadas. Este arquivo só rastreia ordem e status.

## Módulos
- [x] `fundacao` — completar o esqueleto Next.js. Concluído — ver `fundacao.md`. Verificado com
      `npm run dev` real (200, HTML renderizado).
- [x] `frontend-standards` (inserido, não estava no roadmap original) — `/davi-ux:frontend-standards`
      rodado logo após a `fundacao`, antes da primeira tela — mesmo gatilho do passo 7b do
      `architect`. Ver `frontend-standards.md`.
- [x] `design-system` — tokens/tipografia/geometria ("régua de crédito") aplicados de verdade
      (fontes, CSS, anti-FOUC, toggle testado). Concluído — ver `design-system.md`. Verificado
      com screenshot real dos 2 temas via CDP.
- [x] `autenticacao` — login (BFF): `POST /auth/login` do `-clientes` retorna JSON `{token}`,
      não seta cookie sozinho — a rota do Next chama o backend server-side e seta o cookie
      `httpOnly` ela mesma. Middleware protege `/dashboard`, `/clientes`, `/simulador`.
      Concluído — ver `autenticacao.md`. Verificado de ponta a ponta contra `-clientes` real
      (login, redirect por sessão, logout) — achou e corrigiu bug real de posicionamento do
      `middleware.ts` (precisa estar em `src/`, não na raiz, quando o projeto usa `src/app/`).
- [x] `dashboard` — consome `GET /agregados/carteira` e `/agregados/inadimplencia-por-segmento`
      do `-dados` (somente leitura). Concluído — ver `dashboard.md`. Verificado de ponta a ponta
      contra `-dados` real (149.390 clientes) + screenshot real (claro/escuro) — achou e corrigiu
      bug visual real (barra de progresso sem `display: block`).
- [x] `clientes` — CRUD via `-clientes`, score/segmento cruzado do gold já embutido na resposta
      de `-clientes` (`ClienteResponse` já tem os campos, não precisa chamada extra a `-dados`).
      Concluído — ver `clientes.md`. Verificado de ponta a ponta contra `-clientes` real (CRUD
      completo com dados reais) + screenshot — nasce o `<RegraDeScore>`, achou e corrigiu 2 bugs
      visuais reais (espaçamento).
- [x] `simulador` — decisão de produto resolvida (usuário): permite salvar como cliente. Concluído
      — ver `simulador.md`. Verificado de ponta a ponta contra `-dados` real (tradução
      camelCase↔snake_case do único contrato Python do projeto).

## Quality gates
- [x] Cada módulo passa pelo próprio ciclo completo: `/davi-core:architect` (ou skill dedicada)
      → aprovação → `/davi-core:tdd` → `/davi-core:review` → `/davi-ux:verify-ui` (screenshot
      real) → `/davi-core:commit`
- [x] `/davi-core:retro` ao fechar o serviço inteiro — ver seção "Expansão pós-roadmap" abaixo

## Expansão pós-roadmap

Depois dos 6 módulos originais, o usuário testou a aplicação de verdade e pediu uma expansão
grande de escopo (mais interatividade, gestão de usuário, analytics explorável) — não estava no
roadmap original, tratado como extensão do mesmo milestone em vez de módulo novo com architect
próprio, dada a urgência e a autorização ampla recebida. Entregue nesta mesma sessão:
- `-dados`: explicabilidade do score (`/modelo/importancia-features`), métricas exploráveis
  (`/agregados/metricas`, `/agregados/distribuicao/{metrica}`)
- `-clientes`: busca/filtro/ordenação em `/clientes`, perfil + troca de senha, gestão de
  usuários admin (`/usuarios`)
- Frontend: Nav com menu de usuário (avatar+dropdown), Modal/Toast/Recharts, home/hub,
  simulador iterativo com comparação de cenários, drill-down do dashboard, `/metricas`,
  `/perfil`, `/admin/usuarios`, reforma visual completa (login, detalhe de cliente,
  explicabilidade no detalhe, botões, espaçamento)

## Notas
- Marcar um módulo como `[x]` aqui só depois que o checklist de feature dele estiver com todos
  os gates aprovados — este arquivo é o índice, o checklist da feature é a fonte da verdade.
- `npm`/`node`: o `node` do PATH é o runtime interno do Cursor (sem `npm` junto). Usar o Node do
  nvm: `~/.nvm/versions/node/v24.18.0/bin/{node,npm}` — ou `source ~/.nvm/nvm.sh && nvm use
  --lts` se a versão mudar.
