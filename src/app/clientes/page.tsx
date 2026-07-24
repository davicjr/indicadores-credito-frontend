import Link from "next/link";
import { MotionReveal } from "@/components/MotionReveal";
import {
  getClientes,
  ORDENACAO_PADRAO_CLIENTES,
  type FiltrosClientes,
} from "@/lib/clientes-api";
import { proximoSort } from "@/lib/ordenacao";
import { CadastrarClienteButton } from "./CadastrarClienteButton";
import { FiltroClientes } from "./FiltroClientes";
import { ListaClientes } from "./ListaClientes";
import styles from "./clientes.module.css";

interface ClientesPageProps {
  searchParams: Promise<{
    page?: string;
    nome?: string;
    faixa?: string;
    segmento?: string;
    status?: string;
    sort?: string;
  }>;
}

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const params = await searchParams;
  const numeroPagina = params.page ? Number(params.page) : 0;

  const filtros: FiltrosClientes = {};
  if (params.nome) filtros.nome = params.nome;
  if (params.faixa) filtros.faixa = params.faixa;
  if (params.segmento) filtros.segmento = Number(params.segmento);
  if (params.status) filtros.status = params.status;
  filtros.sort = params.sort ?? ORDENACAO_PADRAO_CLIENTES;

  const pagina = await getClientes(numeroPagina, filtros);

  function comQuery(extra: Record<string, string | number | undefined>) {
    const query = new URLSearchParams();
    if (filtros.nome) query.set("nome", filtros.nome);
    if (filtros.faixa) query.set("faixa", filtros.faixa);
    if (filtros.segmento !== undefined) query.set("segmento", String(filtros.segmento));
    if (filtros.status) query.set("status", filtros.status);
    if (filtros.sort) query.set("sort", filtros.sort);
    for (const [chave, valor] of Object.entries(extra)) {
      if (valor === undefined) {
        query.delete(chave);
      } else {
        query.set(chave, String(valor));
      }
    }
    return `/clientes?${query.toString()}`;
  }

  return (
    <main className={`${styles.pagina} ${styles.paginaLista}`}>
      <MotionReveal as="header" className={`${styles.cabecalho} ${styles.aberturaLista}`}>
        <div className={styles.aberturaConteudo}>
          <span className={styles.sobretituloLista}>
            <span aria-hidden="true" />
            Clientes · operação
          </span>
          <h1>Clientes</h1>
       </div>
        <CadastrarClienteButton />
      </MotionReveal>
      <MotionReveal delay={1}>
        <FiltroClientes
          nome={filtros.nome}
          faixa={filtros.faixa}
          segmento={filtros.segmento}
          status={filtros.status}
        />
      </MotionReveal>
      <MotionReveal
        as="section"
        className={`${styles.cartao} ${styles.cartaoLista}`}
        aria-labelledby="titulo-resultados-clientes"
        delay={2}
      >
        <header className={styles.cabecalhoResultados}>
          <div>
            <span className={styles.indiceLista}>Base cadastrada</span>
            <h2 id="titulo-resultados-clientes">
              {pagina.page.totalElements}{" "}
              {pagina.page.totalElements === 1 ? "cliente encontrado" : "clientes encontrados"}
            </h2>
          </div>
        </header>
        <ListaClientes
          pagina={pagina}
          sortAtual={filtros.sort}
          linkOrdenacao={(campo) => comQuery({ sort: proximoSort(filtros.sort, campo), page: undefined })}
        />
        {pagina.page.totalElements > 0 && (
          <div className={styles.paginacao}>
            <span className={styles.paginacaoLado}>
              {numeroPagina > 0 && (
                <Link className={styles.link} href={comQuery({ page: numeroPagina - 1 })}>
                  ← Anterior
                </Link>
              )}
            </span>
            <span className={styles.rotuloDado}>
              Página {numeroPagina + 1} de {pagina.page.totalPages} — {pagina.page.totalElements}{" "}
              {pagina.page.totalElements === 1 ? "cliente" : "clientes"}
            </span>
            <span className={`${styles.paginacaoLado} ${styles.paginacaoLadoDireita}`}>
              {numeroPagina + 1 < pagina.page.totalPages && (
                <Link className={styles.link} href={comQuery({ page: numeroPagina + 1 })}>
                  Próxima →
                </Link>
              )}
            </span>
          </div>
        )}
      </MotionReveal>
    </main>
  );
}
