# CLAUDE.md

Orientações para o Claude Code ao trabalhar neste repositório.

## O que é este projeto

**Índice Real** — plataforma web do projeto "Indicadores de Crédito" (nome de família dos
repositórios; `indicadores-credito` continua sendo o nome técnico/de pasta, "Índice Real" é a
marca do produto — ver `.claude/docs/standards/design_system.md#marca`). Par com
`indicadores-credito-dados`, `indicadores-credito-clientes` e `indicadores-credito-infra`. Next.js
consumindo os dois
serviços de backend: dashboard da carteira cadastrada (score/segmentação agregados por
`-clientes`), gestão de clientes (CRUD via `-clientes`, cruzado com o score atual de `-dados`) e
um simulador de score
que calcula risco/segmento em tempo real sem precisar cadastrar cliente. Não é dono de nenhuma
lógica de negócio — só consome e apresenta o que os dois backends calculam. Autenticação é dona
por `-clientes` (JWT) — ver `indicadores-credito-infra/docs/contrato-autenticacao.md`.

## Skills-chave deste projeto

| Skill | Por quê |
|---|---|
| `/davi-core:architect` | planejar cada módulo antes de codar |
| `/davi-core:tdd` | ciclo de teste dos componentes e integrações |
| `/davi-core:review` | revisão de diff contra os padrões abaixo |
| `/davi-core:commit` | commits semânticos |
| `/davi-core:retro` | fechar aprendizados a cada milestone |
| `/davi-ux:frontend-standards` | passada única cobrindo os 6 pontos de frontend — rodada logo após a `fundacao`, antes da primeira tela |
| `/davi-ux:design-system` | derivar o design system antes da primeira tela |
| `/davi-ux:ux-flow` | mapear os 3 fluxos (dashboard, cadastro, simulador) antes de codar |
| `/davi-ux:verify-ui` | verificar de verdade no navegador, não só teste passando |
| `/davi-frontend:component-decomposition` | árvore de componentes antes de implementar |
| `/davi-frontend:form-architecture` | form de cadastro de cliente e do simulador de score |
| `/davi-frontend:state-management-mapper` | onde mora o estado (dados dos dois serviços, sessão) |
| `/davi-frontend:accessibility-audit` | gate de qualidade antes de cada release |
| `/davi-analytics:dashboard-specification` | especificar o dashboard de carteira/score antes de montar |
| `/davi-analytics:visualization-builder` | gráficos de distribuição de score/segmento |

## Arquitetura

```
Login (analista/admin) → Next.js (app router)
   ├── /dashboard      → GET indicadores-credito-clientes  (carteira cadastrada agregada)
   ├── /clientes       → CRUD indicadores-credito-clientes  (cadastro/lista + score atual, cruzado com -dados)
   ├── /clientes/[id]  → detalhe + explicabilidade (reaproveita POST /simulador de -dados)
   ├── /simulador      → POST indicadores-credito-dados     (calcula score sem cadastrar cliente)
   ├── /modelo         → GET indicadores-credito-dados      (modelo, evidências e base histórica)
   ├── /perfil         → GET/PUT indicadores-credito-clientes (dados da conta, troca de senha)
   └── /admin/usuarios → GET/POST/PATCH indicadores-credito-clientes (admin-only, gestão de usuários)
```

## Como rodar (dev)

```bash
# setup inicial
npm install
cp .env.example .env.local

# rodar
npm run dev

# testes
npx tsc --noEmit
npm test -- --run
```

## Convenções

- Nenhuma lógica de score/segmentação é recalculada aqui — sempre consumida de `-dados`
- URLs dos backends nunca hardcoded no client-side — via `.env` + route handlers do Next (BFF)
  quando precisar esconder credencial
- Design tokens e a direção editorial analítica vivem em
  `.claude/docs/standards/design_system.md` — não improvisar cor/espaçamento tela a tela
- Tema sempre por `var(--token)` + atributo `data-theme`, nunca `dark:` de utility class
- Migração visual é incremental: shell ou uma rota por vez, com gates descritos em
  `.claude/docs/standards/frontend.md`; não fazer passada global em todos os CSS Modules

| Arquivo | Conteúdo |
|---|---|
| `.claude/docs/standards/frontend.md` | arquitetura, estado, CSS, performance e protocolo de migração visual |
| `.claude/docs/standards/design_system.md` | direção visual, tokens, composição, motion e acessibilidade |
| `.claude/docs/standards/testing.md` | achados reais de config do Vitest (cleanup, alias `@/`) |

- **Limites de arquivo**: respeitar `.claude/memory/project_limites.md`

## O que NÃO fazer

- Não commitar `.env.local` nem credenciais dos backends — conferir `.gitignore`
- Não duplicar cálculo de score/segmentação no frontend
- Não guardar o JWT em `localStorage` — estratégia decidida (`decisoes-produto.md`): cookie
  `httpOnly`, setado por uma rota do próprio Next (BFF), nunca acessível via JS no cliente
- Sem lib de state global (Redux/Zustand/Jotai) nem de formulário até um caso real comprovar
  necessidade — ver `.claude/docs/standards/frontend.md`

## Problemas conhecidos

- **Dois `next dev` no mesmo diretório corrompem o build**: rodar `npm run dev` uma segunda vez
  sem matar a instância anterior faz as duas escreverem no mesmo `.next/` e o servidor passa a
  responder `ENOENT ... .next/server/pages/_document.js` em toda rota. Sintoma parecido com
  build quebrado, mas a causa real é concorrência — `ps aux | grep "next dev"`, matar as
  duplicadas, `rm -rf .next` e subir de novo resolve. Achado real (sessão de reforma visual
  pós-roadmap).

## Estado

Ver `.claude/checklists/active/` — **ler essa pasta primeiro ao começar uma sessão nova.**
Cada arquivo migra para `.claude/checklists/done/` quando resolvido.
Decisões de produto em aberto (não bloqueantes): `.claude/checklists/active/decisoes-produto.md`.

## Workflow de desenvolvimento

```
/davi-core:architect → aprovação → implementar (/davi-core:tdd) → /davi-core:review → /davi-core:commit
```
