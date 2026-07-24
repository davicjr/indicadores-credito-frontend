import { NextRequest } from "next/server";
import { proxyParaClientes } from "@/lib/proxy-clientes";

export async function POST(request: NextRequest) {
  const corpo = await request.json();
  return proxyParaClientes("/usuarios", "POST", corpo);
}
