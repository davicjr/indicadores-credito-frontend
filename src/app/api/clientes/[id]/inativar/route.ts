import { proxyParaClientes } from "@/lib/proxy-clientes";

interface RotaParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, { params }: RotaParams) {
  const { id } = await params;
  return proxyParaClientes(`/clientes/${id}/inativar`, "PATCH");
}
