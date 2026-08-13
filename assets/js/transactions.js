function initTransactionModal() {
  const modal = document.getElementById("transaction-modal");

  if (!modal) {
    return null;
  }

  const panel = modal.querySelector(".transaction-modal__panel");
  const titleEl = modal.querySelector("[data-transaction-title]");
  const amountEl = modal.querySelector("[data-transaction-amount]");
  const dateEl = modal.querySelector("[data-transaction-date]");
  const invoiceRow = modal.querySelector("[data-transaction-invoice-row]");
  const invoiceLink = modal.querySelector("[data-transaction-invoice]");
  const invoiceIdEl = modal.querySelector("[data-transaction-invoice-id]");
  const closeTriggers = modal.querySelectorAll("[data-transaction-close]");
  const openTriggers = document.querySelectorAll(".transaction-card__view");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastTrigger = null;
  let closeTimer = 0;

  const getFocusable = () => {
    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length && !element.closest("[hidden]"));
  };

  const finishClose = () => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    openTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));

    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
  };

  const closeModal = () => {
    if (modal.hidden || !modal.classList.contains("is-open")) {
      return;
    }

    modal.classList.remove("is-open");
    window.clearTimeout(closeTimer);

    if (prefersReducedMotion) {
      finishClose();
      return;
    }

    closeTimer = window.setTimeout(finishClose, 520);
  };

  const fillModal = (card) => {
    const title = card.querySelector(".transaction-card__title")?.textContent?.trim() || "";
    const date = card.querySelector(".transaction-card__date")?.textContent?.trim() || "";
    const amount = card.querySelector(".transaction-card__amount");
    const invoice = card.dataset.invoice || "";

    titleEl.textContent = title;
    dateEl.textContent = date;
    amountEl.textContent = amount?.textContent?.trim() || "";
    amountEl.classList.toggle(
      "transaction-modal__amount--debit",
      Boolean(amount?.classList.contains("transaction-card__amount--debit"))
    );
    amountEl.classList.toggle(
      "transaction-modal__amount--credit",
      Boolean(amount?.classList.contains("transaction-card__amount--credit"))
    );

    if (invoice) {
      invoiceRow.hidden = false;
      invoiceIdEl.textContent = invoice;
      invoiceLink.setAttribute("href", `#invoice-${invoice}`);
    } else {
      invoiceRow.hidden = true;
      invoiceIdEl.textContent = "";
      invoiceLink.setAttribute("href", "#");
    }
  };

  const openModal = (trigger) => {
    const card = trigger.closest(".transaction-card");

    if (!card) {
      return;
    }

    lastTrigger = trigger;
    window.clearTimeout(closeTimer);
    fillModal(card);

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    openTriggers.forEach((item) => item.setAttribute("aria-expanded", String(item === trigger)));
    void modal.offsetWidth;
    modal.classList.add("is-open");

    window.requestAnimationFrame(() => {
      panel.focus();
    });
  };

  openTriggers.forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", () => {
      openModal(trigger);
    });
  });

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      closeModal();
    });
  });

  panel.addEventListener("transitionend", (event) => {
    if (event.target !== panel || event.propertyName !== "transform") {
      return;
    }

    if (!modal.classList.contains("is-open")) {
      window.clearTimeout(closeTimer);
      finishClose();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden || !modal.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = getFocusable();
    if (!focusable.length) {
      panel.focus();
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !panel.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });
}

function initTransactions() {
  const root = document.querySelector(".transactions");

  if (!root) {
    return;
  }

  const yearRoot = root.querySelector("[data-year-switcher]");
  const yearTrigger = yearRoot?.querySelector("[data-year-trigger]");
  const yearLabel = yearTrigger?.querySelector("[data-year-label]");
  const yearOptions = Array.from(yearRoot?.querySelectorAll("[data-year]") || []);
  const cards = Array.from(root.querySelectorAll(".transaction-card"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initTransactionModal();

  const closeYearMenu = () => {
    if (!yearRoot || !yearTrigger) {
      return;
    }

    yearRoot.classList.remove("is-open");
    yearTrigger.setAttribute("aria-expanded", "false");
  };

  const revealCards = () => {
    if (prefersReducedMotion) {
      root.classList.add("is-revealed");
      return;
    }

    root.classList.remove("is-revealed");
    void root.offsetWidth;
    root.classList.add("is-revealed");
  };

  const filterByYear = (year) => {
    cards.forEach((card) => {
      card.hidden = card.dataset.year !== year;
    });

    const hasVisible = cards.some((card) => !card.hidden);
    root.classList.toggle("is-empty", !hasVisible);

    yearOptions.forEach((option) => {
      const isActive = option.dataset.year === year;
      option.classList.toggle("is-active", isActive);
      option.setAttribute("aria-selected", String(isActive));
    });

    if (yearLabel) {
      yearLabel.textContent = year;
    }

    revealCards();
  };

  if (yearTrigger && yearRoot) {
    yearTrigger.addEventListener("click", () => {
      const isOpen = yearRoot.classList.toggle("is-open");
      yearTrigger.setAttribute("aria-expanded", String(isOpen));
    });

    yearOptions.forEach((option) => {
      option.addEventListener("click", () => {
        filterByYear(option.dataset.year);
        closeYearMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (!yearRoot.contains(event.target)) {
        closeYearMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeYearMenu();
      }
    });
  }

  const activeOption = yearOptions.find((option) => option.classList.contains("is-active")) || yearOptions[0];
  if (activeOption) {
    filterByYear(activeOption.dataset.year);
  } else {
    revealCards();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTransactions);
} else {
  initTransactions();
}
