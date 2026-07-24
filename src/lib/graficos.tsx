// Compartilhado pelos gráficos de barra do dashboard e de métricas — mesma altura de
// container e mesma espessura de barra em todos, pra nenhum parecer "mais fino" só por ter
// menos categorias que os outros (era o que fazia os gráficos parecerem desalinhados entre si).
// Reduzido de 280 depois que o seletor de métrica virou dropdown — a soma dos 3 cards empurrava
// o dashboard pra baixo da dobra (achado real: "diminui um pouco o tamanho do grafico, pra não
// dar scroll").
export const ALTURA_GRAFICO_BARRA = 220;
export const ESPESSURA_BARRA = 14;

// O trilho mostra o espaço total disponível e torna diferenças pequenas legíveis sem adicionar
// grade ou eixo numérico. Mantém a linguagem de régua do produto e usa somente tokens.
export const FUNDO_BARRA = {
  fill: "var(--linha)",
  fillOpacity: 0.42,
};

// Gráficos horizontais não precisam reservar 220px quando têm só 3 categorias. A altura
// proporcional mantém um intervalo confortável entre barras sem deixar um vazio grande antes
// da legenda; com 5 ou mais categorias, preserva a altura máxima compartilhada.
export function alturaGraficoHorizontal(quantidadeCategorias: number): number {
  return Math.min(ALTURA_GRAFICO_BARRA, Math.max(148, quantidadeCategorias * 52));
}

// Domínio do eixo de valor com folga: sem isso, a barra da maior categoria enche 100% do
// trilho e o rótulo (RotuloDepoisDaBarra) nasce colado na borda do card — em telas estreitas
// ela é a primeira coisa cortada (achado real: "o numero 106154 ta saindo do gráfico", numa
// margin fixa que qualquer largura de card acaba estourando de novo). Escalar o domínio em vez
// de só aumentar a margem resolve pra qualquer largura de container, não só a testada.
export function dominioComFolga(dataMax: number): number {
  return dataMax * 1.15;
}

// Sem grade e sem eixo numérico de propósito — a cor de cada barra já identifica a categoria
// (legenda) e o valor exato aparece no hover (TooltipGrafico), então grade + números do eixo
// eram ink redundante disputando atenção com o dado (achado real: "essas linhas dos gráficos"
// e "os eixos" citados os dois como feios). Fica só este título pequeno dizendo a unidade.
export function tituloEixoValor(texto: string) {
  return {
    value: texto,
    position: "insideBottom" as const,
    offset: -6,
    style: { fontSize: 11, fill: "var(--apagado)" },
  };
}

// Retângulo de destaque atrás da barra sob o mouse/foco — recharts chama isso de "cursor" do
// Tooltip. Sem isso, passar o mouse não dava nenhum retorno visual de qual barra respondeu.
// Opacidade baixa de propósito (era 0.5, lia como um bloco cinza sólido "pesado" demais pro
// resto do gráfico, que é todo hairline) — mesmo espírito recessivo da grade.
export const CURSOR_HOVER = { fill: "var(--linha)", opacity: 0.35 };

// Barra fora do filtro cruzado do dashboard — esmaece sem sumir (ainda dá pra ler o rótulo e
// clicar de novo pra voltar), mesma faixa de opacidade recessiva do CURSOR_HOVER.
export const OPACIDADE_ESMAECIDA = 0.35;

interface BarraProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  fillOpacity?: number | string;
  stroke?: string;
  strokeOpacity?: number | string;
  strokeWidth?: number | string;
  className?: string;
}

// Sem piso mínimo, um valor real (>0) mas muito menor que o maior da série vira uma barra de
// 0-1px e some visualmente — o rótulo ao lado ainda mostra o número, mas a barra em si mente
// por omissão. 3px é visível sem distorcer a leitura das barras grandes.
const LARGURA_MINIMA_PX = 3;

export function BarraComPiso({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill,
  fillOpacity,
  stroke,
  strokeOpacity,
  strokeWidth,
  className,
}: BarraProps) {
  const larguraFinal = width > 0 && width < LARGURA_MINIMA_PX ? LARGURA_MINIMA_PX : width;
  return (
    <rect
      x={x}
      y={y}
      width={larguraFinal}
      height={height}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeOpacity={strokeOpacity}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}

interface RotuloProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number | string;
}

// Número depois da barra (gráficos horizontais: faixa, segmento) — sempre no fundo liso do
// card, nunca em cima da cor da barra, então não precisa de nenhum truque de contraste (achado
// real: centralizar o número dentro da barra, com halo, "ficou feio"). Colado na ponta de cada
// barra (não num x fixo), então acompanha o comprimento de cada uma.
export function RotuloDepoisDaBarra({ x = 0, y = 0, width = 0, height = 0, value }: RotuloProps) {
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      textAnchor="start"
      dominantBaseline="central"
      fontSize={12}
      fontFamily="var(--fonte-dados)"
      fontWeight={600}
      fill="var(--tinta)"
    >
      {value}
    </text>
  );
}

// 5 hues categóricas de verdade (não uma rampa de opacidade sobre --acento) — usada nos buckets
// de DistribuicaoMetricaClientes. Achado real com usuário: a rampa de opacidade de uma cor só
// "não dá pra identificar nada" numa barra fina. Ordem fixa, validada par-adjacente (CVD
// protanopia/deuteranopia + contraste) via validate_palette.js da skill dataviz — ver
// design_system.md. Cinco é o teto validado; mais buckets do que isso repetem a cor (ver
// OPACIDADE_CATEGORICA abaixo) em vez de inventar uma 6ª hue sem rodar o validador de novo.
const PALETA_CATEGORICA = [
  "var(--serie-1)",
  "var(--serie-2)",
  "var(--serie-3)",
  "var(--serie-4)",
  "var(--serie-5)",
];

export function corCategoricaPorIndice(indice: number): string {
  return PALETA_CATEGORICA[indice % PALETA_CATEGORICA.length];
}

// Só entra em jogo quando uma métrica tem mais buckets do que hues validadas (ex.: variável
// contínua com bins=10 do lado de -dados) — sem isso, o bucket 6 repetiria a cor do 1 de forma
// idêntica e pareceria o mesmo dado. Esmaece a cada "volta" na paleta, não cada bucket, então os
// 5 primeiros continuam na cor cheia.
export function opacidadeCategoricaPorIndice(indice: number): number {
  const volta = Math.floor(indice / PALETA_CATEGORICA.length);
  return volta === 0 ? 1 : Math.max(0.55, 1 - volta * 0.3);
}
