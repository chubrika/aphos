function initAddresses() {
  const root = document.querySelector(".addresses");
  const list = document.querySelector(".addresses__list");
  const modal = document.getElementById("address-modal");

  if (!root || !list || !modal) {
    return;
  }

  const panel = modal.querySelector(".address-modal__panel");
  const form = document.getElementById("address-form");
  const titleEl = modal.querySelector("[data-address-modal-title]");
  const submitEl = modal.querySelector("[data-address-submit]");
  const nameInput = document.getElementById("address-name");
  const cityInput = document.getElementById("address-city");
  const centerInput = document.getElementById("address-center");
  const citySelect = cityInput?.closest("[data-search-select]");
  const centerSelect = centerInput?.closest("[data-search-select]");
  const addressInput = document.getElementById("address-line");
  const addButton = document.querySelector("[data-address-add]");
  const closeTriggers = modal.querySelectorAll("[data-address-close]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastTrigger = null;
  let editingCard = null;
  let closeTimer = 0;

  const setSearchSelectValue = (select, value) => {
    if (!select) {
      return;
    }

    const hiddenInput = select.querySelector('input[type="hidden"]');
    const labelEl = select.querySelector("[data-search-label]");
    const trigger = select.querySelector(".search-select__trigger");
    const options = Array.from(select.querySelectorAll(".search-select__option"));
    const placeholder = labelEl?.dataset.placeholder || labelEl?.textContent?.trim() || "";
    const option = options.find((item) => item.dataset.value === value);

    options.forEach((item) => {
      const selected = item === option;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-selected", String(selected));
    });

    if (!option) {
      if (hiddenInput) {
        hiddenInput.value = "";
      }
      if (labelEl) {
        labelEl.textContent = placeholder;
      }
      trigger?.classList.add("is-placeholder");
      trigger?.classList.remove("is-invalid");
      return;
    }

    if (hiddenInput) {
      hiddenInput.value = value;
    }
    if (labelEl) {
      labelEl.textContent =
        option.querySelector(".search-select__option-label")?.textContent?.trim() ||
        option.textContent.trim();
    }
    trigger?.classList.remove("is-placeholder", "is-invalid");
  };

  const editIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  `;
  const deleteIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  `;

  const revealCards = () => {
    if (prefersReducedMotion) {
      root.classList.add("is-revealed");
      return;
    }

    void root.offsetWidth;
    root.classList.add("is-revealed");
  };

  const getFocusable = () => {
    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length && !element.closest("[hidden]"));
  };

  const readForm = () => ({
    name: nameInput.value.trim(),
    city: cityInput.value,
    center: centerInput.value,
    address: addressInput.value.trim(),
  });

  const fillForm = (data) => {
    nameInput.value = data?.name || "";
    setSearchSelectValue(citySelect, data?.city || "");
    setSearchSelectValue(centerSelect, data?.center || "");
    addressInput.value = data?.address || "";
  };

  const writeCard = (card, data) => {
    card.dataset.name = data.name;
    card.dataset.city = data.city;
    card.dataset.center = data.center;
    card.dataset.address = data.address;
    card.querySelector(".address-card__title").textContent = data.address;
    card.querySelector(".address-card__label").textContent = data.name;
  };

  const createCard = (data) => {
    const item = document.createElement("li");
    item.className = "address-card";

    const info = document.createElement("div");
    info.className = "address-card__info";

    const title = document.createElement("p");
    title.className = "address-card__title";

    const label = document.createElement("p");
    label.className = "address-card__label";

    const actions = document.createElement("div");
    actions.className = "address-card__actions";
    actions.innerHTML = `
      <button class="address-card__action" type="button" data-address-edit aria-label="რედაქტირება">${editIcon}</button>
      <button class="address-card__action" type="button" data-address-delete aria-label="წაშლა">${deleteIcon}</button>
    `;

    info.append(title, label);
    item.append(info, actions);
    writeCard(item, data);
    return item;
  };

  const finishClose = () => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    editingCard = null;
    fillForm(null);

    if (lastTrigger && lastTrigger.isConnected && typeof lastTrigger.focus === "function") {
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

  const openModal = (mode, card, trigger) => {
    lastTrigger = trigger || null;
    editingCard = mode === "edit" ? card : null;
    window.clearTimeout(closeTimer);

    if (mode === "edit" && card) {
      fillForm({
        name: card.dataset.name || "",
        city: card.dataset.city || "",
        center: card.dataset.center || "",
        address: card.dataset.address || "",
      });
      titleEl.textContent = "მისამართის რედაქტირება";
      submitEl.textContent = "შეცვლა";
    } else {
      fillForm(null);
      titleEl.textContent = "მისამართის დამატება";
      submitEl.textContent = "დამატება";
    }

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    void modal.offsetWidth;
    modal.classList.add("is-open");

    window.requestAnimationFrame(() => {
      nameInput.focus();
    });
  };

  list.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-address-edit]");
    const deleteButton = event.target.closest("[data-address-delete]");

    if (editButton) {
      const card = editButton.closest(".address-card");
      if (card) {
        openModal("edit", card, editButton);
      }
      return;
    }

    if (deleteButton) {
      deleteButton.closest(".address-card")?.remove();
    }
  });

  addButton?.addEventListener("click", () => {
    openModal("add", null, addButton);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = readForm();

    if (!data.name || !data.city || !data.center || !data.address) {
      form.reportValidity();
      return;
    }

    if (editingCard) {
      writeCard(editingCard, data);
    } else {
      list.append(createCard(data));
    }

    closeModal();
  });

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      closeModal();
    });
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
      event.preventDefault();
      panel.focus();
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

  revealCards();
}

initAddresses();
