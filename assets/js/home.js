document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealSections = document.querySelectorAll(".why-apos, .tariffs, .calculator");

  if (revealSections.length) {
    if (prefersReducedMotion) {
      revealSections.forEach((section) => {
        section.classList.add("is-revealed");
      });
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          });
        },
        {
          threshold: 0.28,
          rootMargin: "0px 0px -10% 0px",
        }
      );

      revealSections.forEach((section) => {
        revealObserver.observe(section);
      });
    }
  }

  const heroSwiper = document.querySelector(".hero-swiper");

  if (heroSwiper && typeof Swiper !== "undefined") {
    new Swiper(".hero-swiper", {
      loop: true,
      speed: 700,
      autoplay: {
        delay: 5500,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".hero-swiper__pagination",
        clickable: true,
        renderBullet(index, className) {
          return `<button type="button" class="${className}" aria-label="Go to slide ${index + 1}">${index + 1}</button>`;
        },
      },
    });
  }

  const tariffsSwiper = document.querySelector(".tariffs-swiper");

  if (tariffsSwiper && typeof Swiper !== "undefined") {
    new Swiper(".tariffs-swiper", {
      loop: true,
      speed: 500,
      spaceBetween: 24,
      slidesPerView: 1.15,
      navigation: {
        nextEl: ".tariffs__nav-btn--next",
        prevEl: ".tariffs__nav-btn--prev",
      },
      breakpoints: {
        560: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        900: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
        1100: {
          slidesPerView: 4,
          spaceBetween: 24,
        },
      },
    });
  }

  document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const group = toggle.closest(".input-group");
      const input = group?.querySelector("input");

      if (!input) {
        return;
      }

      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      toggle.setAttribute("aria-pressed", String(isHidden));
      toggle.setAttribute("aria-label", isHidden ? "პაროლის დამალვა" : "პაროლის ჩვენება");
    });
  });

  document.querySelectorAll("[data-latin-only]").forEach((input) => {
    const mode = input.getAttribute("data-latin-only");
    const disallowed =
      mode === "email"
        ? /[^A-Za-z0-9@._%+\-]/g
        : mode === "text"
          ? /[^A-Za-z0-9\s\-'.&]/g
          : /[^A-Za-z\s\-']/g;

    input.addEventListener("input", () => {
      const filtered = input.value.replace(disallowed, "");
      if (input.value !== filtered) {
        input.value = filtered;
      }
    });
  });

  const calculatorForm = document.querySelector(".calculator__form");

  if (calculatorForm) {
    const select = calculatorForm.querySelector("[data-calc-select]");
    const trigger = select?.querySelector(".calc-select__trigger");
    const menu = select?.querySelector(".calc-select__menu");
    const options = select?.querySelectorAll(".calc-select__option");
    const labelEl = select?.querySelector("[data-calc-label]");
    const flagEl = select?.querySelector("[data-calc-flag]");
    const countryInput = select?.querySelector("[data-calc-country]");
    const rateInput = select?.querySelector("[data-calc-rate]");
    const weightInput = calculatorForm.querySelector("[data-calc-weight]");
    const lengthInput = calculatorForm.querySelector("[data-calc-length]");
    const widthInput = calculatorForm.querySelector("[data-calc-width]");
    const heightInput = calculatorForm.querySelector("[data-calc-height]");
    const priceEl = calculatorForm.querySelector("[data-calc-price]");
    const digitsEl = calculatorForm.querySelector("[data-price-digits]");
    let currentPrice = null;
    let renderToken = 0;

    const formatAmount = (value) => (Math.round(value * 10) / 10).toFixed(1);

    const buildReel = (fromDigit, toDigit, direction) => {
      const reel = document.createElement("span");
      reel.className = "price-roll__reel";

      const sequence = [];

      if (direction > 0) {
        // Rise: digits move upward, new value enters from below
        let digit = fromDigit;
        sequence.push(digit);
        while (digit !== toDigit) {
          digit = (digit + 1) % 10;
          sequence.push(digit);
        }
      } else if (direction < 0) {
        // Fall: digits move downward, new value enters from above
        let digit = toDigit;
        sequence.push(digit);
        while (digit !== fromDigit) {
          digit = (digit + 1) % 10;
          sequence.push(digit);
        }
      } else {
        sequence.push(toDigit);
      }

      sequence.forEach((digit) => {
        const item = document.createElement("span");
        item.className = "price-roll__num";
        item.textContent = String(digit);
        reel.appendChild(item);
      });

      return { reel, steps: Math.max(sequence.length - 1, 0), direction };
    };

    const renderPrice = (value, animate) => {
      if (!priceEl || !digitsEl) {
        return;
      }

      const nextText = formatAmount(value);
      const prevText = currentPrice === null ? nextText : formatAmount(currentPrice);
      const direction = currentPrice === null ? 0 : value >= currentPrice ? 1 : -1;
      const token = ++renderToken;

      priceEl.setAttribute("aria-label", `$${nextText}`);
      digitsEl.replaceChildren();

      const maxLen = Math.max(prevText.length, nextText.length);
      const prevPadded = prevText.padStart(maxLen, " ");
      const nextPadded = nextText.padStart(maxLen, " ");
      const animatedReels = [];

      for (let i = 0; i < maxLen; i += 1) {
        const nextChar = nextPadded[i];
        const prevChar = prevPadded[i];
        const digitWrap = document.createElement("span");
        digitWrap.className = "price-roll__digit";

        if (nextChar === " ") {
          continue;
        }

        if (nextChar === ".") {
          digitWrap.classList.add("price-roll__digit--static");
          digitWrap.textContent = ".";
          digitsEl.appendChild(digitWrap);
          continue;
        }

        const fromDigit = prevChar === " " || prevChar === "." ? 0 : Number(prevChar);
        const toDigit = Number(nextChar);
        const shouldAnimate = Boolean(animate) && fromDigit !== toDigit && direction !== 0;
        const { reel, steps } = buildReel(
          shouldAnimate ? fromDigit : toDigit,
          toDigit,
          shouldAnimate ? direction : 0
        );

        digitWrap.appendChild(reel);
        digitsEl.appendChild(digitWrap);

        if (shouldAnimate && steps > 0) {
          animatedReels.push({ reel, steps, direction });
        }
      }

      if (animatedReels.length) {
        animatedReels.forEach(({ reel, steps, direction: dir }) => {
          reel.style.transform = dir < 0
            ? `translate3d(0, -${steps}em, 0)`
            : "translate3d(0, 0, 0)";
        });

        requestAnimationFrame(() => {
          if (token !== renderToken) {
            return;
          }

          requestAnimationFrame(() => {
            if (token !== renderToken) {
              return;
            }

            animatedReels.forEach(({ reel, steps, direction: dir }) => {
              reel.classList.add("is-animating");
              reel.style.transform = dir < 0
                ? "translate3d(0, 0, 0)"
                : `translate3d(0, -${steps}em, 0)`;
            });
          });
        });
      }

      currentPrice = value;
    };

    const updatePrice = (animate = true) => {
      if (!priceEl || !rateInput || !weightInput) {
        return;
      }

      const rate = Number(rateInput.value) || 0;
      const weight = Number(weightInput.value) || 0;
      const length = Number(lengthInput?.value) || 0;
      const width = Number(widthInput?.value) || 0;
      const height = Number(heightInput?.value) || 0;
      // Standard air volumetric divisor; billable is the greater of actual vs volumetric kg
      const volumetric = length && width && height ? (length * width * height) / 5000 : 0;
      const billable = Math.max(weight, volumetric);
      const price = billable > 0 ? billable * rate : 0;

      renderPrice(price, animate);
    };

    const menuTransitionMs = 250;
    let menuCloseTimer = null;

    const closeSelect = () => {
      if (!select || !trigger || !menu || !select.classList.contains("is-open")) {
        return;
      }

      select.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");

      clearTimeout(menuCloseTimer);
      menuCloseTimer = setTimeout(() => {
        menu.hidden = true;
      }, menuTransitionMs);
    };

    const openSelect = () => {
      if (!select || !trigger || !menu) {
        return;
      }

      clearTimeout(menuCloseTimer);
      menu.hidden = false;
      menu.setAttribute("aria-hidden", "false");
      // Force reflow so the open transition runs from the closed styles
      void menu.offsetHeight;
      select.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    };

    if (select && trigger && menu && options?.length) {
      trigger.addEventListener("click", () => {
        if (select.classList.contains("is-open")) {
          closeSelect();
        } else {
          openSelect();
        }
      });

      options.forEach((option) => {
        option.addEventListener("click", () => {
          const rate = option.dataset.rate || "0";
          const label = option.dataset.label || "";
          const flagSvg = option.querySelector(".calc-select__flag")?.innerHTML || "";

          options.forEach((item) => {
            const selected = item === option;
            item.classList.toggle("is-selected", selected);
            item.setAttribute("aria-selected", String(selected));
          });

          if (labelEl) {
            labelEl.textContent = label;
          }

          if (flagEl) {
            flagEl.innerHTML = flagSvg;
          }

          if (countryInput) {
            countryInput.value = label;
          }

          if (rateInput) {
            rateInput.value = rate;
          }

          closeSelect();
          updatePrice();
        });
      });

      document.addEventListener("click", (event) => {
        if (!select.contains(event.target)) {
          closeSelect();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeSelect();
        }
      });
    }

    const syncCalcInputWidth = (input) => {
      if (!input) {
        return;
      }

      const chars = Math.max(String(input.value || "0").length, 1);
      input.style.width = `${chars}ch`;
    };

    [weightInput, lengthInput, widthInput, heightInput].forEach((input) => {
      if (!input) {
        return;
      }

      syncCalcInputWidth(input);
      input.addEventListener("input", () => {
        syncCalcInputWidth(input);
        updatePrice(true);
      });
    });

    calculatorForm.addEventListener("submit", (event) => {
      event.preventDefault();
      updatePrice(true);
    });

    updatePrice(false);
  }

  document.querySelectorAll(".login-card, #login-modal-form").forEach((loginForm) => {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      window.location.href = "dashboard.html";
    });
  });

  const loginModal = document.getElementById("login-modal");
  if (loginModal) {
    const panel = loginModal.querySelector(".login-modal__panel");
    const openTriggers = document.querySelectorAll("[data-login-open]");
    const closeTriggers = loginModal.querySelectorAll("[data-login-close]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastTrigger = null;
    let closeTimer = 0;

    const getFocusable = () => {
      return Array.from(
        panel.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length);
    };

    const finishClose = () => {
      loginModal.hidden = true;
      loginModal.setAttribute("aria-hidden", "true");
      openTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));

      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus();
      }
    };

    const closeLoginModal = () => {
      if (loginModal.hidden || !loginModal.classList.contains("is-open")) {
        return;
      }

      loginModal.classList.remove("is-open");
      window.clearTimeout(closeTimer);

      if (prefersReducedMotion) {
        finishClose();
        return;
      }

      closeTimer = window.setTimeout(finishClose, 520);
    };

    const openLoginModal = (trigger) => {
      lastTrigger = trigger || null;
      window.clearTimeout(closeTimer);

      loginModal.hidden = false;
      loginModal.setAttribute("aria-hidden", "false");
      openTriggers.forEach((item) => item.setAttribute("aria-expanded", "true"));
      void loginModal.offsetWidth;
      loginModal.classList.add("is-open");

      window.requestAnimationFrame(() => {
        panel.querySelector("input")?.focus();
      });
    };

    openTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        openLoginModal(trigger);
      });
    });

    closeTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        closeLoginModal();
      });
    });

    panel.addEventListener("transitionend", (event) => {
      if (event.target !== panel || event.propertyName !== "transform") {
        return;
      }

      if (!loginModal.classList.contains("is-open")) {
        window.clearTimeout(closeTimer);
        finishClose();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (loginModal.hidden || !loginModal.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeLoginModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusable();
      if (!focusable.length) {
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
  }
});
