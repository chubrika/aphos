document.addEventListener("DOMContentLoaded", () => {
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
