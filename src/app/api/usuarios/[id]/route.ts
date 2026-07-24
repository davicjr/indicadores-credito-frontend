import { NextRequest } from "next/server";
import { proxyParaClientes } from "@/lib/proxy-clientes";

interface RotaParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RotaParams) {
  const { id } = await params;
  return proxyParaClientes(`/usuarios/${id}`, "GET");
}

export async function PUT(request: NextRequest, { params }: RotaParams) {
  const { id } = await params;
  const corpo = await request.json();
  return proxyParaClientes(`/usuarios/${id}`, "PUT", corpo);
}

export async function DELETE(_request: NextRequest, { params }: RotaParams) {
  const { id } = await params;
  return proxyParaClientes(`/usuarios/${id}`, "DELETE");
}
