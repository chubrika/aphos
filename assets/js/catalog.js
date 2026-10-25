const initCatalogNotice = () => {
  const notice = document.getElementById("catalog-notice");

  if (!notice) {
    return;
  }

  const panel = notice.querySelector(".catalog-notice__panel");
  const closeTriggers = notice.querySelectorAll("[data-catalog-close]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let closeTimer = 0;

  const finishClose = () => {
    notice.hidden = true;
    notice.setAttribute("aria-hidden", "true");
  };

  const closeNotice = () => {
    if (notice.hidden || !notice.classList.contains("is-open")) {
      return;
    }

    notice.classList.remove("is-open");
    window.clearTimeout(closeTimer);

    if (prefersReducedMotion) {
      finishClose();
      return;
    }

    closeTimer = window.setTimeout(finishClose, 450);
  };

  const openNotice = () => {
    window.clearTimeout(closeTimer);
    notice.hidden = false;
    notice.setAttribute("aria-hidden", "false");
    void notice.offsetWidth;
    notice.classList.add("is-open");
    panel?.focus();
  };

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      closeNotice();
    });
  });

  panel?.addEventListener("transitionend", (event) => {
    if (event.target !== panel || event.propertyName !== "transform") {
      return;
    }

    if (!notice.classList.contains("is-open")) {
      window.clearTimeout(closeTimer);
      finishClose();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (notice.hidden || !notice.classList.contains("is-open") || event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    closeNotice();
  });

  openNotice();
};

document.addEventListener("DOMContentLoaded", () => {
  initCatalogNotice();

  const selects = Array.from(document.querySelectorAll("[data-calc-select]"));

  if (!selects.length) {
    return;
  }

  const menuTransitionMs = 250;
  const timers = new WeakMap();

  const closeSelect = (select) => {
    const trigger = select.querySelector(".calc-select__trigger");
    const menu = select.querySelector(".calc-select__menu");

    if (!trigger || !menu || !select.classList.contains("is-open")) {
      return;
    }

    select.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");

    clearTimeout(timers.get(select));
    timers.set(
      select,
      setTimeout(() => {
        menu.hidden = true;
      }, menuTransitionMs)
    );
  };

  const openSelect = (select) => {
    selects.forEach((item) => {
      if (item !== select) {
        closeSelect(item);
      }
    });

    const trigger = select.querySelector(".calc-select__trigger");
    const menu = select.querySelector(".calc-select__menu");

    if (!trigger || !menu) {
      return;
    }

    clearTimeout(timers.get(select));
    menu.hidden = false;
    menu.setAttribute("aria-hidden", "false");
    void menu.offsetHeight;
    select.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  };

  selects.forEach((select) => {
    const trigger = select.querySelector(".calc-select__trigger");
    const options = select.querySelectorAll(".calc-select__option");
    const labelEl = select.querySelector("[data-calc-label]");
    const flagEl = select.querySelector("[data-calc-flag]");
    const valueInput = select.querySelector("[data-calc-value]");

    if (!trigger || !options.length) {
      return;
    }

    trigger.addEventListener("click", () => {
      if (select.classList.contains("is-open")) {
        closeSelect(select);
      } else {
        openSelect(select);
      }
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        const label = option.dataset.label || option.textContent.trim();
        const flagSvg = option.querySelector(".calc-select__flag")?.innerHTML || "";

        options.forEach((item) => {
          const selected = item === option;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-selected", String(selected));
        });

        if (labelEl) {
          labelEl.textContent = label;
        }

        if (flagEl && flagSvg) {
          flagEl.innerHTML = flagSvg;
        }

        if (valueInput) {
          valueInput.value = label;
        }

        closeSelect(select);
      });
    });
  });

  document.addEventListener("click", (event) => {
    selects.forEach((select) => {
      if (!select.contains(event.target)) {
        closeSelect(select);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      selects.forEach(closeSelect);
    }
  });
});
