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

function initRegistrationTabs() {
  const tabs = Array.from(document.querySelectorAll(".registration__tab"));
  const panels = Array.from(document.querySelectorAll(".registration__panel"));

  if (!tabs.length || !panels.length) {
    return;
  }

  const activateTab = (nextTab) => {
    tabs.forEach((tab) => {
      const isActive = tab === nextTab;
      const panel = document.getElementById(tab.getAttribute("aria-controls"));

      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;

      if (panel) {
        panel.hidden = !isActive;
      }
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateTab(tab);
    });

    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }

      event.preventDefault();
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + offset + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    });
  });
}

function initTermsLinks() {
  document.querySelectorAll(".registration__terms-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });
}

function initRegistrationPage() {
  const root = document.querySelector(".registration");

  if (!root) {
    return;
  }

  fillDateSelects(root);
  initRegistrationTabs();
  initTermsLinks();
  root.querySelectorAll(".registration__form").forEach(initPasswordMatch);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRegistrationPage);
} else {
  initRegistrationPage();
}
