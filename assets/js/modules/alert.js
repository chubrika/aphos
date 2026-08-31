function initAlert() {
  const alertEl = document.querySelector(".alert");

  if (!alertEl) {
    return;
  }

  const messageEl = alertEl.querySelector(".alert__message");
  const closeButton = alertEl.querySelector("[data-alert-close]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let hideTimer = 0;
  let closeTimer = 0;

  const finishHide = () => {
    alertEl.hidden = true;
    alertEl.classList.remove("is-visible", "alert--success", "alert--error");
  };

  const hideAlert = () => {
    window.clearTimeout(hideTimer);
    window.clearTimeout(closeTimer);
    alertEl.classList.remove("is-visible");

    if (prefersReducedMotion) {
      finishHide();
      return;
    }

    closeTimer = window.setTimeout(finishHide, 280);
  };

  const showAlert = (type, message, duration = 4500) => {
    const variant = type === "error" ? "error" : "success";

    window.clearTimeout(hideTimer);
    window.clearTimeout(closeTimer);

    if (messageEl) {
      messageEl.textContent = message;
    }

    alertEl.classList.remove("alert--success", "alert--error");
    alertEl.classList.add(`alert--${variant}`);
    alertEl.hidden = false;
    void alertEl.offsetWidth;
    alertEl.classList.add("is-visible");

    if (duration > 0) {
      hideTimer = window.setTimeout(hideAlert, duration);
    }
  };

  closeButton?.addEventListener("click", (event) => {
    event.preventDefault();
    hideAlert();
  });

  window.showAlert = showAlert;
  window.hideAlert = hideAlert;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAlert);
} else {
  initAlert();
}
