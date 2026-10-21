function initCreatePasswordForm() {
  const form = document.querySelector(".reset-password__form");
  const password = document.getElementById("new-password");
  const confirm = document.getElementById("confirm-password");

  if (!form || !password || !confirm) {
    return;
  }

  const code = form.querySelector("[data-verification-code-input]");
  const gatePasswords = form.hasAttribute("data-passwords-after-code");

  const sanitizeCode = () => {
    if (!code || !code.hasAttribute("data-digits-only")) {
      return;
    }

    const max = Number(code.getAttribute("maxlength")) || 5;
    const digits = code.value.replace(/\D/g, "").slice(0, max);

    if (code.value !== digits) {
      code.value = digits;
    }
  };

  const syncPasswordFields = () => {
    if (!gatePasswords || !code) {
      return;
    }

    const enabled = code.value.trim() !== "";
    password.disabled = !enabled;
    confirm.disabled = !enabled;

    if (!enabled) {
      password.setCustomValidity("");
      confirm.setCustomValidity("");
    }
  };

  const clearMismatch = () => {
    confirm.setCustomValidity("");
  };

  if (code) {
    sanitizeCode();
    syncPasswordFields();
    code.addEventListener("input", () => {
      sanitizeCode();
      syncPasswordFields();
    });
    code.addEventListener("change", () => {
      sanitizeCode();
      syncPasswordFields();
    });
  }

  password.addEventListener("input", clearMismatch);
  confirm.addEventListener("input", clearMismatch);

  form.addEventListener("submit", (event) => {
    sanitizeCode();
    syncPasswordFields();

    if (password.disabled || confirm.disabled) {
      event.preventDefault();
      if (code && !code.value.trim()) {
        code.reportValidity();
      }
      return;
    }

    if (password.value !== confirm.value) {
      event.preventDefault();
      confirm.setCustomValidity("პაროლები არ ემთხვევა");
      confirm.reportValidity();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCreatePasswordForm);
} else {
  initCreatePasswordForm();
}
