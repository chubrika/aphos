function initCreatePasswordForm() {
  const form = document.querySelector(".reset-password__form");
  const password = document.getElementById("new-password");
  const confirm = document.getElementById("confirm-password");

  if (!form || !password || !confirm) {
    return;
  }

  const clearMismatch = () => {
    confirm.setCustomValidity("");
  };

  password.addEventListener("input", clearMismatch);
  confirm.addEventListener("input", clearMismatch);

  form.addEventListener("submit", (event) => {
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
