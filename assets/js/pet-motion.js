document.addEventListener("DOMContentLoaded", () => {
  const profile = document.querySelector(".pet-editorial");
  if (!profile) return;

  const targets = profile.querySelectorAll(
    ".pet-personality, .pet-trait, .pet-identity, .pet-vaccines, .pet-human, .pet-telegram, .legal-footer"
  );
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  targets.forEach((target, index) => {
    target.classList.add("pet-reveal");
    target.style.setProperty("--pet-delay", `${(index % 3) * 65}ms`);
  });

  if (reducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((target) => observer.observe(target));
});
