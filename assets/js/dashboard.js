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
    form.querySelectorAll("[data-clearance-upload]").forEach((row) => {
      row.classList.remove("has-file");
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

function isDeclarationPriceValid(value) {
  const normalized = String(value || "").trim().replace(",", ".");
  return /^\d+(\.\d{1,2})?$/.test(normalized);
}

function closeDeclarationProductSelect(row) {
  const select = row.querySelector("[data-search-select]");
  const trigger = row.querySelector(".search-select__trigger");
  const menu = row.querySelector(".search-select__menu");

  select?.classList.remove("is-open");
  trigger?.setAttribute("aria-expanded", "false");

  if (menu) {
    menu.hidden = true;
    menu.setAttribute("aria-hidden", "true");
  }
}

function initDeclarationProducts(form) {
  if (!form || form.dataset.declarationProductsReady === "true") {
    return;
  }

  const list = form.querySelector("[data-declaration-products]");
  const template = document.getElementById("declaration-product-template");
  const addNewButton = form.querySelector("[data-declaration-add-product]");

  if (!list || !template?.content?.firstElementChild || !addNewButton) {
    return;
  }

  form.dataset.declarationProductsReady = "true";

  let nextIndex = 0;

  const getRows = () => Array.from(list.querySelectorAll("[data-declaration-product]"));

  const setRowInputsEnabled = (row, enabled) => {
    const trigger = row.querySelector(".search-select__trigger");
    const price = row.querySelector("[data-product-price]");
    const currency = row.querySelector("[data-product-currency]");

    if (trigger) {
      trigger.disabled = !enabled;
    }

    if (price) {
      price.readOnly = !enabled;
      price.tabIndex = enabled ? 0 : -1;
    }

    if (currency) {
      currency.disabled = !enabled;
      currency.tabIndex = enabled ? 0 : -1;
    }
  };

  const setEditButtonMode = (row, mode) => {
    const editButton = row.querySelector("[data-product-edit]");
    const isSave = mode === "save";

    if (!editButton) {
      return;
    }

    editButton.setAttribute("aria-label", isSave ? "შენახვა" : "რედაქტირება");
    editButton.classList.toggle("declaration-product__action--save", isSave);
  };

  const updateChrome = () => {
    const rows = getRows();
    const hasUnlocked = rows.some((row) => !row.classList.contains("is-locked"));

    addNewButton.hidden = hasUnlocked;

    rows.forEach((row) => {
      const locked = row.classList.contains("is-locked");
      const isEditing = row.classList.contains("is-editing");
      const addButton = row.querySelector("[data-product-add]");
      const editButton = row.querySelector("[data-product-edit]");
      const deleteButton = row.querySelector("[data-product-delete]");

      if (addButton) {
        addButton.hidden = locked || isEditing;
      }

      if (editButton) {
        editButton.hidden = !locked && !isEditing;

        if (!editButton.hidden) {
          setEditButtonMode(row, isEditing ? "save" : "edit");
        }
      }

      if (deleteButton) {
        deleteButton.hidden = !(locked || isEditing);
      }
    });
  };

  const setRowLocked = (row, locked) => {
    row.classList.toggle("is-locked", locked);

    if (locked) {
      row.classList.remove("is-editing");
      closeDeclarationProductSelect(row);
    }

    setRowInputsEnabled(row, !locked);
    updateChrome();
  };

  const startRowEditing = (row) => {
    row.classList.remove("is-locked");
    row.classList.add("is-editing");
    setRowInputsEnabled(row, true);
    updateChrome();
  };

  const saveRowEditing = (row) => {
    row.classList.remove("is-editing");
    row.classList.add("is-locked");
    closeDeclarationProductSelect(row);
    setRowInputsEnabled(row, false);
    updateChrome();
  };

  const validateRow = (row) => {
    const category = row.querySelector("[data-product-category]");
    const price = row.querySelector("[data-product-price]");
    const trigger = row.querySelector(".search-select__trigger");
    let isValid = true;

    if (!category?.value) {
      trigger?.classList.add("is-invalid");
      isValid = false;
    }

    if (!isDeclarationPriceValid(price?.value || "")) {
      price?.classList.add("is-invalid");
      isValid = false;
    }

    return isValid;
  };

  const createRow = () => {
    const index = nextIndex;
    nextIndex += 1;

    const row = template.content.firstElementChild.cloneNode(true);
    const categoryInput = row.querySelector("[data-product-category]");
    const categoryList = row.querySelector("[data-product-category-list]");
    const trigger = row.querySelector(".search-select__trigger");
    const productLabel = row.querySelector("[data-product-label]");
    const priceInput = row.querySelector("[data-product-price]");
    const priceLabel = row.querySelector("[data-product-price-label]");
    const currencySelect = row.querySelector("[data-product-currency]");

    const categoryId = `declaration-category-${index}`;
    const listId = `declaration-category-list-${index}`;
    const priceId = `declaration-price-${index}`;
    const currencyId = `declaration-currency-${index}`;

    if (categoryInput) {
      categoryInput.id = categoryId;
      categoryInput.name = `products[${index}][category]`;
    }

    if (categoryList) {
      categoryList.id = listId;
    }

    if (trigger) {
      trigger.setAttribute("aria-controls", listId);
    }

    if (productLabel) {
      productLabel.setAttribute("for", categoryId);
    }

    if (priceInput) {
      priceInput.id = priceId;
      priceInput.name = `products[${index}][price]`;
      priceInput.required = true;
    }

    if (priceLabel) {
      priceLabel.setAttribute("for", priceId);
    }

    if (currencySelect) {
      currencySelect.id = currencyId;
      currencySelect.name = `products[${index}][currency]`;
    }

    list.append(row);

    if (typeof initSearchSelects === "function") {
      initSearchSelects(row);
    }

    if (typeof initFloatingFields === "function") {
      initFloatingFields(row);
    }

    updateChrome();
    return row;
  };

  const resetList = () => {
    list.innerHTML = "";
    nextIndex = 0;
    createRow();
  };

  list.addEventListener("click", (event) => {
    const row = event.target.closest("[data-declaration-product]");
    if (!row) {
      return;
    }

    if (event.target.closest("[data-product-add]")) {
      event.preventDefault();
      if (validateRow(row)) {
        setRowLocked(row, true);
      }
      return;
    }

    if (event.target.closest("[data-product-edit]")) {
      event.preventDefault();

      if (row.classList.contains("is-editing")) {
        if (validateRow(row)) {
          saveRowEditing(row);
        }
        return;
      }

      startRowEditing(row);
      row.querySelector(".search-select__trigger")?.focus();
      return;
    }

    if (event.target.closest("[data-product-delete]")) {
      event.preventDefault();
      row.remove();
      if (!getRows().length) {
        createRow();
      } else {
        updateChrome();
      }
    }
  });

  list.addEventListener("input", (event) => {
    event.target.classList.remove("is-invalid");
    event.target.closest(".search-select")?.querySelector(".search-select__trigger")?.classList.remove("is-invalid");
  });

  list.addEventListener("change", (event) => {
    event.target.classList.remove("is-invalid");
    event.target.closest(".search-select")?.querySelector(".search-select__trigger")?.classList.remove("is-invalid");
  });

  addNewButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (getRows().some((row) => !row.classList.contains("is-locked"))) {
      return;
    }

    createRow()?.querySelector(".search-select__trigger")?.focus();
  });

  form.addEventListener(
    "submit",
    (event) => {
      const rows = getRows();

      rows
        .filter((row) => !row.classList.contains("is-locked"))
        .forEach((row) => {
          const category = row.querySelector("[data-product-category]")?.value;
          const price = row.querySelector("[data-product-price]")?.value.trim();

          if (!category && !price) {
            if (getRows().length > 1) {
              row.remove();
            }
            return;
          }

          if (!validateRow(row)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }

          setRowLocked(row, true);
        });

      if (!getRows().some((row) => row.classList.contains("is-locked"))) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const firstRow = getRows()[0];
        if (firstRow) {
          validateRow(firstRow);
        }
      }
    },
    true,
  );

  form.addEventListener("reset", () => {
    window.requestAnimationFrame(resetList);
  });

  resetList();
}

