function initDashboardTabs() {
  const root = document.querySelector(".dashboard-tabs");
  if (!root) {
    return;
  }

  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!tabs.length || !panels.length) {
    return;
  }

  const revealShipments = (panel) => {
    panel.classList.remove("is-revealed");

    if (prefersReducedMotion) {
      panel.classList.add("is-revealed");
      return;
    }

    void panel.offsetWidth;
    panel.classList.add("is-revealed");
  };

  const activateTab = (nextTab) => {
    const nextPanelId = nextTab.getAttribute("aria-controls");

    tabs.forEach((tab) => {
      const isActive = tab === nextTab;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.id === nextPanelId;
      panel.classList.toggle("is-active", isActive);
      panel.classList.remove("is-revealed");
      panel.hidden = !isActive;
    });

    const nextPanel = panels.find((panel) => panel.id === nextPanelId);
    if (nextPanel) {
      revealShipments(nextPanel);
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      if (tab.getAttribute("aria-selected") === "true") {
        return;
      }

      activateTab(tab);
    });

    tab.addEventListener("keydown", (event) => {
      let targetIndex = null;

      if (event.key === "ArrowRight") {
        targetIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        targetIndex = 0;
      } else if (event.key === "End") {
        targetIndex = tabs.length - 1;
      }

      if (targetIndex === null) {
        return;
      }

      event.preventDefault();
      const nextTab = tabs[targetIndex];
      activateTab(nextTab);
      nextTab.focus();
    });
  });

  const initialPanel = panels.find((panel) => panel.classList.contains("is-active")) || panels[0];
  if (initialPanel && !initialPanel.classList.contains("is-revealed")) {
    revealShipments(initialPanel);
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
      const shopInput = modal.querySelector("#declaration-shop");
      const shipment = trigger?.closest(".dashboard-shipment, .accepted-card, .dashboard-consignment");
      const tracking = shipment?.querySelector(".dashboard-shipment__tracking, .accepted-card__tracking")?.textContent?.trim();

      if (trackingInput) {
        trackingInput.value = tracking || "";
      }

      return trackingInput?.value ? shopInput : trackingInput;
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
  const citySelect = document.querySelector("#pickup-city");
  const branchSelect = document.querySelector("#pickup-branch");
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
    if (!branchSelect) {
      return;
    }

    const branches = branchesByCity[city] || [];
    branchSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = "ფილიალი";
    branchSelect.append(placeholder);

    branches.forEach((branch) => {
      const option = document.createElement("option");
      option.value = branch.value;
      option.textContent = branch.label;
      branchSelect.append(option);
    });

    branchSelect.disabled = !branches.length;
  };

  citySelect?.addEventListener("change", () => {
    populateBranches(citySelect.value);
  });

  initSheetModal({
    modalId: "pickup-modal",
    openSelector: "[data-pickup-open]",
    onOpen() {
      populateBranches("");
      return citySelect;
    },
  });
}

function initCourierModal() {
  initSheetModal({
    modalId: "courier-modal",
    openSelector: "[data-courier-open]",
    onOpen({ modal }) {
      return modal.querySelector("#courier-city");
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initDashboardTabs();
    initDeclarationModal();
    initPickupModal();
    initCourierModal();
  });
} else {
  initDashboardTabs();
  initDeclarationModal();
  initPickupModal();
  initCourierModal();
}
