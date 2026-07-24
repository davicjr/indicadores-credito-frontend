import { createElement, type HTMLAttributes, type ReactNode } from "react";
import styles from "./MotionReveal.module.css";

type MotionElement = "div" | "form" | "header" | "main" | "ol" | "section" | "span" | "ul";
type MotionDelay = 0 | 1 | 2 | 3;
type MotionVariant = "rise" | "fade" | "emphasis";

interface MotionBaseProps extends HTMLAttributes<HTMLElement> {
  as?: MotionElement;
  children: ReactNode;
  delay?: MotionDelay;
}

interface MotionRevealProps extends MotionBaseProps {
  variant?: MotionVariant;
}

const DELAY_CLASS: Record<MotionDelay, string | undefined> = {
  0: undefined,
  1: styles.delay1,
  2: styles.delay2,
  3: styles.delay3,
};

function classes(...nomes: Array<string | undefined>) {
  return nomes.filter(Boolean).join(" ");
}

/**
 * Entrada curta de um bloco novo ou substituído, usando somente os tokens de motion do produto.
 */
export function MotionReveal({
  as = "div",
  children,
  className,
  delay = 0,
  variant = "rise",
  ...props
}: MotionRevealProps) {
  return createElement(
    as,
    {
      ...props,
      className: classes(styles.reveal, styles[variant], DELAY_CLASS[delay], className),
    },
    children
  );
}

/**
 * Sequencia os filhos diretos de uma grade sem exigir configuração de animação em cada item.
 */
export function MotionStagger({
  as = "div",
  children,
  className,
  delay = 0,
  ...props
}: MotionBaseProps) {
  return createElement(
    as,
    {
      ...props,
      className: classes(styles.stagger, DELAY_CLASS[delay], className),
    },
    children
  );
}
