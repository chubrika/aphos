function fillDateSelects(root) {
  const currentYear = new Date().getFullYear();

  root.querySelectorAll("[data-date-days]").forEach((select) => {
    if (select.dataset.filled === "true") {
      return;
    }

    for (let day = 1; day <= 31; day += 1) {
      const option = document.createElement("option");
      option.value = String(day);
      option.textContent = String(day);
      select.append(option);
    }

    select.dataset.filled = "true";
  });

  root.querySelectorAll("[data-date-years]").forEach((select) => {
    if (select.dataset.filled === "true") {
      return;
    }

    for (let year = currentYear; year >= 1920; year -= 1) {
      const option = document.createElement("option");
      option.value = String(year);
      option.textContent = String(year);
      select.append(option);
    }

    select.dataset.filled = "true";
  });
}

function initPasswordMatch(form) {
  const password = form.querySelector('input[name="password"]');
  const confirm = form.querySelector('input[name="password_confirm"]');

  if (!password || !confirm) {
    return;
  }

  const clearMismatch = () => {
    confirm.setCustomValidity("");
    confirm.classList.remove("is-invalid");
  };

  password.addEventListener("input", clearMismatch);
  confirm.addEventListener("input", clearMismatch);

  form.addEventListener("submit", (event) => {
    if (password.value !== confirm.value) {
      event.preventDefault();
      confirm.setCustomValidity("პაროლები არ ემთხვევა");
      confirm.classList.add("is-invalid");
      confirm.reportValidity();
    }
  });
}

function initTermsLinks() {
  document.querySelectorAll(".registration__terms-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.stopPropagation();
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

function initRegistrationPage() {
  const root = document.querySelector(".registration");

  if (!root) {
    return;
  }

  fillDateSelects(root);

  if (typeof initTabs === "function") {
    initTabs(".registration");
  }

  initTermsLinks();
  initDigitsOnly(root);
  initLatinEmail(root);
  initLatinOnly(root);
  root.querySelectorAll(".registration__form").forEach(initPasswordMatch);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRegistrationPage);
} else {
  initRegistrationPage();
}
