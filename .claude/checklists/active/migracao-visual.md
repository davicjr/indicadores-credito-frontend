---
feature: migração visual incremental
status: active
updated: 2026-07-23
---

# Migração visual — linguagem aprovada na home

Aplicar a direção editorial analítica documentada em `design_system.md` sem alterar contratos,
regras de negócio ou fronteiras Server/Client. Uma superfície por vez; não iniciar a seguinte
antes de validar comportamento e navegador da atual.

## Base normativa

- [x] Nova direção visual registrada em `design_system.md`
- [x] Arquitetura e protocolo incremental registrados em `frontend.md`
- [x] Resumo operacional atualizado no `CLAUDE.md`
- [x] Home usada como referência aprovada
- [ ] Home — extrair iconografia/composição auxiliar para voltar ao limite arquitetural de
      `page.tsx` sem alterar o visual aprovado

## Etapas

- [x] Shell global — navbar e menu do usuário
      - wordmark + logomark para `/`, navegação ativa e layout mobile em duas faixas
      - menu estruturado com perfil, administração condicional, tema, logout e `Escape`
      - validado em 1280px/light e 390px/dark, sem overflow; 20 testes do shell aprovados
- [x] Dashboard
      - abertura compacta, filtro atual e KPIs com hierarquia analítica
      - KPIs seguidos diretamente pelos cards, sem seções numeradas nem instruções repetidas
      - barras horizontais com rótulos e valores diretos, trilho comum e cor semântica
      - filtro cruzado, URL compartilhável, `Escape` e tabelas acessíveis preservados
      - validado em 1280px/light e 390px/dark, sem overflow; 40 testes aprovados, TypeScript e lint limpos
- [x] Clientes
      - [x] listagem — abertura, filtros automáticos, resultados ordenáveis e cartões tabulares no mobile
            - validada em 1280px/light e 390px/dark, sem overflow; 17 testes aprovados, TypeScript e lint limpos
      - [x] detalhe — risco, perfil, identificação e sinais financeiros em leitura progressiva
            - dados sensíveis continuam acessíveis por foco/hover; validado em 1280px/light e 390px/dark
            - sem overflow; 13 testes aprovados, TypeScript e lint limpos
      - [x] modais de cadastro e edição — fluxo progressivo em três etapas, cabeçalho e ação persistentes
            - variante isolada dos demais modais e do uso do ClienteForm no Simulador
            - portal acima da navbar, validado em 1280px/light e 390px/dark, sem overflow
            - 20 testes aprovados, TypeScript e lint limpos
- [x] Simulador
      - entrada com perfis de referência, parâmetros por domínio e contexto de ambiente seguro
      - resultado, comparação de dois cenários e conversão em cadastro na mesma narrativa visual
      - estados de erro e indisponibilidade preservados; serviço real indisponível durante o gate
      - validado com resposta local temporária em 1280px/light e 390px/dark, sem overflow
      - 14 testes aprovados, TypeScript e lint limpos
- [x] Sobre o modelo
      - abertura editorial com estado auditável, modelo ativo e data da documentação
      - narrativa em três etapas preservada: visão geral, funcionamento e evidências históricas
      - resumo, comparação, fluxo e coeficientes reformulados; pesos usam eixo proteção/risco
      - comparação, risco histórico e evidências usam escala comum, rótulos diretos e leitura sem legenda
      - tabela comparativa vira cartões semânticos no mobile; loading e error próprios da rota
      - serviços locais indisponíveis no gate; dados validados com respostas temporárias descartáveis
      - validado em 1280px/light e 390px/dark/reduced motion, sem overflow; 2 testes aprovados,
        TypeScript e lint limpos
- [x] Perfil
      - abertura editorial e contexto de acesso pessoal alinhados às demais rotas autenticadas
      - identidade da conta, papel e estado organizados sem criar ações fora do escopo existente
      - troca de senha em leitura progressiva, com erro contextual, loading e toast preservados
      - campos identificados para gerenciadores de senha com `current-password` e `new-password`
      - serviço local indisponível no gate; fluxo validado com resposta temporária descartável
      - validado em 1280px/light e 390px/dark/reduced motion, sem overflow; 12 testes aprovados,
        TypeScript e lint limpos
- [x] Gestão de usuários
      - abertura administrativa com contexto de permissão, volume de contas e ação principal
      - diretório com identidade, papel, status, conta atual e ações visualmente hierarquizadas
      - tabela preservada no desktop e convertida em cartões tabulares semânticos no mobile
      - criação e edição em modal administrativo; confirmação compacta e exclusão com ênfase crítica
      - autocomplete, loading, erros, toasts e proteção contra excluir a própria conta preservados
      - serviço local indisponível no gate; fluxos validados com respostas temporárias descartáveis
      - validado em 1280px/light e 390px/dark/reduced motion, sem overflow; 32 testes aprovados,
        TypeScript e lint limpos
- [x] Login
      - composição editorial em duas áreas: narrativa do produto e painel de acesso seguro
      - logomark, wordmark e régua de score preservados, com escala e leitura mais expressivas
      - fluxo de autenticação, redirecionamento e mensagem do backend preservados
      - campos preparados para gerenciadores de senha; loading, erro acessível e foco mantidos
      - erro, sucesso, cookie httpOnly e redirecionamento validados contra os serviços locais
      - validado em 1280px/light e 390px/dark/reduced motion, sem overflow; 15 testes aprovados,
        TypeScript e lint limpos
- [x] Estados globais — modal, toast, loading e error
      - `EstadoRota` compartilhado substitui estilos inline e a implementação isolada de Modelo
      - loading e erro de Dashboard, Clientes e Modelo usam composição, semântica e recuperação comuns
      - modal bloqueia scroll, contém/restaura foco, fecha por `Escape`/backdrop e nomeia título/descrição
      - confirmação crítica inicia em “Cancelar” e combina sinal, texto e cor; toast tem tipo textual,
        símbolo, anúncio adequado, ação de dispensar e limpeza segura de temporizadores
      - padrões registrados em `design_system.md` e `frontend.md`
      - validado em 1280px/light e 390px/dark/reduced motion, sem overflow; 280 testes aprovados,
        TypeScript e lint limpos
- [ ] Gate final — suíte completa, build e auditoria visual cruzada

## Gate de cada etapa

- [ ] Fluxo e testes existentes preservados
- [ ] TypeScript e lint limpos
- [ ] Desktop 1280px e mobile 390px
- [ ] Tema claro e escuro
- [ ] Teclado, foco e reduced motion
- [ ] Sem overflow horizontal
- [ ] Screenshot inspecionado antes de avançar
