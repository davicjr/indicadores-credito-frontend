import { NextRequest } from "next/server";
import { proxyParaClientes } from "@/lib/proxy-clientes";

export async function PUT(request: NextRequest) {
  const corpo = await request.json();
  return proxyParaClientes("/usuarios/me/senha", "PUT", corpo);
}
