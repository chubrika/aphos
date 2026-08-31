function initHeaderMenu() {
  const header = document.querySelector(".site-header");
  const toggleButton = document.querySelector(".site-header__toggle");
  const navigation = document.querySelector(".site-header__nav");
  const moreMenu = document.querySelector(".site-header__more-menu");
  const moreTrigger = moreMenu?.querySelector(".site-header__more");
  const langSwitchers = document.querySelectorAll(".lang-switcher");
  const subnavItem = document.querySelector(".site-header__has-subnav");
  const subnavTrigger = subnavItem?.querySelector(".site-header__subnav-trigger");

  if (header && (subnavItem || moreMenu) && !header.querySelector(".site-header__subnav-overlay")) {
    const overlay = document.createElement("div");
    overlay.className = "site-header__subnav-overlay";
    overlay.setAttribute("data-subnav-close", "");
    header.append(overlay);
  }

  const isDesktopNav = () => window.matchMedia("(min-width: 769px)").matches;

  const syncPageBlur = () => {
    if (!header) {
      return;
    }

    const anyOpen =
      subnavItem?.classList.contains("is-open") || moreMenu?.classList.contains("is-open");
    header.classList.toggle("site-header--subnav-open", Boolean(anyOpen) && isDesktopNav());
  };

  const closeInformationMenu = () => {
    if (!subnavItem || !subnavTrigger || !header) {
      return;
    }

    subnavItem.classList.remove("is-open");
    subnavTrigger.setAttribute("aria-expanded", "false");
    syncPageBlur();
  };

  const closeMenu = () => {
    if (!navigation || !header || !toggleButton) {
      return;
    }

    navigation.classList.remove("is-open");
    header.classList.remove("site-header--menu-open");
    toggleButton.setAttribute("aria-expanded", "false");
    closeInformationMenu();
  };

  if (toggleButton && navigation && header) {
    toggleButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");
      header.classList.toggle("site-header--menu-open", isOpen);
      toggleButton.setAttribute("aria-expanded", String(isOpen));
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  const closeMoreMenu = () => {
    if (!moreMenu || !moreTrigger) {
      return;
    }

    moreMenu.classList.remove("is-open");
    moreTrigger.setAttribute("aria-expanded", "false");
    syncPageBlur();
  };

  const closeLanguageMenus = (except) => {
    langSwitchers.forEach((switcher) => {
      if (switcher === except) {
        return;
      }

      switcher.classList.remove("is-open");
      switcher.querySelector(".lang-switcher__trigger")?.setAttribute("aria-expanded", "false");
    });
  };

  if (moreMenu && moreTrigger) {
    moreTrigger.setAttribute("aria-haspopup", "true");
    moreTrigger.addEventListener("click", () => {
      const isOpen = !moreMenu.classList.contains("is-open");

      if (isOpen) {
        closeInformationMenu();
        closeLanguageMenus();
        moreMenu.classList.add("is-open");
        moreTrigger.setAttribute("aria-expanded", "true");
      } else {
        moreMenu.classList.remove("is-open");
        moreTrigger.setAttribute("aria-expanded", "false");
      }

      syncPageBlur();
    });
  }

  if (langSwitchers.length) {
    const setLanguage = (option) => {
      const lang = option.dataset.lang || "eng";
      const flagSrc = option.dataset.flagSrc || "assets/images/flag_en.svg";
      const flagAlt = option.dataset.flagAlt || "English";

      langSwitchers.forEach((switcher) => {
        const label = switcher.querySelector(".lang-switcher__label");
        const flag = switcher.querySelector(".lang-switcher__flag");

        if (label) {
          label.textContent = lang;
        }

        if (flag) {
          flag.src = flagSrc;
          flag.alt = flagAlt;
        }

        switcher.querySelectorAll(".lang-switcher__option").forEach((item) => {
          item.classList.toggle("is-active", item.dataset.lang === lang);
        });
      });
    };

    langSwitchers.forEach((langSwitcher) => {
      const langTrigger = langSwitcher.querySelector(".lang-switcher__trigger");
      if (!langTrigger) {
        return;
      }

      langTrigger.addEventListener("click", () => {
        const isOpen = langSwitcher.classList.toggle("is-open");
        langTrigger.setAttribute("aria-expanded", String(isOpen));

        if (isOpen) {
          closeMoreMenu();
          closeInformationMenu();
          closeLanguageMenus(langSwitcher);
        }
      });

      langSwitcher.querySelectorAll(".lang-switcher__option").forEach((option) => {
        option.addEventListener("click", () => {
          setLanguage(option);
          closeLanguageMenus();
        });
      });
    });
  }

  if (subnavItem && subnavTrigger && header) {
    subnavTrigger.addEventListener("click", () => {
      const isOpen = !subnavItem.classList.contains("is-open");

      if (isOpen) {
        closeMoreMenu();
        closeLanguageMenus();
        subnavItem.classList.add("is-open");
        subnavTrigger.setAttribute("aria-expanded", "true");
        syncPageBlur();
      } else {
        closeInformationMenu();
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (moreMenu && !moreMenu.contains(event.target)) {
      closeMoreMenu();
    }

    if (subnavItem && !subnavItem.contains(event.target)) {
      closeInformationMenu();
    }

    if (langSwitchers.length) {
      langSwitchers.forEach((switcher) => {
        if (!switcher.contains(event.target)) {
          switcher.classList.remove("is-open");
          switcher.querySelector(".lang-switcher__trigger")?.setAttribute("aria-expanded", "false");
        }
      });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeMoreMenu();
      closeInformationMenu();
      closeLanguageMenus();
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
