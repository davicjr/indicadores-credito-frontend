"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { animate, createTimeline, cubicBezier } from "animejs";
import styles from "./Logomark.module.css";

interface LogomarkProps {
  tamanho: "pequeno" | "grande";
  // Dispara quando o marcador começa o pulso de chegada — usado pra sincronizar efeitos em
  // outros elementos da tela (ex.: brilho na régua do login) com o mesmo instante.
  aoPousar?: () => void;
}

// Mesma curva do design system (design_system.md#Motion) — "chega e assenta", sem overshoot.
const CURVA_ENTRADA = cubicBezier(0.16, 1, 0.3, 1);
const CURVA_SAIDA = cubicBezier(0.4, 0, 1, 1);

function reduzMotionAtivo(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// "O índice encontra a posição" — roteiro completo em
// .claude/docs/standards/design_system.md#Motion-da-logomark. ~1.6s: base desenha o eixo, haste
// sobe em dois tempos (pausa pra "conferir"), marcador desvia antes de encaixar, pulso + anel de
// confirmação no pouso.
export function Logomark({ tamanho, aoPousar }: LogomarkProps) {
  const baseRef = useRef<SVGRectElement>(null);
  const hasteRef = useRef<SVGRectElement>(null);
  const marcadorRef = useRef<SVGRectElement>(null);
  const pingRef = useRef<SVGRectElement>(null);
  // Nav não remonta na navegação interna do Next (mesmo layout, só troca de rota) — sem isso o
  // roteiro só tocava no F5. Trocar de página replaya a sequência inteira, de propósito.
  const pathname = usePathname();

  useEffect(() => {
    const base = baseRef.current;
    const haste = hasteRef.current;
    const marcador = marcadorRef.current;
    const ping = pingRef.current;
    if (!base || !haste || !marcador || !ping) return;

    function estadoFinalInstantaneo() {
      if (!base || !haste || !marcador || !ping) return;
      animate([base, marcador], { opacity: 1, duration: 1 });
      animate(base, { scaleX: 1, duration: 1 });
      animate(haste, { scaleY: 1, duration: 1 });
      animate(marcador, { translateX: 0, translateY: 0, scale: 1, duration: 1 });
      animate(ping, { opacity: 0, duration: 1 });
      aoPousar?.();
    }

    if (reduzMotionAtivo()) {
      estadoFinalInstantaneo();
      return;
    }

    let tempo: ReturnType<typeof createTimeline> | undefined;
    try {
      tempo = createTimeline({ defaults: { ease: CURVA_ENTRADA } })
        // 1. Base — o eixo se desenha de dentro pra fora
        .add(base, { opacity: [0, 1], scaleX: [0, 1], duration: 350 }, 0)
        // 2. Haste — sobe, pausa pra "conferir", completa até o topo
        .add(
          haste,
          {
            scaleY: [
              { to: 0.62, duration: 240 },
              { to: 0.62, duration: 80 },
              { to: 1, duration: 180 },
            ],
          },
          250
        )
        // 3. Marcador — entra de longe e desvia antes de encaixar na posição
        .add(
          marcador,
          {
            opacity: [{ to: 1, duration: 150 }],
            translateX: [{ to: -6, duration: 150 }, { to: 3, duration: 150 }, { to: 0, duration: 150 }],
            translateY: [{ to: -15, duration: 150 }, { to: -5, duration: 150 }, { to: 0, duration: 150 }],
            scale: [{ to: 0.85, duration: 150 }, { to: 0.95, duration: 150 }, { to: 1, duration: 150 }],
          },
          750
        )
        // 4. Chegada — pulso no marcador + anel de confirmação se expandindo
        .add(marcador, { scale: [1, 1.18, 1], duration: 260, onBegin: () => aoPousar?.() }, 1200)
        .add(ping, { opacity: [0.75, 0], scale: [1, 2.4], duration: 450, ease: CURVA_SAIDA }, 1200);
    } catch {
      estadoFinalInstantaneo();
      return;
    }

    return () => {
      tempo?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function nudge() {
    if (reduzMotionAtivo()) return;
    const marcador = marcadorRef.current;
    if (!marcador) return;
    try {
      animate(marcador, { scale: [1, 1.08, 1], duration: 150, ease: CURVA_ENTRADA });
    } catch {
      // nudge de hover é só um toque a mais — falhar aqui não deve incomodar o usuário
    }
  }

  return (
    <svg
      className={tamanho === "grande" ? styles.grande : styles.pequeno}
      viewBox="0 0 40 80"
      aria-hidden="true"
      onMouseEnter={nudge}
    >
      <rect
        ref={pingRef}
        x="14"
        y="8"
        width="12"
        height="12"
        fill="none"
        stroke="var(--acento)"
        strokeWidth="1.5"
        opacity="0"
      />
      <rect ref={baseRef} x="10" y="72" width="20" height="4" fill="var(--apagado)" />
      <rect ref={hasteRef} x="16" y="30" width="8" height="40" fill="var(--tinta)" />
      <rect ref={marcadorRef} x="14" y="8" width="12" height="12" fill="var(--acento)" />
    </svg>
  );
}
