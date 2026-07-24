import { NextRequest } from "next/server";
import { proxyParaClientes } from "@/lib/proxy-clientes";

export async function GET(request: NextRequest) {
  return proxyParaClientes(`/clientes/resumo${request.nextUrl.search}`, "GET");
}
