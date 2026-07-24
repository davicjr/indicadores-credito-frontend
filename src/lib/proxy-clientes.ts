import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getToken } from "@/lib/session";

export async function proxyParaClientes(
  caminho: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  corpo?: unknown
): Promise<NextResponse> {
  const token = await getToken();
  const respostaBackend = await fetch(`${env.clientesApiUrl()}${caminho}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(corpo !== undefined ? { body: JSON.stringify(corpo) } : {}),
  });

  // 204 (DELETE sem corpo) não pode ter body na resposta — Response nativo rejeita mesmo "null"
  // serializado (achado real: NextResponse.json(null, {status:204}) lança em runtime).
  if (respostaBackend.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const dados = await respostaBackend.json().catch(() => null);
  return NextResponse.json(dados, { status: respostaBackend.status });
}
