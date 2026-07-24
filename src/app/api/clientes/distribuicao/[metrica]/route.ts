import { NextRequest } from "next/server";
import { proxyParaClientes } from "@/lib/proxy-clientes";

interface RotaParams {
  params: Promise<{ metrica: string }>;
}

export async function GET(request: NextRequest, { params }: RotaParams) {
  const { metrica } = await params;
  return proxyParaClientes(`/clientes/distribuicao/${metrica}${request.nextUrl.search}`, "GET");
}
