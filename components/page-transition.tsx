"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { COMPONENTS } from "@/components/component-navigation"
import { useRef, useEffect } from "react"

interface PageTransitionProps {
  children: React.ReactNode
}

/**
 * Animates between component detail pages using directional slide transitions based on carousel order.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const searchParams = useSearchParams()
  const componentParam = searchParams.get("component")
  const prevIndexRef = useRef<number>()

  const currentIndex = COMPONENTS.findIndex(c => c.id === componentParam)
  const prevIndex = prevIndexRef.current

  // On initial load, prevIndex is undefined, let's default to sliding from the right.
  const direction = prevIndex === undefined ? 1 : currentIndex > prevIndex ? 1 : -1

  useEffect(() => {
    prevIndexRef.current = currentIndex
  }, [currentIndex])

  // Debug logs to inspect the values
  console.log({
    component: componentParam,
    prevIndex,
    currentIndex,
    direction,
  })

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      position: "absolute",
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative",
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      position: "absolute",
    }),
  }

  return (
    <AnimatePresence initial={false} custom={direction}>
      <motion.div
        key={componentParam}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
