import Link from "next/link";
import type { PaginaClientes } from "@/lib/clientes-api";
import { corDaFaixa } from "@/lib/faixas";
import styles from "./clientes.module.css";

interface ListaClientesProps {
  pagina: PaginaClientes;
  linkOrdenacao?: (campo: string) => string;
  sortAtual?: string;
}

const COLUNAS_ORDENAVEIS: { campo: string; rotulo: string }[] = [
  { campo: "nome", rotulo: "Nome" },
  { campo: "score", rotulo: "Score" },
];

export function ListaClientes({ pagina, linkOrdenacao, sortAtual }: ListaClientesProps) {
  if (pagina.content.length === 0) {
    return (
      <div className={styles.vazio}>
        <span aria-hidden="true">—</span>
        <strong>Nenhum cliente cadastrado ainda.</strong>
        <span>Ajuste os filtros ou cadastre o primeiro cliente desta carteira.</span>
      </div>
    );
  }

  const [campoAtual, direcaoAtual] = sortAtual?.split(",") ?? [];

  function cabecalho(campo: string, rotulo: string) {
    if (!linkOrdenacao) {
      return rotulo;
    }
    const indicador = campoAtual === campo ? (direcaoAtual === "asc" ? " ▲" : " ▼") : "";
    return (
      <Link className={styles.link} href={linkOrdenacao(campo)}>
        {rotulo}
        {indicador}
      </Link>
    );
  }

  return (
    <div className={styles.tabelaRolagem}>
      <table className={styles.tabela}>
        <caption className="sr-only">Clientes cadastrados na carteira</caption>
        <thead>
          <tr>
            {COLUNAS_ORDENAVEIS.map((coluna) => (
              <th scope="col" key={coluna.campo}>
                {cabecalho(coluna.campo, coluna.rotulo)}
              </th>
            ))}
            <th scope="col">Documento</th>
            <th scope="col">Faixa</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {pagina.content.map((cliente) => (
            <tr key={cliente.id} className={cliente.ativo ? undefined : styles.inativo}>
              <td data-label="Nome" className={styles.celulaNome}>
                <Link className={styles.link} href={`/clientes/${cliente.id}`}>
                  <span>{cliente.nome}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </td>
              <td
                data-label="Score"
                className={`${styles.celulaScore} fonte-dados`}
                style={cliente.faixa ? { color: corDaFaixa(cliente.faixa) } : undefined}
              >
                {cliente.score ?? "—"}
              </td>
              <td data-label="Documento" className="fonte-dados">
                {cliente.documento}
              </td>
              <td data-label="Faixa">
                <span
                  className={styles.faixaCliente}
                  style={
                    cliente.faixa
                      ? { color: corDaFaixa(cliente.faixa), borderColor: corDaFaixa(cliente.faixa) }
                      : undefined
                  }
                >
                  {cliente.faixa ?? "Sem score calculado"}
                </span>
              </td>
              <td data-label="Status">
                <span
                  className={`${styles.status} ${styles.statusLista} ${
                    cliente.ativo ? "" : styles.statusInativo
                  }`}
                >
                  {cliente.ativo ? "Ativo" : "Inativo"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
