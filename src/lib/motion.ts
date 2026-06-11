import type { Transition, Variants } from "framer-motion"

// Typed easing tuples — fixes Framer Motion v12 TypeScript errors
export const ease = {
  out:   [0.22, 1, 0.36, 1]       as const,
  in:    [0.55, 0, 1, 0.45]       as const,
  inOut: [0.76, 0, 0.24, 1]       as const,
  back:  [0.34, 1.42, 0.64, 1]    as const,
} satisfies Record<string, [number, number, number, number]>

export const transition = {
  fast:   { duration: 0.30, ease: ease.out }    as Transition,
  base:   { duration: 0.50, ease: ease.out }    as Transition,
  slow:   { duration: 0.70, ease: ease.out }    as Transition,
  spring: { type: "spring", stiffness: 280, damping: 24 } as Transition,
}

// Variant factories — use initial="hidden" animate="visible"
export const fadeUp = (delay = 0): Variants => ({
  hidden:  { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: ease.out, delay },
  },
})

export const fadeIn = (delay = 0): Variants => ({
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.40, ease: ease.out, delay },
  },
})

export const stagger = (staggerChildren = 0.08): Variants => ({
  hidden:  {},
  visible: { transition: { staggerChildren, delayChildren: 0.05 } },
})

export const scaleIn = (delay = 0): Variants => ({
  hidden:  { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.50, ease: ease.out, delay },
  },
})