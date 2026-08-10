function initAcceptedCards() {
  const root = document.querySelector(".accepted");

  if (!root) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    root.classList.add("is-revealed");
    return;
  }

  root.classList.remove("is-revealed");
  void root.offsetWidth;
  root.classList.add("is-revealed");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAcceptedCards);
} else {
  initAcceptedCards();
}
