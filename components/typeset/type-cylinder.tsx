"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

/**
 * The Typeset 3D beat: a rotating cylinder wrapped in a typographic texture drawn
 * to an offscreen 2D canvas (no external font/asset — basePath-safe). Raw
 * three.js, DPR-clamped, rAF paused off-screen/hidden, fully disposed on unmount.
 * Mounted only by TypeBeat behind capability + reduced-motion gates.
 */
export default function TypeCylinder() {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    renderer.domElement.style.display = "block"

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    // --- typographic texture ---
    const tc = document.createElement("canvas")
    tc.width = 2048
    tc.height = 256
    const g = tc.getContext("2d")!
    g.fillStyle = "#06070c"
    g.fillRect(0, 0, tc.width, tc.height)
    g.font = "800 150px Inter, system-ui, sans-serif"
    g.textBaseline = "middle"
    const phrase = "TYPESET ✦ COMPONENTS ✦ THEMES ✦ MCP ✦ "
    g.fillStyle = "#c7ccf7"
    let x = 0
    const m = g.measureText(phrase)
    while (x < tc.width + m.width) {
      g.fillText(phrase, x, tc.height / 2)
      x += m.width
    }
    const texture = new THREE.CanvasTexture(tc)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.set(3, 1)
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()

    const geometry = new THREE.CylinderGeometry(2.2, 2.2, 1.6, 96, 1, true)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    })
    const cyl = new THREE.Mesh(geometry, material)
    cyl.rotation.z = 0.12
    scene.add(cyl)

    let targetX = 0
    const onMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect()
      targetX = ((e.clientX - r.left) / r.width) * 2 - 1
    }
    mount.addEventListener("mousemove", onMove, { passive: true })

    const resize = () => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    let running = true
    const io = new IntersectionObserver(([e]) => (running = e.isIntersecting), { threshold: 0.01 })
    io.observe(mount)
    const onVis = () => (running = document.visibilityState === "visible")
    document.addEventListener("visibilitychange", onVis)

    const clock = new THREE.Clock()
    let raf = 0
    const render = () => {
      raf = requestAnimationFrame(render)
      if (!running) return
      const dt = clock.getDelta()
      cyl.rotation.y += dt * 0.25
      camera.position.x += (targetX * 0.8 - camera.position.x) * 0.04
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      mount.removeEventListener("mousemove", onMove)
      geometry.dispose()
      material.dispose()
      texture.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} aria-hidden className="absolute inset-0 h-full w-full" />
}
