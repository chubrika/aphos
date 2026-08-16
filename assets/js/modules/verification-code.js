function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function initVerificationCode(group) {
  const form = group.closest("form");
  const email = form?.querySelector('input[type="email"]');
  const code = group.querySelector("[data-verification-code-input]");
  const button = group.querySelector("[data-verification-code-btn]");

  if (!form || !email || !code || !button) {
    return;
  }

  const duration = 5 * 60;
  const requestLabel = "კოდის მიღება";
  const verifyLabel = "ვერიფიკაცია";
  const shouldSubmit = group.hasAttribute("data-verification-submit");
  let remaining = 0;
  let timerId = null;

  const setRequestState = () => {
    button.classList.remove("button--primary");
    button.classList.add("button--outline");
    button.textContent = requestLabel;
    button.removeAttribute("aria-live");
  };

  const setVerifyState = (seconds) => {
    button.classList.remove("button--outline");
    button.classList.add("button--primary");
    button.setAttribute("aria-live", "polite");
    button.textContent = `${verifyLabel} (${formatCountdown(seconds)})`;
  };

  const stopTimer = () => {
    clearInterval(timerId);
    timerId = null;
    remaining = 0;
    setRequestState();
  };

  const startTimer = () => {
    remaining = duration;
    setVerifyState(remaining);

    timerId = setInterval(() => {
      remaining -= 1;

      if (remaining <= 0) {
        stopTimer();
        return;
      }

      setVerifyState(remaining);
    }, 1000);
  };

  const verifyCode = () => {
    if (!code.value.trim()) {
      code.reportValidity();
      return false;
    }

    code.setCustomValidity("");
    return true;
  };

  code.addEventListener("input", () => {
    code.setCustomValidity("");
  });

  button.addEventListener("click", () => {
    if (timerId) {
      if (verifyCode() && shouldSubmit) {
        form.submit();
      }

      return;
    }

    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }

    startTimer();
  });
}

function initVerificationCodes(root = document) {
  root.querySelectorAll("[data-verification-code]").forEach(initVerificationCode);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initVerificationCodes());
} else {
  initVerificationCodes();
}
