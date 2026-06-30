document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.slug !== "daniela-catering") {
    return;
  }

  const targets = document.querySelectorAll(
    ".lead-form, .buttons, .catering-highlights, .catering-section, .catering-item, .catering-service-option"
  );
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  targets.forEach((target, index) => {
    target.classList.add("reveal-on-scroll");
    target.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12,
    }
  );

  targets.forEach((target) => observer.observe(target));
});
