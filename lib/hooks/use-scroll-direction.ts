"use client"

import { useState, useEffect } from 'react'

/**
 * Detects whether the window is being scrolled up or down and exposes a boolean
 * that flips once the user scrolls past 10px. Useful for hiding headers on scroll.
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateScrollDirection = () => {
      const scrollY = window.scrollY
      const direction = scrollY > lastScrollY ? 'down' : 'up'
      
      if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > 5) {
        setScrollDirection(direction)
      }
      
      setIsScrolled(scrollY > 10)
      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        // Batch calculations with RAF so we avoid layout thrash if scroll fires rapidly.
        requestAnimationFrame(updateScrollDirection)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [scrollDirection])

  return { scrollDirection, isScrolled }
}
