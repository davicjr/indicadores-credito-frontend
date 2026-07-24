import { getClienteById } from "@/lib/clientes-api";
import { simularNoServidor } from "@/lib/simulador-api";
import { DetalheCliente } from "./DetalheCliente";

interface ClienteDetalhePageProps {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetalhePage({ params }: ClienteDetalhePageProps) {
  const { id } = await params;
  const cliente = await getClienteById(id);

  // Reaproveita o /simulador de -dados com os dados já salvos do cliente, em vez de expor um
  // endpoint novo só pra explicabilidade — mesmo formato de entrada (ver simulador-api.ts).
  const resultado = await simularNoServidor({
    idade: cliente.idade,
    rendaMensal: cliente.dadosFinanceiros.rendaMensal,
    numeroDependentes: cliente.dadosFinanceiros.numeroDependentes,
    utilizacaoCreditoRotativo: cliente.dadosFinanceiros.utilizacaoCreditoRotativo,
    razaoDividaRenda: cliente.dadosFinanceiros.razaoDividaRenda,
    linhasCreditoAbertas: cliente.dadosFinanceiros.linhasCreditoAbertas,
    emprestimosImobiliarios: cliente.dadosFinanceiros.emprestimosImobiliarios,
    atrasos30a59Dias: cliente.dadosFinanceiros.atrasos30a59Dias,
    atrasos60a89Dias: cliente.dadosFinanceiros.atrasos60a89Dias,
    atrasos90DiasOuMais: cliente.dadosFinanceiros.atrasos90DiasOuMais,
  });

  return <DetalheCliente cliente={cliente} contribuicoes={resultado?.contribuicoes} />;
}
