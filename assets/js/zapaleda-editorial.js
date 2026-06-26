document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  if (prefersReducedMotion.matches) return

  const parallaxItems = Array.from(document.querySelectorAll(".zpe-parallax"))
  if (!parallaxItems.length) return

  let ticking = false

  const updateParallax = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight

    for (const item of parallaxItems) {
      const parent = item.parentElement
      if (!parent) continue

      const rect = parent.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > viewportHeight) continue

      const speed = Number(item.dataset.parallaxSpeed || 0.08)
      const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight
      const offset = Math.max(-28, Math.min(28, progress * -100 * speed))

      item.style.transform = `translate3d(0, ${offset}px, 0) scale(1.06)`
    }

    ticking = false
  }

  const requestTick = () => {
    if (ticking) return
    ticking = true
    window.requestAnimationFrame(updateParallax)
  }

  updateParallax()
  window.addEventListener("scroll", requestTick, { passive: true })
  window.addEventListener("resize", requestTick)
})
