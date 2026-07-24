import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClienteForm } from "./ClienteForm";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

// Campos ficam divididos em 3 abas (Dados pessoais / Situação financeira / Histórico de
// atraso) — só a primeira vem aberta, então o teste precisa navegar entre elas, igual um
// usuário real faria (mesmo padrão do teste do simulador).
async function preencherCamposObrigatorios(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText("Nome"), "Ana Silva");
  await usuario.type(screen.getByLabelText("Email"), "ana@exemplo.com");
  await usuario.type(screen.getByLabelText("Telefone"), "11999999999");
  await usuario.type(screen.getByLabelText("Data de nascimento"), "1990-05-10");

  await usuario.click(screen.getByRole("tab", { name: "Situação financeira" }));
  await usuario.type(screen.getByLabelText("Utilização de crédito rotativo"), "0.3");
  await usuario.type(screen.getByLabelText("Razão dívida/renda"), "0.2");
  await usuario.type(screen.getByLabelText("Linhas de crédito abertas"), "3");
  await usuario.type(screen.getByLabelText("Empréstimos imobiliários"), "1");

  await usuario.click(screen.getByRole("tab", { name: "Histórico de atraso" }));
  await usuario.type(screen.getByLabelText("Atrasos de 30 a 59 dias"), "0");
  await usuario.type(screen.getByLabelText("Atrasos de 60 a 89 dias"), "0");
  await usuario.type(screen.getByLabelText("Atrasos de 90 dias ou mais"), "0");
}

describe("ClienteForm", () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
  });

  it("modo criar: mostra o campo de documento e envia POST /api/clientes", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "c1" }), { status: 201 }))
    );

    render(<ClienteForm modo="criar" />);
    expect(screen.getByLabelText("CPF")).toBeInTheDocument();

    await usuario.type(screen.getByLabelText("CPF"), "111.444.777-35");
    await preencherCamposObrigatorios(usuario);
    await usuario.click(screen.getByRole("button", { name: "Cadastrar cliente" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/clientes",
      expect.objectContaining({ method: "POST" })
    );
    expect(push).toHaveBeenCalledWith("/clientes/c1");
  });

  it("modo criar: bloqueia envio com CPF inválido antes de chamar a API", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());

    render(<ClienteForm modo="criar" />);
    await usuario.type(screen.getByLabelText("CPF"), "111.444.777-36");
    await preencherCamposObrigatorios(usuario);
    await usuario.click(screen.getByRole("button", { name: "Cadastrar cliente" }));

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument();
  });

  it("modo editar: não mostra campo de documento e envia PUT /api/clientes/{id}", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "c1" }), { status: 200 }))
    );

    render(
      <ClienteForm
        modo="editar"
        clienteId="c1"
        valoresIniciais={{
          nome: "Ana Silva",
          email: "ana@exemplo.com",
          telefone: "11999999999",
          dataNascimento: "1990-05-10",
          utilizacaoCreditoRotativo: "0.3",
          razaoDividaRenda: "0.2",
          linhasCreditoAbertas: "3",
          emprestimosImobiliarios: "1",
          atrasos30a59Dias: "0",
          atrasos60a89Dias: "0",
          atrasos90DiasOuMais: "0",
        }}
      />
    );

    expect(screen.queryByLabelText("CPF")).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(fetch).toHaveBeenCalledWith("/api/clientes/c1", expect.objectContaining({ method: "PUT" }));
    expect(push).toHaveBeenCalledWith("/clientes/c1");
  });

  it("mostra erro de campo específico quando o backend responde 422 com campos", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: 422,
            erro: "validacao_falhou",
            mensagem: "campos inválidos",
            campos: { email: "email inválido" },
          }),
          { status: 422 }
        )
      )
    );

    render(<ClienteForm modo="criar" />);
    await usuario.type(screen.getByLabelText("CPF"), "111.444.777-35");
    await preencherCamposObrigatorios(usuario);
    await usuario.click(screen.getByRole("button", { name: "Cadastrar cliente" }));

    expect(await screen.findByText("email inválido")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("chama onSucesso em vez de navegar quando fornecido (uso dentro de modal)", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "c1" }), { status: 201 }))
    );
    const onSucesso = vi.fn();

    render(<ClienteForm modo="criar" onSucesso={onSucesso} />);
    await usuario.type(screen.getByLabelText("CPF"), "111.444.777-35");
    await preencherCamposObrigatorios(usuario);
    await usuario.click(screen.getByRole("button", { name: "Cadastrar cliente" }));

    await waitFor(() => expect(onSucesso).toHaveBeenCalled());
    expect(push).not.toHaveBeenCalled();
    expect(refresh).toHaveBeenCalled();
  });
});
