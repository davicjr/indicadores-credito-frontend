---
feature: clientes
status: done
created: 2026-07-21
---

# Clientes: CRUD via `-clientes` com score/segmento embutido

Quinto módulo do roadmap. `-clientes` exige `Authorization: Bearer` (diferente de `-dados`) —
GET (listar/detalhe) via Server Component lendo o cookie httpOnly server-side (`getToken()`);
mutações (POST/PUT/PATCH) via Route Handlers próprias que fazem proxy pro backend anexando o
Bearer, mesmo padrão BFF do módulo `autenticacao`. Nasce aqui o `<RegraDeScore>` (elemento de
assinatura do design system) — primeiro lugar com 1 score por registro.

## Tarefas
- [x] `src/lib/cpf.ts` + teste (4 testes) — checksum mod-11, espelha `CpfValidator.java` do
      `-clientes` (validação client-side descrita no `frontend.md`)
- [x] `src/lib/session.ts` — `getToken()` (lê cookie via `next/headers`, server-only) + teste
- [x] `src/lib/clientes-api.ts` + teste (3 testes) — `getClientes(pagina)`/`getClienteById(id)`,
      `Authorization: Bearer` anexado, tipos `Cliente`/`PaginaClientes` (formato `PagedModel`)
- [x] `src/lib/proxy-clientes.ts` + teste (3 testes) — proxy compartilhado pras 3 mutações,
      repassa status/corpo do backend intacto (inclusive `campos` do 422)
- [x] Route Handlers: `POST /api/clientes`, `PUT /api/clientes/[id]`,
      `PATCH /api/clientes/[id]/inativar` — cada um com teste confirmando o wiring
- [x] `src/components/RegraDeScore.tsx` + teste (3 testes) — escala graduada 300-850, 5 faixas
      coloridas, indicador na posição do score, estado "sem score calculado"
- [x] `src/components/Campo.tsx` + teste (3 testes) — label+input+erro genérico, reusa em 14
      campos do formulário (e reusável no `simulador`, mesmo shape de dados financeiros)
- [x] `ClienteForm` (+ `DadosPessoaisCampos`/`DadosFinanceirosCampos`, sob o limite de 180
      linhas por arquivo) + teste (4 testes) — modo criar/editar, valida CPF client-side antes
      de chamar a API, distribui erro de campo (422) por input
- [x] `ListaClientes` + `page.tsx` (lista paginada) + teste — link novo cliente, Anterior/Próxima
- [x] `DetalheCliente` + `page.tsx` (detalhe) + teste — régua de score, dados, editar, inativar
- [x] `InativarClienteButton` + teste (2 testes) — confirmação via `window.confirm`
- [x] `editar/page.tsx` — pré-preenche `ClienteForm` a partir do cliente real
- [x] `loading.tsx`/`error.tsx` do segmento `/clientes` (cascateia pra `/clientes/[id]` também)
- [x] `.claude/docs/standards/testing.md` — achado novo documentado

## Quality gates
- [x] Testes passando — `npm test -- --run`: 73/73 (32 arquivos)
- [x] `npx tsc --noEmit` e `npm run lint` limpos
- [x] Verificado de ponta a ponta contra `-clientes` real (dados reais já existentes no banco de
      dev: "Bruno Mensageria" sem score, "Carla Timestamp" com score 705/Bom):
      1. `GET /clientes` → lista renderiza os 2 clientes ativos reais
      2. `GET /clientes/{id}` → detalhe real, `<RegraDeScore>` renderiza corretamente com dado
         real (score 705 na faixa "Bom", marcador na posição certa da régua)
      3. `POST /api/clientes` com CPF real válido → `201`, cliente criado de verdade no Postgres
      4. `PUT /api/clientes/{id}` → `200`, alteração persistida (confirmada relendo o detalhe)
      5. `PATCH /api/clientes/{id}/inativar` → `200`, `ativo:false` — some da listagem (soft
         delete filtrado pelo backend) mas continua acessível por `GET /clientes/{id}`,
         confirmando que a UI só reflete o comportamento real do backend, não um bug
      6. `POST /api/clientes` com campos inválidos → `422` real com `campos` (nome/telefone/email)
         propagados intactos pelo proxy
      7. Screenshot real (lista, detalhe sem score, detalhe com score, formulário de cadastro) —
         achou e corrigiu 2 bugs visuais reais (ver Notas)
- [x] `/davi-core:retro` — roda no fechamento do roadmap inteiro

## Notas
- **2 bugs visuais reais achados só no screenshot**: (1) botões "Editar"/"Inativar cliente" sem
  gap entre si; (2) campos do formulário colados uns nos outros (fieldset sem espaçamento
  interno). Nenhum dos 2 quebrava teste unitário (RTL não renderiza layout de verdade).
  Corrigidos com classes `.acoes` e `.grupo` em `clientes.module.css`. Documentado em
  `testing.md` como reforço da regra "screenshot pega o que RTL não pega".
- `<RegraDeScore>` nasceu aqui (não no `dashboard`, que mostra distribuição agregada, não score
  individual) — confirma a decisão adiada no checklist do `dashboard`.
- `GET /clientes` não tem busca/filtro (só paginação) — o controller do `-clientes` não expõe
  esse parâmetro hoje; não implementado no frontend por não existir no backend, não é omissão.
- CPF (`documento`) é imutável após cadastro — `ClienteUpdateRequest` não tem esse campo, e o
  formulário de edição não mostra o campo CPF de propósito (mesmo contrato do backend).
