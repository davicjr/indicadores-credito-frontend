# Decisões de produto em aberto

Não bloqueiam nada — só não foram resolvidas. Revisar ao fechar cada milestone.

- [x] ~~Estratégia de autenticação da plataforma~~ — decidido em 2026-07-20: **`-clientes` é
      dono** (Spring Security + JWT, HS256). Este serviço só consome `POST /auth/login`, guarda
      o JWT em cookie `httpOnly` (nunca `localStorage`) e anexa `Authorization: Bearer` nas
      chamadas aos dois backends. Contrato completo em
      `indicadores-credito-infra/docs/contrato-autenticacao.md` (fonte de verdade única).
      Destrava: tela de login e proteção das rotas.
- [x] ~~O simulador de score deve permitir salvar o resultado como cliente cadastrado ou fica
      isolado?~~ — decidido em 2026-07-21 (usuário): **permite salvar**. Fluxo: simula com dados
      financeiros (+ idade, exigida só pelo contrato de `-dados`, não pelo de `-clientes`) → vê o
      resultado (`<RegraDeScore>`) → botão "Cadastrar este cliente" revela o `ClienteForm`
      (modo criar) já reaproveitado do módulo `clientes`, com os dados financeiros pré-
      preenchidos — só falta nome/CPF/contato. Destravou o `/simulador`.
- [x] Design system próprio — criado em 2026-07-21 e revisado em 2026-07-23 após aprovação da
      nova home. A direção editorial analítica e o protocolo de migração incremental estão em
      `.claude/docs/standards/`.
- [ ] Gauge de score (`ResumoCarteira`) virar um filtro de range arrastável (score mín/máx
      livre), como parte do "Dashboard interativo com filtro cruzado" — adiado explicitamente
      pelo usuário em 2026-07-22 pra tratar com calma depois. Ver `docs/requisitos.md`.
