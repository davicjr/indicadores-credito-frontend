import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { Nav } from "@/components/Nav";
import { ToastProvider } from "@/components/ToastProvider";
import { getToken } from "@/lib/session";
import { getUsuarioAtual } from "@/lib/usuario-api";
import "./globals.css";

// Uma família só (IBM Plex) nos 3 papéis — serif no display, sans na interface, mono no dado —
// em vez de 3 fontes de origens diferentes. Ver design_system.md#Tipografia para o porquê.
const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--fonte-titulo",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--fonte-corpo",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fonte-dados",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Índice Real",
  description: "Um número. De verdade. — dashboard, cadastro de clientes e simulador de score.",
};

// Roda antes da primeira pintura — sem isso, a página nasce no tema errado e pisca ao corrigir.
// Ordem: preferência salva -> preferência do sistema -> claro como último fallback.
const SCRIPT_TEMA = `
(function () {
  try {
    var salvo = localStorage.getItem("tema");
    var tema =
      salvo === "light" || salvo === "dark"
        ? salvo
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.setAttribute("data-theme", tema);
  } catch (erro) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  const usuario = token ? await getUsuarioAtual() : null;

  return (
    // suppressHydrationWarning: o script anti-FOUC seta data-theme antes do React hidratar —
    // React não é dono desse atributo, então o aviso de mismatch aqui é falso-positivo
    // (padrão documentado do Next.js pra esse caso exato). Escopo só neste elemento, não
    // silencia mismatch de verdade em outro lugar da árvore.
    <html
      lang="pt-BR"
      className={`${plexSerif.variable} ${plexSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <ToastProvider>
          <ConfirmProvider>
            {token && <Nav usuario={usuario} />}
            {token ? <div className="moldura">{children}</div> : children}
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
