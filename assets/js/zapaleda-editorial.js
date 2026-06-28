
document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.querySelector(".zpe-preloader")
  if (!preloader) return

  const startedAt = Date.now()
  const minMs = Number(preloader.dataset.minMs || 900)
  const maxMs = Number(preloader.dataset.maxMs || 7000)

  const hidePreloader = () => {
    const elapsed = Date.now() - startedAt
    const wait = Math.max(0, minMs - elapsed)
    window.setTimeout(() => {
      preloader.classList.add("is-hidden")
      window.setTimeout(() => preloader.remove(), 460)
    }, wait)
  }

  if (document.readyState === "complete") {
    hidePreloader()
  } else {
    window.addEventListener("load", hidePreloader, { once: true })
  }

  window.setTimeout(hidePreloader, maxMs)
})

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


document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  if (prefersReducedMotion.matches) return

  const popovers = Array.from(document.querySelectorAll(".zpe-gallery-pop"))
  if (!popovers.length) return

  const visiblePopovers = new Set()
  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const video = entry.target.querySelector(".zpe-gallery-pop")
          if (!video) continue

          if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
            visiblePopovers.add(video)
          } else {
            visiblePopovers.delete(video)
            resetPopover(video)
          }
        }
      }, { threshold: [0, 0.45, 0.75] })
    : null

  for (const video of popovers) {
    const figure = video.closest("figure")
    if (observer && figure) observer.observe(figure)
    if (!observer) visiblePopovers.add(video)
  }

  window.setInterval(() => {
    for (const video of visiblePopovers) {
      playPopoverTwice(video)
    }
  }, 3000)
})

function playPopoverTwice(video) {
  if (video.dataset.active === "true") return

  const maxPlays = Number(video.dataset.plays || 2)
  let played = 0
  video.dataset.active = "true"
  video.classList.add("is-active")

  const playNext = () => {
    played += 1
    video.currentTime = 0
    const playPromise = video.play()
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => resetPopover(video))
    }
  }

  const handleEnded = () => {
    if (played < maxPlays) {
      playNext()
      return
    }

    video.removeEventListener("ended", handleEnded)
    resetPopover(video)
  }

  video.addEventListener("ended", handleEnded)
  playNext()
}

function resetPopover(video) {
  video.pause()
  video.classList.remove("is-active")
  video.dataset.active = "false"
  try {
    video.currentTime = 0
  } catch {}
}