function initDeclarationModal() {
  const sheet = initSheetModal({
    modalId: "declaration-modal",
    openSelector: ".dashboard-shipment__declare:not([data-declaration-view-open]), .dashboard-hero__cta",
    onOpen({ modal, trigger }) {
      const trackingInput = modal.querySelector("#declaration-tracking");
      const shopTrigger = modal.querySelector("#declaration-shop")
        ?.closest("[data-search-select]")
        ?.querySelector(".search-select__trigger");
      const shipment = trigger?.closest(".dashboard-shipment, .dashboard-consignment");
      const tracking = shipment?.querySelector(".dashboard-shipment__tracking")?.textContent?.trim();

      if (trackingInput) {
        trackingInput.value = tracking || "";
      }

      return trackingInput?.value ? shopTrigger : trackingInput;
    },
  });

  initDeclarationProducts(sheet?.form);

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

function initClearanceUploads(form) {
  if (!form) {
    return;
  }

  const syncRow = (row) => {
    const input = row.querySelector('input[type="file"]');
    const nameEl = row.querySelector("[data-file-name]");
    const file = input?.files?.[0];

    row.classList.toggle("has-file", Boolean(file));

    if (nameEl) {
      nameEl.textContent = file ? file.name : "";
      nameEl.hidden = !file;
    }
  };

  form.querySelectorAll("[data-clearance-upload]").forEach((row) => {
    const input = row.querySelector('input[type="file"]');
    const removeButton = row.querySelector("[data-file-remove]");

    input?.addEventListener("change", () => {
      syncRow(row);
    });

    removeButton?.addEventListener("click", (event) => {
      event.preventDefault();
      if (input) {
        input.value = "";
      }
      syncRow(row);
    });
  });
}

function initClearanceModal() {
  const sheet = initSheetModal({
    modalId: "clearance-modal",
    openSelector: "[data-clearance-open]",
    onOpen({ modal }) {
      return modal.querySelector(".declaration-modal__close");
    },
  });

  initClearanceUploads(sheet?.form);

  sheet?.form?.addEventListener("submit", () => {
    window.showAlert?.("success", "დოკუმენტები წარმატებით გაიგზავნა");
  });

  sheet?.modal?.querySelector(".declaration-modal__cancel")?.addEventListener("click", () => {
    window.showAlert?.("error", "დაფიქსირდა შეცდომა");
  });
}

function initDeclarationViewModal() {
  initSheetModal({
    modalId: "declaration-view-modal",
    openSelector: "[data-declaration-view-open]",
    onOpen({ modal, trigger }) {
      const card = trigger?.closest(".dashboard-consignment, .dashboard-shipment");
      const tracking = card
        ?.querySelector(".dashboard-shipment__tracking")
        ?.textContent
        ?.trim();
      const weight = card
        ?.querySelector(".dashboard-shipment__weight")
        ?.textContent
        ?.trim();
      const flight = card
        ?.querySelector(".dashboard-consignment__id")
        ?.textContent
        ?.trim();
      const total = card
        ?.querySelector(".dashboard-shipment__price")
        ?.textContent
        ?.trim();

      const trackingEl = modal.querySelector("[data-view-tracking]");
      const weightEl = modal.querySelector("[data-view-weight]");
      const flightEl = modal.querySelector("[data-view-flight]");
      const invoiceEl = modal.querySelector("[data-view-invoice]");
      const totalEl = modal.querySelector("[data-view-total]");

      if (trackingEl && tracking) {
        trackingEl.textContent = tracking;
      }

      if (weightEl && weight) {
        weightEl.textContent = weight;
      }

      if (flightEl && flight) {
        flightEl.textContent = flight;
      }

      if (invoiceEl && flight) {
        invoiceEl.textContent = flight;
      }

      if (totalEl && total) {
        totalEl.textContent = total;
      }

      return modal.querySelector(".declaration-modal__close");
    },
  });
}

function initDeleteModal() {
  initSheetModal({
    modalId: "delete-modal",
    openSelector: "[data-delete-open]",
    onOpen({ modal }) {
      return modal.querySelector(".declaration-modal__submit");
    },
  });
}

function initTrackingModal() {
  initSheetModal({
    modalId: "tracking-modal",
    openSelector: ".dashboard-shipment__icon-btn--tracking",
    onOpen({ modal, trigger }) {
      const flightEl = modal.querySelector("[data-tracking-flight]");
      const consignment = trigger?.closest(".dashboard-consignment");
      const flight = consignment
        ?.querySelector(".dashboard-consignment__id")
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
    initClearanceModal();
    initDeclarationViewModal();
    initTrackingModal();
    initDeleteModal();
  });
} else {
  initDashboardTabs();
  initSearchSelects();
  initDeclarationModal();
  initPickupModal();
  initCourierModal();
  initClearanceModal();
  initDeclarationViewModal();
  initTrackingModal();
  initDeleteModal();
}
