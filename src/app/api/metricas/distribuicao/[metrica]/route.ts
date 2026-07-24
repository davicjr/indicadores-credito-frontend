import { NextRequest, NextResponse } from "next/server";
import { getDistribuicaoMetrica } from "@/lib/dados-api";

interface RotaParams {
  params: Promise<{ metrica: string }>;
}

export async function GET(_request: NextRequest, { params }: RotaParams) {
  const { metrica } = await params;
  try {
    const distribuicao = await getDistribuicaoMetrica(metrica);
    return NextResponse.json(distribuicao);
  } catch {
    return NextResponse.json({ mensagem: `Não foi possível carregar a métrica "${metrica}".` }, { status: 502 });
  }
}
