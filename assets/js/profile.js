function getSectionControls(section) {
  return section.querySelectorAll(
    'input, select, textarea, .search-select__trigger, [data-verification-code-btn]'
  );
}

function setSectionEditing(section, isEditing) {
  getSectionControls(section).forEach((control) => {
    if (isEditing) {
      control.removeAttribute("disabled");
    } else {
      control.setAttribute("disabled", "");
    }
  });

  section.classList.toggle("is-editing", isEditing);

  const editButton = section.querySelector("[data-profile-edit]");
  editButton?.setAttribute("aria-pressed", String(isEditing));
}

function refreshFloatingFields(root) {
  root.querySelectorAll(".floating-field").forEach((field) => {
    const control = field.querySelector(".floating-field__control");

    if (!control) {
      return;
    }

    const isFilled =
      control.tagName === "SELECT"
        ? control.value !== ""
        : control.value.trim() !== "";

    field.classList.toggle("is-filled", isFilled);
  });
}

function syncSearchSelect(select) {
  const hiddenInput = select.querySelector('input[type="hidden"]');
  const labelEl = select.querySelector("[data-search-label]");
  const trigger = select.querySelector(".search-select__trigger");
  const options = Array.from(select.querySelectorAll(".search-select__option"));
  const placeholder = labelEl?.dataset.placeholder || labelEl?.textContent?.trim() || "აირჩიეთ";
  const value = hiddenInput?.value || "";
  const option = options.find((item) => item.dataset.value === value);
  const optionLabel = option?.querySelector(".search-select__option-label");

  options.forEach((item) => {
    const selected = item === option;
    item.classList.toggle("is-selected", selected);
    item.setAttribute("aria-selected", String(selected));
  });

  if (labelEl) {
    labelEl.textContent = option
      ? (optionLabel?.textContent || option.textContent || "").replace(/\s+/g, " ").trim()
      : placeholder;
  }

  trigger?.classList.toggle("is-placeholder", !option);
}

function commitDefaults(section) {
  section.querySelectorAll("input, textarea").forEach((input) => {
    input.defaultValue = input.value;
  });

  section.querySelectorAll("select").forEach((select) => {
    Array.from(select.options).forEach((option) => {
      option.defaultSelected = option.selected;
    });
  });
}

function initDigitsOnly(root) {
  root.querySelectorAll("[data-digits-only]").forEach((input) => {
    input.addEventListener("input", () => {
      const digits = input.value.replace(/\D/g, "");
      if (input.value !== digits) {
        input.value = digits;
      }
    });
  });
}

function initLatinEmail(root) {
  root.querySelectorAll("[data-latin-email]").forEach((input) => {
    input.addEventListener("input", () => {
      const filtered = input.value.replace(/[^A-Za-z0-9@._%+\-]/g, "");
      if (input.value !== filtered) {
        input.value = filtered;
      }
    });
  });
}

function initLatinOnly(root) {
  root.querySelectorAll("[data-latin-only]").forEach((input) => {
    const allowText = input.getAttribute("data-latin-only") === "text";
    const disallowed = allowText
      ? /[^A-Za-z0-9\s\-'.&]/g
      : /[^A-Za-z\s\-']/g;

    input.addEventListener("input", () => {
      const filtered = input.value.replace(disallowed, "");
      if (input.value !== filtered) {
        input.value = filtered;
      }
    });
  });
}

function initProfileSection(section) {
  const editButton = section.querySelector("[data-profile-edit]");
  const cancelButton = section.querySelector("[data-profile-cancel]");

  setSectionEditing(section, false);

  editButton?.addEventListener("click", () => {
    if (section.classList.contains("is-editing")) {
      return;
    }

    setSectionEditing(section, true);

    const firstField = section.querySelector(
      "input:not([type=hidden]):not([disabled]), .search-select__trigger:not([disabled])"
    );
    firstField?.focus();
  });

  section.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!section.checkValidity()) {
      section.reportValidity();
      return;
    }

    commitDefaults(section);
    setSectionEditing(section, false);
  });

  cancelButton?.addEventListener("click", () => {
    section.reset();
  });

  section.addEventListener("reset", () => {
    window.requestAnimationFrame(() => {
      section.querySelectorAll("[data-search-select]").forEach(syncSearchSelect);
      refreshFloatingFields(section);
      setSectionEditing(section, false);
    });
  });
}

function initProfilePage() {
  const root = document.querySelector(".profile");

  if (!root) {
    return;
  }

  initDigitsOnly(root);
  initLatinEmail(root);
  initLatinOnly(root);
  root.querySelectorAll("[data-profile-section]").forEach(initProfileSection);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProfilePage);
} else {
  initProfilePage();
}
