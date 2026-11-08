function initCards() {
  const root = document.querySelector(".cards");
  const list = document.querySelector(".cards__list");
  const modal = document.getElementById("card-modal");

  if (!root || !list || !modal) {
    return;
  }

  const panel = modal.querySelector(".card-modal__panel");
  const form = document.getElementById("card-form");
  const titleEl = modal.querySelector("[data-card-modal-title]");
  const submitEl = modal.querySelector("[data-card-submit]");
  const holderInput = document.getElementById("card-holder");
  const fullnameInput = document.getElementById("card-fullname");
  const numberInput = document.getElementById("card-number");
  const ccvInput = document.getElementById("card-ccv");
  const expiryInput = document.getElementById("card-expiry");
  const addButton = document.querySelector("[data-card-add]");
  const closeTriggers = modal.querySelectorAll("[data-card-close]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastTrigger = null;
  let editingCard = null;
  let closeTimer = 0;

  const editIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  `;
  const deleteIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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

  const detectBrand = (digits) => {
    if (/^4/.test(digits)) {
      return "Visa";
    }
    if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01]\d|720)/.test(digits)) {
      return "Mastercard";
    }
    if (/^3[47]/.test(digits)) {
      return "Amex";
    }
    return "Card";
  };

  const formatCardNumber = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 19);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 6);
    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const maskCard = (brand, last4) => `${brand} *** **** **** ${last4}`;

  const parseExpiry = (value) => {
    const match = String(value || "").match(/^(\d{2})\/(\d{4})$/);
    if (!match) {
      return null;
    }

    const month = Number(match[1]);
    const year = Number(match[2]);
    if (month < 1 || month > 12) {
      return null;
    }

    return {
      month: match[1],
      year: match[2],
      stamp: year * 12 + (month - 1),
    };
  };

  const isExpiryValid = (value) => {
    const parsed = parseExpiry(value);
    if (!parsed) {
      return false;
    }

    const current = new Date();
    const stamp = current.getFullYear() * 12 + current.getMonth();
    return parsed.stamp >= stamp;
  };

  const getFocusable = () => {
    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length && !element.closest("[hidden]"));
  };

  const readForm = () => ({
    holder: holderInput.value.trim(),
    fullname: fullnameInput.value.trim(),
    number: numberInput.value.replace(/\D/g, ""),
    expiry: expiryInput.value.trim(),
    ccv: ccvInput.value.replace(/\D/g, ""),
  });

  const fillForm = (data) => {
    holderInput.value = data?.holder || "";
    fullnameInput.value = data?.fullname || "";
    numberInput.value = data?.number ? formatCardNumber(data.number) : "";
    expiryInput.value = data?.expiry ? formatExpiry(data.expiry) : "";
    ccvInput.value = data?.ccv || "";
    holderInput.setCustomValidity("");
    fullnameInput.setCustomValidity("");
    numberInput.setCustomValidity("");
    expiryInput.setCustomValidity("");
    ccvInput.setCustomValidity("");
  };

  const writeCard = (card, data) => {
    const last4 = data.number ? data.number.slice(-4) : card.dataset.last || "";
    const brand = data.number ? detectBrand(data.number) : card.dataset.brand || "Card";

    card.dataset.holder = data.holder;
    card.dataset.fullname = data.fullname;
    card.dataset.number = data.number;
    card.dataset.last = last4;
    card.dataset.brand = brand;
    card.dataset.expiry = data.expiry;
    card.dataset.ccv = data.ccv;
    card.querySelector(".bank-card__title").textContent = maskCard(brand, last4);
    card.querySelector(".bank-card__label").textContent = data.holder;
  };

  const createCard = (data) => {
    const item = document.createElement("li");
    item.className = "bank-card";

    const info = document.createElement("div");
    info.className = "bank-card__info";

    const title = document.createElement("p");
    title.className = "bank-card__title";

    const label = document.createElement("p");
    label.className = "bank-card__label";

    const actions = document.createElement("div");
    actions.className = "bank-card__actions";
    actions.innerHTML = `
      <button class="bank-card__action" type="button" data-card-edit aria-label="რედაქტირება">${editIcon}</button>
      <button class="bank-card__action" type="button" data-card-delete aria-label="წაშლა">${deleteIcon}</button>
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
        holder: card.dataset.holder || "",
        fullname: card.dataset.fullname || "",
        number: card.dataset.number || "",
        expiry: card.dataset.expiry || "",
        ccv: card.dataset.ccv || "",
      });
      titleEl.textContent = "ბარათის რედაქტირება";
      submitEl.textContent = "შეცვლა";
    } else {
      fillForm(null);
      titleEl.textContent = "ბარათის დამატება";
      submitEl.textContent = "დამატება";
    }

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    void modal.offsetWidth;
    modal.classList.add("is-open");

    window.requestAnimationFrame(() => {
      holderInput.focus();
    });
  };

  list.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-card-edit]");
    const deleteButton = event.target.closest("[data-card-delete]");

    if (editButton) {
      const card = editButton.closest(".bank-card");
      if (card) {
        openModal("edit", card, editButton);
      }
      return;
    }

    if (deleteButton) {
      deleteButton.closest(".bank-card")?.remove();
    }
  });

  addButton?.addEventListener("click", () => {
    openModal("add", null, addButton);
  });

  numberInput.addEventListener("input", () => {
    numberInput.value = formatCardNumber(numberInput.value);
    numberInput.setCustomValidity("");
  });

  expiryInput.addEventListener("input", () => {
    expiryInput.value = formatExpiry(expiryInput.value);
    expiryInput.setCustomValidity("");
  });

  ccvInput.addEventListener("input", () => {
    ccvInput.value = ccvInput.value.replace(/\D/g, "").slice(0, 4);
    ccvInput.setCustomValidity("");
  });

  holderInput.addEventListener("input", () => {
    holderInput.setCustomValidity("");
  });

  fullnameInput.addEventListener("input", () => {
    fullnameInput.setCustomValidity("");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = readForm();
    let invalid = false;

    const requireValue = (input, value, message) => {
      if (value) {
        input.setCustomValidity("");
        return;
      }

      input.setCustomValidity(message);
      invalid = true;
    };

    requireValue(holderInput, data.holder, "შეავსეთ მფლობელის სახელი");
    requireValue(fullnameInput, data.fullname, "შეავსეთ სახელი და გვარი");

    const numberOk = data.number
      ? data.number.length >= 13 && data.number.length <= 19
      : Boolean(editingCard?.dataset.last);

    if (!numberOk) {
      numberInput.setCustomValidity("ბარათის ნომერი არასწორია");
      invalid = true;
    } else {
      numberInput.setCustomValidity("");
    }

    if (!isExpiryValid(data.expiry)) {
      expiryInput.setCustomValidity("მიუთითეთ მოქმედი ვადა, მაგ. 11/2026");
      invalid = true;
    } else {
      expiryInput.setCustomValidity("");
    }

    if (!/^\d{3,4}$/.test(data.ccv)) {
      ccvInput.setCustomValidity("CCV უნდა იყოს 3 ან 4 ციფრი");
      invalid = true;
    } else {
      ccvInput.setCustomValidity("");
    }

    if (invalid) {
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

initCards();
