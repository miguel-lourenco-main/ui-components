"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { prefersReducedMotion } from "@/lib/motion/gsap-setup"

const TypeCylinder = dynamic(() => import("./type-cylinder"), { ssr: false })

function webglSupported(): boolean {
  try {
    const c = document.createElement("canvas")
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")))
  } catch {
    return false
  }
}

/**
 * The 3D type beat. A static wordmark is the default; the rotating type cylinder
 * mounts on top only when in view and the device can afford it.
 */
export function TypeBeat() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [show3d, setShow3d] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) return
    const coarse = window.matchMedia("(pointer: coarse)").matches
    const small = window.matchMedia("(max-width: 768px)").matches
    if (coarse || small || !webglSupported()) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShow3d(true)
            io.disconnect()
            break
          }
        }
      },
      { rootMargin: "200px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="relative w-full px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div
          ref={ref}
          className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden border border-[hsl(var(--ed-rule))] bg-card md:aspect-[2.4/1]"
        >
          {/* Static fallback wordmark — always present */}
          <div aria-hidden className="absolute inset-0 flex items-center justify-center">
            <span className="t-giant t-outline select-none opacity-60">TYPESET</span>
          </div>
          {show3d ? <TypeCylinder /> : null}
        </div>
      </div>
    </section>
  )
}
