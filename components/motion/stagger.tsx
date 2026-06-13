"use client"

import { motion } from "framer-motion"
import { EASE_OUT_EXPO } from "./fade-in"

interface StaggerGroupProps {
  children: React.ReactNode
  className?: string
  /** Seconds between each child's entrance. */
  stagger?: number
}

/** Container that staggers its StaggerItem children into view (once). */
export function StaggerGroup({ children, className, stagger = 0.06 }: StaggerGroupProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
      }}
    >
      {children}
    </motion.div>
  )
}
