function initFooterReveal() {
  const footer = document.querySelector(".site-footer");

  if (!footer) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    footer.classList.add("is-revealed");
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.28,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealObserver.observe(footer);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFooterReveal);
} else {
  initFooterReveal();
}
