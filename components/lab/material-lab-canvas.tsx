"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

/**
 * The Material Lab signature: a living field of luminous indigo "substance".
 * A full-screen quad runs a single inline-GLSL fragment shader (domain-warped
 * fbm flow + a cursor light + scroll sink), so there are zero external assets
 * (basePath/asset-path safe). Raw three.js — no r3f/drei. DPR clamped, rAF
 * paused off-screen and when the tab is hidden, full dispose on unmount.
 * Mounted only by MaterialLabHero behind capability + reduced-motion gates.
 */
export default function MaterialLabCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" })
    } catch {
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x05060a, 1)
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    renderer.domElement.style.display = "block"

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uAspect: { value: 1 },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uScroll;
        uniform float uAspect;

        float hash(vec2 p){ p = fract(p * vec2(123.34, 345.45)); p += dot(p, p + 34.345); return fract(p.x * p.y); }
        float noise(vec2 p){
          vec2 i = floor(p), f = fract(p);
          float a = hash(i), b = hash(i + vec2(1.0,0.0)), c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
        }
        float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.0+10.0; a*=0.5; } return v; }

        void main(){
          vec2 uv = vUv;
          vec2 p = uv; p.x *= uAspect;
          float t = uTime * 0.06;

          vec2 q = vec2(fbm(p*2.0 + vec2(0.0,-t)), fbm(p*2.0 + vec2(5.2, 1.3 - t)));
          vec2 r = vec2(fbm(p*2.0 + 3.0*q + vec2(1.7, 9.2 + t*0.5)), fbm(p*2.0 + 3.0*q + vec2(8.3, 2.8)));
          float f = clamp(fbm(p*2.0 + 3.0*r) * 1.25, 0.0, 1.0);

          vec2 m = uMouse; m.x *= uAspect;
          float light = smoothstep(0.55, 0.0, distance(p, m));

          vec3 deep = vec3(0.02, 0.02, 0.045);
          vec3 c1 = vec3(0.376, 0.413, 0.824);
          vec3 c2 = vec3(0.55, 0.38, 0.90);
          vec3 c3 = vec3(0.17, 0.66, 0.95);

          vec3 col = deep;
          col = mix(col, c1, smoothstep(0.30, 0.70, f));
          col = mix(col, c2, smoothstep(0.55, 0.95, f) * 0.85);
          col += c3 * light * 0.55;
          col += c3 * pow(f, 3.0) * 0.30;

          col = mix(col, deep, clamp(uScroll, 0.0, 1.0) * 0.7);

          float vig = smoothstep(1.25, 0.30, distance(uv, vec2(0.5)));
          col *= vig;
          col += (hash(uv * vec2(1000.0, 800.0) + t) - 0.5) * 0.03;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    scene.add(mesh)

    const targetMouse = new THREE.Vector2(0.5, 0.5)
    const onMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect()
      targetMouse.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height)
    }
    window.addEventListener("mousemove", onMove, { passive: true })

    const resize = () => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      renderer.setSize(w, h, false)
      uniforms.uAspect.value = w / h
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    const onScroll = () => {
      const max = window.innerHeight || 1
      uniforms.uScroll.value = Math.min(1, Math.max(0, window.scrollY / max))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    let running = true
    const io = new IntersectionObserver(([e]) => (running = e.isIntersecting), { threshold: 0.01 })
    io.observe(mount)
    const onVis = () => {
      if (document.visibilityState !== "visible") running = false
      else running = true
    }
    document.addEventListener("visibilitychange", onVis)

    const clock = new THREE.Clock()
    let raf = 0
    const render = () => {
      raf = requestAnimationFrame(render)
      if (!running) return
      uniforms.uTime.value = clock.getElapsedTime()
      uniforms.uMouse.value.lerp(targetMouse, 0.05)
      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("scroll", onScroll)
      mesh.geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} aria-hidden className="absolute inset-0 h-full w-full" />
}
