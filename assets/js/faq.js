function initFaq() {
  const root = document.querySelector(".faq");

  if (!root) {
    return;
  }

  const items = Array.from(root.querySelectorAll(".faq-item"));
  const toggleAll = root.querySelector("[data-faq-toggle-all]");
  const toggleAllLabel = toggleAll?.querySelector(".faq__toggle-all-label");
  const labels = {
    expand: "ყველას გახსნა",
    collapse: "ყველას დახურვა",
  };

  const setItemOpen = (item, open) => {
    const trigger = item.querySelector(".faq-item__trigger");

    item.classList.toggle("is-open", open);

    if (trigger) {
      trigger.setAttribute("aria-expanded", String(open));
    }
  };

  const areAllOpen = () => items.every((item) => item.classList.contains("is-open"));

  const syncToggleAll = () => {
    if (!toggleAll || !toggleAllLabel) {
      return;
    }

    const expanded = areAllOpen();

    toggleAll.classList.toggle("is-expanded", expanded);
    toggleAll.setAttribute("aria-expanded", String(expanded));
    toggleAllLabel.textContent = expanded ? labels.collapse : labels.expand;
  };

  items.forEach((item) => {
    const trigger = item.querySelector(".faq-item__trigger");

    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", () => {
      setItemOpen(item, !item.classList.contains("is-open"));
      syncToggleAll();
    });
  });

  if (toggleAll) {
    toggleAll.addEventListener("click", () => {
      const expand = !areAllOpen();

      items.forEach((item) => {
        setItemOpen(item, expand);
      });

      syncToggleAll();
    });
  }

  syncToggleAll();

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
  document.addEventListener("DOMContentLoaded", initFaq);
} else {
  initFaq();
}
