# Limites de tamanho por arquivo

Ponto de partida — ajustar aos tipos reais do projeto na primeira semana. Faixa confortável de
propósito (não o mínimo que cabe hoje) — o gatilho de dividir é responsabilidade misturada, não
bater no número.

## Frontend (Next.js)

| Tipo | Limite | Ação se ultrapassar |
|---|---|---|
| `page.tsx` | 140 linhas | extrair componentes |
| Componente | 180 linhas | dividir em sub-componentes |
| Hook customizado | 110 linhas | dividir responsabilidades |
| `lib/<recurso>.ts` (client de API) | 140 linhas | dividir por recurso |

## Regra geral

Se um arquivo está chegando no limite, é sinal de que está fazendo coisas demais.
Perguntar: "esse componente tem uma única responsabilidade?" antes de dividir mecanicamente.
O limite existe pra pegar caso patológico, não pra forçar split de arquivo que só está crescendo
normalmente com o domínio.
