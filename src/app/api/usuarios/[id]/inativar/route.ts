import { NextRequest } from "next/server";
import { proxyParaClientes } from "@/lib/proxy-clientes";

interface RotaParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: NextRequest, { params }: RotaParams) {
  const { id } = await params;
  return proxyParaClientes(`/usuarios/${id}/inativar`, "PATCH");
}
