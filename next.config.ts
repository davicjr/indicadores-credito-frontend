import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server standalone: traça só as dependências realmente usadas em .next/standalone —
  // runtime da imagem Docker não precisa do node_modules inteiro.
  output: "standalone",
};

export default nextConfig;
