function initHeaderMenu() {
  const toggleButton = document.querySelector(".site-header__toggle");
  const navigation = document.querySelector(".site-header__nav");
  const moreMenu = document.querySelector(".site-header__more-menu");
  const moreTrigger = moreMenu?.querySelector(".site-header__more");
  const langSwitcher = document.querySelector(".lang-switcher");
  const langTrigger = document.querySelector(".lang-switcher__trigger");
  const langLabel = langTrigger?.querySelector(".lang-switcher__label");
  const langFlag = langTrigger?.querySelector(".lang-switcher__flag");
  const langOptions = document.querySelectorAll(".lang-switcher__option");

  if (toggleButton && navigation) {
    toggleButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");
      toggleButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const closeMoreMenu = () => {
    if (!moreMenu || !moreTrigger) {
      return;
    }

    moreMenu.classList.remove("is-open");
    moreTrigger.setAttribute("aria-expanded", "false");
  };

  if (moreMenu && moreTrigger) {
    moreTrigger.addEventListener("click", () => {
      const isOpen = moreMenu.classList.toggle("is-open");
      moreTrigger.setAttribute("aria-expanded", String(isOpen));

      if (isOpen && langSwitcher && langTrigger) {
        langSwitcher.classList.remove("is-open");
        langTrigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  const closeLanguageMenu = () => {
    if (!langSwitcher || !langTrigger) {
      return;
    }

    langSwitcher.classList.remove("is-open");
    langTrigger.setAttribute("aria-expanded", "false");
  };

  if (langSwitcher && langTrigger && langLabel && langFlag && langOptions.length) {
    const setLanguage = (option) => {
      langLabel.textContent = option.dataset.lang || "eng";
      langFlag.src = option.dataset.flagSrc || "assets/images/flag_en.svg";
      langFlag.alt = option.dataset.flagAlt || "English";

      langOptions.forEach((item) => {
        item.classList.toggle("is-active", item === option);
      });
    };

    langTrigger.addEventListener("click", () => {
      const isOpen = langSwitcher.classList.toggle("is-open");
      langTrigger.setAttribute("aria-expanded", String(isOpen));

      if (isOpen) {
        closeMoreMenu();
      }
    });

    langOptions.forEach((option) => {
      option.addEventListener("click", () => {
        setLanguage(option);
        closeLanguageMenu();
      });
    });
  }

  document.addEventListener("click", (event) => {
    if (moreMenu && !moreMenu.contains(event.target)) {
      closeMoreMenu();
    }

    if (langSwitcher && !langSwitcher.contains(event.target)) {
      closeLanguageMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMoreMenu();
      closeLanguageMenu();
    }
  });
}

function initAccountDrawer() {
  const drawer = document.getElementById("account-drawer");
  const trigger = document.querySelector(".site-header__profile");

  if (!drawer || !trigger) {
    return;
  }

  const panel = drawer.querySelector(".account-drawer__panel");
  const closeTriggers = drawer.querySelectorAll("[data-account-close]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let closeTimer = 0;

  const getFocusable = () => {
    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length && !element.closest("[hidden]"));
  };

  const finishClose = () => {
    drawer.hidden = true;
    drawer.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");

    if (typeof trigger.focus === "function") {
      trigger.focus();
    }
  };

  const closeDrawer = () => {
    if (drawer.hidden || !drawer.classList.contains("is-open")) {
      return;
    }

    drawer.classList.remove("is-open");
    window.clearTimeout(closeTimer);

    if (prefersReducedMotion) {
      finishClose();
      return;
    }

    closeTimer = window.setTimeout(finishClose, 520);
  };

  const openDrawer = () => {
    window.clearTimeout(closeTimer);
    drawer.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
    void drawer.offsetWidth;
    drawer.classList.add("is-open");

    window.requestAnimationFrame(() => {
      panel.focus();
    });
  };

  trigger.addEventListener("click", () => {
    if (drawer.classList.contains("is-open") && !drawer.hidden) {
      closeDrawer();
      return;
    }

    openDrawer();
  });

  closeTriggers.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      closeDrawer();
    });
  });

  panel.addEventListener("transitionend", (event) => {
    if (event.target !== panel || event.propertyName !== "transform") {
      return;
    }

    if (!drawer.classList.contains("is-open")) {
      window.clearTimeout(closeTimer);
      finishClose();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (drawer.hidden || !drawer.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = getFocusable();
    if (!focusable.length) {
      panel.focus();
      event.preventDefault();
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initHeaderMenu();
    initAccountDrawer();
  });
} else {
  initHeaderMenu();
  initAccountDrawer();
}
