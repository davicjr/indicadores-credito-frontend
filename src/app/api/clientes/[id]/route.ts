import { NextRequest } from "next/server";
import { proxyParaClientes } from "@/lib/proxy-clientes";

interface RotaParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RotaParams) {
  const { id } = await params;
  const corpo = await request.json();
  return proxyParaClientes(`/clientes/${id}`, "PUT", corpo);
}
