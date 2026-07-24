# Requisitos

Um requisito por feature, cumulativo. Não duplica decisão de estrutura de código — isso é
`/davi-core:architect`, depois que o requisito já existe.

## Dashboard interativo com filtro cruzado

Cross-repo (`indicadores-credito-clientes` + `indicadores-credito-frontend`). Ramo com UI —
mudança de interação visível em `/dashboard`.

### Contexto

Usuário notou repetição visual no tooltip de "Distribuição por faixa de score" (rótulo da
categoria aparecendo no eixo E no tooltip) e, em vez de só ajustar o tooltip, pediu uma
interação mais rica: transformar os gráficos do dashboard num filtro cruzado — clicar numa
barra isola aquele recorte da carteira e recalcula todos os outros números da tela.

**Escopo desta rodada exclui o gauge de score arrastável** (`ResumoCarteira`) — decisão
explícita do usuário ("faz agora tudo, exceto a parte da barra arco-íris, vamos ver isso com
calma depois"). Fica registrado como item futuro, não implementar agora.

### História de usuário

Como analista de crédito navegando o `/dashboard`, quero clicar numa barra de "Distribuição por
faixa de score" ou "Distribuição por segmento" pra isolar aquele recorte da carteira, e ver o
resumo, os outros gráficos e as métricas recalculados só pra esse recorte — sem sair da página.

### Comportamento

1. **Gatilhos de filtro** (mutuamente exclusivos — só 1 ativo por vez):
   - Clicar numa barra de "Distribuição por faixa de score" → filtro `faixa=<valor>`
   - Clicar numa barra de "Distribuição por segmento" → filtro `segmento=<valor>`
   - Selecionar um gatilho novo substitui o filtro anterior (nunca combina os dois)
2. **Com filtro ativo**:
   - No gráfico de origem: a barra clicada mantém cor cheia; as outras barras do mesmo
     gráfico esmaecem (opacidade reduzida)
   - "Resumo da carteira" recalcula `totalClientes` e `scoreMedio` só do recorte filtrado
   - "Distribuição por faixa de score", "Distribuição por segmento" e "Métricas dos clientes"
     recalculam todos pro mesmo recorte (inclusive o gráfico que NÃO foi a origem do clique)
   - Aparece um chip visível "Filtrando por: <rótulo> ×" — clicar no × limpa o filtro
   - Clicar de novo na mesma barra que já está filtrando também limpa (toggle)
3. **URL**: o filtro ativo reflete em `/dashboard?faixa=Ruim` ou `/dashboard?segmento=1` —
   sobrevive a F5 e é compartilhável, mesmo padrão de query param que `/clientes` já usa hoje
4. **Backend** (`indicadores-credito-clientes`): `GET /clientes/resumo` e
   `GET /clientes/distribuicao/{metrica}` ganham dois query params opcionais — `faixa` (string)
   e `segmento` (inteiro), mutuamente exclusivos. Quando presentes, os agregados retornados
   (`totalClientes`, `scoreMedio`, `distribuicaoPorFaixa`, `distribuicaoPorSegmento`, `faixas`
   da métrica) são recalculados só sobre o subconjunto de clientes ativos que casam o filtro —
   sem duplicar esse cálculo agregado no frontend

### Critério de aceite

- Dado o dashboard sem filtro, quando clico numa barra de faixa, então o resumo, a distribuição
  por segmento e as métricas recalculam pro recorte daquela faixa, a barra clicada destaca e as
  outras esmaecem, e a URL vira `/dashboard?faixa=<valor>`
- Dado um filtro de faixa ativo, quando clico na mesma barra de novo, então o filtro limpa e
  todos os cards voltam ao total da carteira
- Dado um filtro de faixa ativo, quando clico numa barra de segmento, então o filtro de faixa é
  substituído pelo de segmento (nunca os dois juntos)
- Dado um filtro ativo, quando clico no × do chip "Filtrando por", então o filtro limpa
- Dado `/dashboard?faixa=Ruim` acessado direto (F5 ou link compartilhado), então o filtro já
  vem aplicado ao carregar a página

### Casos de borda

- Recorte com 0 clientes → resumo mostra 0, os 3 gráficos mostram o estado vazio já existente
  de cada um, sem erro
- Recorte igual à carteira inteira (ex.: só existe 1 faixa cadastrada hoje) → chip continua
  visível, deixando claro que um filtro está ligado mesmo sem mudar os números
- Query param inválido/desconhecido na URL (`faixa=Inexistente`, `segmento=99`) → tratado como
  sem filtro (backend não erra, frontend não quebra) — citar
  `/davi-backend:happy-unhappy-path-coverage` pros novos parâmetros dos 2 endpoints
- Clique/navegação rápida trocando de filtro antes da resposta anterior de uma requisição
  anterior chegar → a seleção mais recente vence, resposta desatualizada é descartada (mesmo
  princípio que `DistribuicaoMetricaClientes` já usa pra troca de métrica, agora replicado nos
  4 cards que passam a depender do filtro)

### Requisito não-funcional

Nenhum novo — volume da carteira real (32 clientes hoje) não impõe latência ou paginação
adicional; os endpoints já filtram no banco via query, não em memória.

### Fora de escopo (registrado, não decidido agora)

- Gauge de score arrastável como filtro de range contínuo — ver
  `.claude/checklists/active/decisoes-produto.md`
- Histograma de "Métricas dos clientes" virar gatilho de filtro também (hoje só reage) — não
  pedido explicitamente
