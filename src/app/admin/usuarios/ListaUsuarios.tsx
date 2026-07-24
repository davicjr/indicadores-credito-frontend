import type { PaginaUsuarios } from "@/lib/usuario-api";
import { EditarUsuarioButton } from "./EditarUsuarioButton";
import { ExcluirUsuarioButton } from "./ExcluirUsuarioButton";
import { InativarUsuarioButton } from "./InativarUsuarioButton";
import styles from "./usuarios.module.css";

const ROTULO_PAPEL = { ANALISTA: "Analista", ADMIN: "Admin" };

interface ListaUsuariosProps {
  pagina: PaginaUsuarios;
  usuarioAtualId?: string;
}

export function ListaUsuarios({ pagina, usuarioAtualId }: ListaUsuariosProps) {
  return (
    <section className={styles.diretorio} aria-labelledby="titulo-diretorio-usuarios">
      <header className={styles.cabecalhoDiretorio}>
        <div>
          <span className={styles.indiceSecao}>Diretório · contas internas</span>
          <h2 id="titulo-diretorio-usuarios">Usuários cadastrados</h2>
        </div>
        <div className={styles.totalDiretorio}>
          <strong className="fonte-dados">{pagina.page.totalElements}</strong>
          <span>{pagina.page.totalElements === 1 ? "conta registrada" : "contas registradas"}</span>
        </div>
      </header>

      {pagina.content.length === 0 ? (
        <div className={styles.vazio} role="status">
          <span className="fonte-dados" aria-hidden="true">00</span>
          <div>
            <h3>Nenhum usuário cadastrado ainda.</h3>
            <p>Crie a primeira conta para começar a distribuir acessos à plataforma.</p>
          </div>
        </div>
      ) : (
        <div className={styles.tabelaContainer}>
          <table className={styles.tabela} aria-label="Diretório de usuários">
            <thead>
              <tr>
                <th scope="col">Usuário</th>
                <th scope="col">Papel</th>
                <th scope="col">Status</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pagina.content.map((usuario) => {
                const contaAtual = usuario.id === usuarioAtualId;
                return (
                  <tr key={usuario.id} className={usuario.ativo ? undefined : styles.inativo}>
                    <td data-label="Usuário">
                      <div className={styles.identidadeUsuario}>
                        <span className={styles.avatarUsuario} aria-hidden="true">
                          {usuario.usuario.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong>{usuario.usuario}</strong>
                          {contaAtual && <span className={styles.contaAtual}>Sua conta</span>}
                        </div>
                      </div>
                    </td>
                    <td data-label="Papel">
                      <span className={styles.papelUsuario} data-papel={usuario.papel}>
                        {ROTULO_PAPEL[usuario.papel]}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span
                        className={`${styles.statusUsuario} ${
                          usuario.ativo ? styles.statusAtivo : styles.statusInativo
                        }`}
                      >
                        <span aria-hidden="true" />
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className={styles.acoes} data-label="Ações">
                      <EditarUsuarioButton usuario={usuario} />
                      {usuario.ativo && <InativarUsuarioButton usuarioId={usuario.id} />}
                      {usuario.ativo && !contaAtual && <ExcluirUsuarioButton usuarioId={usuario.id} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
