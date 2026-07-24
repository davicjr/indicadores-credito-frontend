---
feature: simulador
status: done
created: 2026-07-21
---

# Simulador de score: explora cenário, permite virar cadastro

Sexto e último módulo do roadmap. Decisão de produto (usuário, 2026-07-21): simular E permitir
salvar como cliente — não fica isolado. `POST /simulador` em `-dados` é o único endpoint do
projeto com contrato **snake_case/Python** puro (Pydantic), diferente de `-clientes`
(camelCase/Java) — exige camada de tradução dedicada.

## Tarefas
- [x] `src/components/CampoGrupo.tsx` + teste — fieldset com título, extraído de
      `clientes.module.css` (`.grupo`/`.grupoTitulo`) por reuso real (2+ lugares agora)
- [x] `src/components/DadosFinanceirosCampos.tsx` movido de `src/app/clientes/` pra
      `src/components/` — reusado por `clientes` E `simulador` agora; `DadosFinanceirosFormState`
      extraído como tipo próprio, `ClienteFormState` passa a estendê-lo
      (refactor confirmado seguro: suíte inteira + tsc + lint verdes antes de prosseguir)
- [x] `src/lib/simulador-api.ts` + teste (3 testes) — `paraPayloadSimulador`/
      `paraResultadoSimulador`, traduz nomes de campo (`atrasos30a59Dias` ↔
      `atrasos_30_59_dias` — nomes diferentes por serviço, mesmo conceito) e casing
- [x] `POST /api/simulador` (Route Handler) + teste (2 testes) — proxy sem auth (mesmo padrão
      de `-dados`, que não exige Bearer)
- [x] `SimuladorForm.tsx` + teste (3 testes) — máquina de 3 fases: simular → resultado
      (`<RegraDeScore>`) → cadastrar (reaproveita `<ClienteForm modo="criar">` inteiro, com
      dados financeiros pré-preenchidos)
- [x] `page.tsx` + teste
- [x] `.claude/checklists/active/decisoes-produto.md` — decisão registrada com a resolução

## Quality gates
- [x] Testes passando — `npm test -- --run`: 83/83 (37 arquivos)
- [x] `npx tsc --noEmit` e `npm run lint` limpos
- [x] Verificado de ponta a ponta contra `-dados` real:
      1. `POST /simulador` direto (snake_case) → `200`, `{"score":582,"faixa":"Regular",...}`
      2. `POST /api/simulador` (camelCase, via Next) → `200`, tradução bidirecional confirmada
         batendo com a chamada direta acima
      3. `GET /simulador` sem sessão → `307` pro `/login` (middleware protege mesmo -dados não
         exigindo auth — ferramenta interna, controle de acesso é do frontend)
      4. Screenshot real do formulário — sem bugs visuais novos (herdou o espaçamento correto
         de `CampoGrupo`/`Campo`, já corrigido no módulo `clientes`)
- [x] `/davi-core:retro` — próximo passo, fecha o roadmap inteiro

## Notas
- **Contrato de `-dados` exige `idade` como campo direto** (não deriva de data de nascimento,
  diferente de `-clientes`) — único campo do simulador sem equivalente no `ClienteForm`; ao
  cadastrar depois, o analista preenche data de nascimento normalmente (idade recalculada lá).
- Refactor de extração (`CampoGrupo`, `DadosFinanceirosCampos` compartilhados) foi decidido e
  executado **antes** de escrever o simulador, não depois — evitou duplicar 9 campos de formulário
  pela segunda vez. Suíte re-confirmada verde logo após o refactor, antes de seguir.
- Nomes de campo de atraso divergem entre os dois backends por design (`-dados`:
  `atrasos_30_59_dias`, `-clientes`: `atrasos30a59Dias`) — cada serviço tem seu próprio contrato,
  a tradução vive isolada em `simulador-api.ts`, não vaza pro resto do frontend.
