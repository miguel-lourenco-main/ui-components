"use client"

import { motion } from "framer-motion"

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

interface FadeInProps {
  children: React.ReactNode
  className?: string
  /** Delay in seconds before the entrance starts. */
  delay?: number
  /** Animate when scrolled into view instead of on mount. */
  inView?: boolean
}

/** Standard entrance: fade + 12px rise with the app-wide expo ease. */
export function FadeIn({ children, className, delay = 0, inView = false }: FadeInProps) {
  const visible = { opacity: 1, y: 0 }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      {...(inView
        ? { whileInView: visible, viewport: { once: true, margin: "-10% 0px" } }
        : { animate: visible })}
      transition={{ duration: 0.5, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  )
}
