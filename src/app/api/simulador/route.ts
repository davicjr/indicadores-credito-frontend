import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { paraPayloadSimulador, paraResultadoSimulador, type SimuladorEntrada } from "@/lib/simulador-api";

export async function POST(request: NextRequest) {
  const entrada: SimuladorEntrada = await request.json();

  const respostaBackend = await fetch(`${env.dadosApiUrl()}/simulador`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paraPayloadSimulador(entrada)),
  });

  const corpo = await respostaBackend.json().catch(() => null);

  if (!respostaBackend.ok) {
    return NextResponse.json(corpo, { status: respostaBackend.status });
  }

  return NextResponse.json(paraResultadoSimulador(corpo));
}
