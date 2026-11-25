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

  const isDesktopNav = () => window.matchMedia("(min-width: 1280px)").matches;

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

  initDesktopNavOverflow(header);
}

function initDesktopNavOverflow(header) {
  const nav = header?.querySelector(".site-header__nav") || document.querySelector(".site-header__nav");
  const menu = nav?.querySelector(".site-header__menu--desktop");
  const moreItem = menu?.querySelector(":scope > .site-header__more-menu");
  const dropdown = moreItem?.querySelector(".site-header__more-dropdown");
  const inner = nav?.closest(".site-header__inner");

  if (!menu || !moreItem || !dropdown || !inner) {
    header?.classList.add("is-nav-ready");
    return;
  }

  const primaryItems = Array.from(menu.children).filter((item) => item !== moreItem);
  const staticHead = dropdown.firstElementChild;
  const desktopQuery = window.matchMedia("(min-width: 1280px)");

  if (!primaryItems.length) {
    header?.classList.add("is-nav-ready");
    return;
  }

  const isVisibleBox = (element) => {
    if (!element) {
      return false;
    }

    const display = getComputedStyle(element).display;
    return display !== "none" && display !== "contents";
  };

  const availableWidth = () => {
    const style = getComputedStyle(inner);
    const gap = Number.parseFloat(style.columnGap) || 0;
    const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(style.paddingRight) || 0;
    let available = inner.clientWidth - paddingLeft - paddingRight;

    const takeSpace = (element, includeMarginLeft) => {
      if (!isVisibleBox(element)) {
        return;
      }

      const computed = getComputedStyle(element);
      available -= element.getBoundingClientRect().width;
      available -= gap;

      if (includeMarginLeft) {
        available -= Number.parseFloat(computed.marginLeft) || 0;
      }

      available -= Number.parseFloat(computed.marginRight) || 0;
    };

    takeSpace(inner.querySelector(".site-header__brand"), true);
    takeSpace(inner.querySelector(".site-header__toggle"), true);
    takeSpace(inner.querySelector(".site-header__auth"), false);

    return available;
  };

  const measureItems = () => {
    primaryItems.forEach((item) => {
      menu.insertBefore(item, moreItem);
      item.classList.add("is-measuring");
    });

    const widths = primaryItems.map((item) => item.getBoundingClientRect().width);
    const moreWidth = moreItem.getBoundingClientRect().width;
    const menuGap = Number.parseFloat(getComputedStyle(menu).columnGap) || 0;
    const available = availableWidth();

    primaryItems.forEach((item) => item.classList.remove("is-measuring"));

    return { widths, moreWidth, menuGap, available };
  };

  const placeItems = (visibleCount) => {
    primaryItems.forEach((item, index) => {
      item.classList.remove("is-measuring");

      if (index < visibleCount) {
        item.classList.remove("is-overflow");
        menu.insertBefore(item, moreItem);
        return;
      }

      item.classList.add("is-overflow");
      dropdown.insertBefore(item, staticHead);
    });
  };

  const update = () => {
    const desktopMenuVisible = desktopQuery.matches && getComputedStyle(menu).display !== "none";

    if (!desktopMenuVisible) {
      placeItems(primaryItems.length);
      header?.classList.add("is-nav-ready");
      return;
    }

    const { widths, moreWidth, menuGap, available } = measureItems();
    let visibleCount = widths.length;

    while (visibleCount > 0) {
      let needed = moreWidth;

      for (let index = 0; index < visibleCount; index += 1) {
        needed += widths[index] + menuGap;
      }

      if (needed <= available + 0.5) {
        break;
      }

      visibleCount -= 1;
    }

    placeItems(visibleCount);
    header?.classList.add("is-nav-ready");
  };

  let frame = 0;
  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(update);
  };

  schedule();
  window.addEventListener("resize", schedule);
  desktopQuery.addEventListener("change", schedule);
  document.fonts?.ready?.then(schedule);

  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(schedule);
    observer.observe(inner);

    const brand = inner.querySelector(".site-header__brand");
    const auth = inner.querySelector(".site-header__auth");

    if (brand) {
      observer.observe(brand);
    }

    if (auth) {
      observer.observe(auth);
    }
  }
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

    if (document.querySelector(".declaration-modal.is-open, .card-modal.is-open")) {
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

function initCancelAccountModal() {
  const modal = document.getElementById("cancel-account-modal");
  if (!modal) {
    return;
  }

  const panel = modal.querySelector(".declaration-modal__panel");
  const form = modal.querySelector("form");
  const closeTriggers = modal.querySelectorAll("[data-modal-close]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastTrigger = null;
  let closeTimer = 0;

  const getFocusable = () => {
    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      return !element.hasAttribute("hidden")
        && !element.classList.contains("visually-hidden")
        && element.getClientRects().length;
    });
  };

  const finishClose = () => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    form?.reset();

    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
  };

  const closeModal = () => {
    if (modal.hidden || !modal.classList.contains("is-open")) {
      return;
    }

    modal.classList.remove("is-open");
    window.clearTimeout(closeTimer);

    if (prefersReducedMotion) {
      finishClose();
      return;
    }

    closeTimer = window.setTimeout(finishClose, 520);
  };

  const openModal = (trigger) => {
    lastTrigger = trigger || null;
    window.clearTimeout(closeTimer);
    form?.reset();

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    void modal.offsetWidth;
    modal.classList.add("is-open");

    window.requestAnimationFrame(() => {
      (modal.querySelector(".checkbox__input") || getFocusable()[0])?.focus();
    });
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-cancel-account-open]");
    if (!trigger || trigger.closest("#cancel-account-modal")) {
      return;
    }

    event.preventDefault();
    openModal(trigger);
  });

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      closeModal();
    });
  });

  panel.addEventListener("transitionend", (event) => {
    if (event.target !== panel || event.propertyName !== "transform") {
      return;
    }

    if (!modal.classList.contains("is-open")) {
      window.clearTimeout(closeTimer);
      finishClose();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden || !modal.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
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

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    closeModal();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initHeaderMenu();
    initAccountDrawer();
    initCancelAccountModal();
  });
} else {
  initHeaderMenu();
  initAccountDrawer();
  initCancelAccountModal();
}
