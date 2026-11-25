const orbit = document.querySelector(".nf-orbit")

if (orbit) {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)")
  let animation
  let gsapRequested = false

  function updateOrbit() {
    animation?.kill()
    orbit.style.removeProperty("transform")

    if (!motionPreference.matches && window.gsap) {
      animation = window.gsap.fromTo(orbit, { rotation: 0 }, {
        rotation: 360,
        duration: 4.8,
        ease: "none",
        repeat: -1
      })
    }
  }

  function loadOrbit() {
    if (document.readyState !== "complete" || motionPreference.matches || gsapRequested) return

    gsapRequested = true
    const gsapScript = document.createElement("script")
    gsapScript.src = "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"
    gsapScript.fetchPriority = "low"
    gsapScript.addEventListener("load", updateOrbit, { once: true })
    document.head.append(gsapScript)
  }

  motionPreference.addEventListener("change", () => {
    updateOrbit()
    loadOrbit()
  })

  if (document.readyState === "complete") {
    loadOrbit()
  } else {
    window.addEventListener("load", loadOrbit, { once: true })
  }
}

