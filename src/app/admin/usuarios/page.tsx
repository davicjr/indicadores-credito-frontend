import { redirect } from "next/navigation";
import { MotionReveal } from "@/components/MotionReveal";
import { getUsuarioAtual, getUsuarios } from "@/lib/usuario-api";
import { CriarUsuarioButton } from "./CriarUsuarioButton";
import { ListaUsuarios } from "./ListaUsuarios";
import styles from "./usuarios.module.css";

interface AdminUsuariosPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminUsuariosPage({ searchParams }: AdminUsuariosPageProps) {
  const usuarioAtual = await getUsuarioAtual();
  if (!usuarioAtual || usuarioAtual.papel !== "ADMIN") {
    redirect("/dashboard");
  }

  const { page } = await searchParams;
  const numeroPagina = page ? Number(page) : 0;
  const pagina = await getUsuarios(numeroPagina);

  return (
    <main className={styles.pagina}>
      <MotionReveal as="header" className={styles.cabecalho}>
        <div className={styles.blocoTitulo}>
          <p className={styles.sobretitulo}>
            <span aria-hidden="true" />
            Administração · controle de acesso
          </p>
          <h1>Gestão de usuários</h1>
          <p> </p>
          <CriarUsuarioButton />
        </div>
        <aside className={styles.painelAdministracao} aria-label="Resumo da gestão de usuários">
          <div className={styles.estadoAdministracao}>
            <span aria-hidden="true" />
            Acesso restrito
          </div>
          <p>Somente administradores podem visualizar e alterar este diretório.</p>
          <dl>
            <div>
              <dt>Usuários</dt>
              <dd className="fonte-dados">{pagina.page.totalElements}</dd>
            </div>
            <div>
              <dt>Página</dt>
              <dd className="fonte-dados">
                {pagina.page.totalPages === 0 ? 0 : pagina.page.number + 1}/{pagina.page.totalPages}
              </dd>
            </div>
          </dl>
        </aside>
      </MotionReveal>
      <MotionReveal delay={1}>
        <ListaUsuarios pagina={pagina} usuarioAtualId={usuarioAtual.id} />
      </MotionReveal>
    </main>
  );
}
