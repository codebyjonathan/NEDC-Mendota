"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

const REVEAL_DELAY_STEP_MS = 45
const REVEAL_DELAY_MAX_MS = 220
const CARD_TARGET_SELECTOR = [
  "a.rounded-2xl",
  "a.rounded-3xl",
  "div.rounded-2xl",
  "div.rounded-3xl",
  "section",
  "article",
].join(", ")

function uniqueTargets(elements: HTMLElement[]) {
  const deduped = new Set<HTMLElement>()
  elements.forEach((element) => {
    if (element.offsetHeight < 56 || element.classList.contains("rounded-full")) {
      return
    }
    deduped.add(element)
  })
  return Array.from(deduped)
}

export function ScrollSmoothnessEnhancer() {
  const pathname = usePathname()
  const hasMountedRef = useRef(false)

  useEffect(() => {
    // Avoid mutating DOM during initial hydration. We only enhance after
    // the app has fully mounted and route changes happen client-side.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    if (typeof window === "undefined") {
      return
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const scrollShells = Array.from(document.querySelectorAll<HTMLElement>(".home-scroll-shell")).filter(
      (shell) => shell.dataset.disableScrollReveal !== "true",
    )

    if (scrollShells.length === 0) {
      return
    }

    if (prefersReducedMotion) {
      scrollShells.forEach((shell) => {
        const animatedNodes = Array.from(shell.querySelectorAll<HTMLElement>(".scroll-reveal"))
        animatedNodes.forEach((node) => {
          node.classList.remove("scroll-reveal")
          node.classList.add("is-visible")
          node.style.removeProperty("transition-delay")
        })
      })
      return
    }

    if (!("IntersectionObserver" in window)) {
      scrollShells.forEach((shell) => {
        const sections = uniqueTargets([
          ...(Array.from(shell.children) as HTMLElement[]),
          ...Array.from(shell.querySelectorAll<HTMLElement>(CARD_TARGET_SELECTOR)),
        ])
        sections.forEach((section) => section.classList.add("is-visible"))
      })
      return
    }

    const observers: IntersectionObserver[] = []

    const runSetup = () => {
      scrollShells.forEach((shell) => {
        const sections = uniqueTargets([
          ...(Array.from(shell.children) as HTMLElement[]),
          ...Array.from(shell.querySelectorAll<HTMLElement>(CARD_TARGET_SELECTOR)),
        ])

        sections.forEach((section, index) => {
          if (section.classList.contains("scroll-reveal")) {
            return
          }

          section.classList.add("scroll-reveal")
          section.style.transitionDelay = `${Math.min(index * REVEAL_DELAY_STEP_MS, REVEAL_DELAY_MAX_MS)}ms`

          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                section.classList.add("is-visible")
                observer.disconnect()
              }
            },
            {
              root: shell,
              threshold: 0.15,
              rootMargin: "0px 0px -8% 0px",
            },
          )

          observer.observe(section)
          observers.push(observer)
        })
      })
    }

    const rafId = window.requestAnimationFrame(runSetup)

    return () => {
      window.cancelAnimationFrame(rafId)
      observers.forEach((observer) => observer.disconnect())
    }
  }, [pathname])

  return null
}
