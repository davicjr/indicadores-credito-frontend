<img src="docs/logomark.svg" alt="Índice Real" width="280" />

# Índice Real — dashboard e simulador de score de crédito

**Índice Real** é o nome do produto (marca exibida na UI); `indicadores-credito` é o nome técnico
do projeto e o prefixo dos 4 repositórios — ver
[indicadores-credito-infra](https://github.com/davicjr/indicadores-credito-infra) pra visão geral
do sistema completo.

Frontend do projeto Indicadores de Crédito: dashboard da carteira, cadastro de clientes e
simulador de score em tempo real, em Next.js.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/testes-287%20passing-6E9F18?logo=vitest&logoColor=white)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)

## Como funciona

```
Login (JWT via cookie httpOnly) → Next.js (App Router)
   ├── /dashboard      → carteira agregada (score/segmentação) — indicadores-credito-clientes
   ├── /clientes       → CRUD, cruzado com o score atual — indicadores-credito-clientes + -dados
   ├── /simulador       → calcula score sem cadastrar cliente — indicadores-credito-dados
   ├── /modelo           → evidências e comparação de modelo — indicadores-credito-dados
   └── /admin/usuarios     → gestão de usuários (admin-only) — indicadores-credito-clientes
```

- BFF (route handlers do próprio Next): o browser nunca fala direto com os dois backends, nem
  vê a URL/credencial deles
- JWT guardado em cookie `httpOnly` — nunca em `localStorage`, inacessível via JS no cliente
- Nenhuma lógica de score/segmentação é recalculada aqui — sempre consumida dos backends
- Tema claro/escuro, teclado e `reduced motion` cobertos em toda rota autenticada

## Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Framework | Next.js 15 (App Router) / React 19 | Server Components, BFF nativo via route handlers |
| Estilo | CSS Modules + design tokens | Sem lib de CSS-in-JS; tema por `data-theme`, não classe utilitária |
| Gráficos | Recharts | Distribuição de score/segmento no dashboard |
| Testes | Vitest + Testing Library | Componente e route handler, sem mock de rede solto |

## Resultados

- **287 testes automatizados**, 80 arquivos de teste, TypeScript e lint limpos
- Migração visual completa pra uma direção editorial própria, aplicada rota a rota (não passada
  global), cada uma validada em desktop/mobile, tema claro/escuro e `reduced motion`

## Decisões técnicas

- **Sem lib de state global nem de formulário** até um caso real comprovar necessidade — decisão
  deliberada, não omissão
- **Arquétipos do simulador validados por round-trip**: os exemplos de referência exibidos na UI
  não foram escolhidos só pela distância geométrica até o centróide do cluster — precisaram ser
  validados batendo de volta no mesmo segmento que prometem, e com a ordem de score entre eles
  respeitando a ordem real de risco
- **Componente `EstadoRota` compartilhado**: loading/erro consistentes por rota, com `aria-live`
  e `role` corretos pra leitor de tela — extraído depois de o mesmo padrão se repetir em toda
  rota autenticada

## Como rodar

```bash
npm install
cp .env.example .env.local
npm run dev

npx tsc --noEmit
npm test -- --run
```

Ou via Docker, como parte do sistema completo: veja
[indicadores-credito-infra](https://github.com/davicjr/indicadores-credito-infra).

## Estrutura do projeto

```
indicadores-credito-frontend/
├── src/app/            # rotas (App Router) — dashboard, clientes, simulador, modelo, admin
├── src/app/api/         # route handlers (BFF) — proxy pros 2 backends
├── src/components/       # componentes compartilhados
└── src/lib/                # clientes de API, sessão, formatação
```

## Licença

[MIT](LICENSE)
