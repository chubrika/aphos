function initDashboardTabs() {
  if (typeof initTabs === "function") {
    initTabs(".dashboard-tabs");
  }
}

function initSheetModal({
  modalId,
  openSelector,
  closeSelector = "[data-modal-close]",
  onOpen,
}) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    return null;
  }

  const panel = modal.querySelector(".declaration-modal__panel");
  const form = modal.querySelector("form");
  const closeTriggers = modal.querySelectorAll(closeSelector);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastTrigger = null;
  let closeTimer = 0;

  const getFocusable = () => {
    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      return !element.hasAttribute("hidden")
        && !element.classList.contains("visually-hidden")
        && element.type !== "file"
        && element.getClientRects().length;
    });
  };

  const resetForm = () => {
    if (!form) {
      return;
    }

    form.reset();
    form.querySelectorAll("[data-file-name]").forEach((nameEl) => {
      nameEl.hidden = true;
      nameEl.textContent = "";
    });
  };

  const finishClose = () => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    resetForm();

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

  const openModal = (trigger) => {
    lastTrigger = trigger || null;
    window.clearTimeout(closeTimer);
    resetForm();

    const focusTarget = onOpen?.({ modal, form, trigger });

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    void modal.offsetWidth;
    modal.classList.add("is-open");

    window.requestAnimationFrame(() => {
      (focusTarget || getFocusable()[0])?.focus();
    });
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(openSelector);
    if (!trigger || trigger.closest(".declaration-modal")) {
      return;
    }

    event.preventDefault();
    openModal(trigger);
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

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    closeModal();
  });

  return { modal, form, openModal, closeModal };
}

function initDeclarationModal() {
  const sheet = initSheetModal({
    modalId: "declaration-modal",
    openSelector: ".dashboard-shipment__declare, .dashboard-hero__cta",
    onOpen({ modal, trigger }) {
      const trackingInput = modal.querySelector("#declaration-tracking");
      const shopTrigger = modal.querySelector("#declaration-shop")
        ?.closest("[data-search-select]")
        ?.querySelector(".search-select__trigger");
      const shipment = trigger?.closest(".dashboard-shipment, .accepted-card, .dashboard-consignment");
      const tracking = shipment?.querySelector(".dashboard-shipment__tracking, .accepted-card__tracking")?.textContent?.trim();

      if (trackingInput) {
        trackingInput.value = tracking || "";
      }

      return trackingInput?.value ? shopTrigger : trackingInput;
    },
  });

  sheet?.form?.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener("change", () => {
      const nameEl = input.closest(".declaration-modal__upload")?.querySelector("[data-file-name]");
      if (!nameEl) {
        return;
      }

      const file = input.files?.[0];
      nameEl.textContent = file ? file.name : "";
      nameEl.hidden = !file;
    });
  });
}

function initPickupModal() {
  const cityInput = document.querySelector("#pickup-city");
  const branchRoot = document.querySelector("[data-search-select-branch]");
  const branchesByCity = {
    tbilisi: [
      { value: "freedom", label: "თავისუფლების მოედანი 2" },
      { value: "vake", label: "ვაკე, ჭავჭავაძის 37" },
      { value: "saburtalo", label: "საბურთალო, ვაჟა-ფშაველას 71" },
    ],
    batumi: [
      { value: "batumi-center", label: "ბათუმი, ცენტრი" },
      { value: "batumi-boulevard", label: "ბათუმი, ბულვარი" },
    ],
    kutaisi: [
      { value: "kutaisi-center", label: "ქუთაისი, ცენტრი" },
    ],
    rustavi: [
      { value: "rustavi-center", label: "რუსთავი, ცენტრი" },
    ],
  };

  const populateBranches = (city) => {
    if (!branchRoot) {
      return;
    }

    const list = branchRoot.querySelector(".search-select__list");
    const hiddenInput = branchRoot.querySelector('input[type="hidden"]');
    const trigger = branchRoot.querySelector(".search-select__trigger");
    const labelEl = branchRoot.querySelector("[data-search-label]");
    const placeholder = labelEl?.dataset.placeholder || "ფილიალი*";
    const branches = branchesByCity[city] || [];

    if (!list || !hiddenInput || !trigger) {
      return;
    }

    list.innerHTML = "";

    branches.forEach((branch) => {
      const option = document.createElement("li");
      option.role = "option";
      option.className = "search-select__option";
      option.dataset.value = branch.value;
      option.tabIndex = -1;
      option.setAttribute("aria-selected", "false");
      option.textContent = branch.label;
      list.append(option);
    });

    hiddenInput.value = "";
    hiddenInput.dispatchEvent(new Event("input", { bubbles: true }));
    hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));

    if (labelEl) {
      labelEl.textContent = placeholder;
    }

    trigger.disabled = !branches.length;
    trigger.classList.toggle("is-placeholder", true);
    trigger.classList.remove("is-invalid");
    branchRoot.classList.remove("is-open");
  };

  cityInput?.addEventListener("change", () => {
    populateBranches(cityInput.value);
  });

  initSheetModal({
    modalId: "pickup-modal",
    openSelector: "[data-pickup-open]",
    onOpen() {
      populateBranches("");
      return document
        .querySelector("#pickup-modal [data-search-select]:not([data-search-select-branch])")
        ?.querySelector(".search-select__trigger");
    },
  });
}

function initCourierModal() {
  initSheetModal({
    modalId: "courier-modal",
    openSelector: "[data-courier-open]",
    onOpen({ modal }) {
      return modal
        .querySelector("#courier-city")
        ?.closest("[data-search-select]")
        ?.querySelector(".search-select__trigger");
    },
  });
}

function initTrackingModal() {
  initSheetModal({
    modalId: "tracking-modal",
    openSelector: ".dashboard-shipment__icon-btn--tracking",
    onOpen({ modal, trigger }) {
      const flightEl = modal.querySelector("[data-tracking-flight]");
      const consignment = trigger?.closest(".dashboard-consignment, .accepted-card");
      const flight = consignment
        ?.querySelector(".dashboard-consignment__id, .accepted-card__id")
        ?.textContent
        ?.trim();

      if (flightEl && flight) {
        flightEl.textContent = flight;
      }

      return modal.querySelector(".declaration-modal__close");
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initDashboardTabs();
    initSearchSelects();
    initDeclarationModal();
    initPickupModal();
    initCourierModal();
    initTrackingModal();
  });
} else {
  initDashboardTabs();
  initSearchSelects();
  initDeclarationModal();
  initPickupModal();
  initCourierModal();
  initTrackingModal();
}
