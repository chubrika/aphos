let tabPickerCount = 0;

function cloneTabContent(tab) {
  const fragment = document.createDocumentFragment();

  Array.from(tab.children).forEach((child) => {
    fragment.append(child.cloneNode(true));
  });

  return fragment;
}

function initTabPicker(root, tabs) {
  const nav = root.querySelector('[role="tablist"]');

  if (!nav || root.dataset.tabPicker === "true") {
    return;
  }

  tabPickerCount += 1;
  const modalId = `tabs-picker-modal-${tabPickerCount}`;
  const titleId = `tabs-picker-title-${tabPickerCount}`;
  const listLabel = nav.getAttribute("aria-label") || "";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktopQuery = window.matchMedia("(min-width: 769px)");
  let closeTimer = 0;

  const picker = document.createElement("button");
  picker.type = "button";
  picker.className = "tabs-picker";
  picker.setAttribute("aria-haspopup", "dialog");
  picker.setAttribute("aria-expanded", "false");
  picker.setAttribute("aria-controls", modalId);
  picker.innerHTML =
    '<span class="tabs-picker__current"></span><span class="tabs-picker__icon" aria-hidden="true"></span>';

  const current = picker.querySelector(".tabs-picker__current");
  nav.after(picker);

  const modal = document.createElement("div");
  modal.className = "tabs-picker-modal";
  modal.id = modalId;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="tabs-picker-modal__overlay" data-tabs-picker-close></div>
    <div class="tabs-picker-modal__panel" role="dialog" aria-modal="true" aria-labelledby="${titleId}" tabindex="-1">
      <div class="tabs-picker-modal__inner">
        <button class="tabs-picker-modal__close" type="button" aria-label="დახურვა" data-tabs-picker-close>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h2 class="visually-hidden" id="${titleId}"></h2>
        <div class="tabs-picker-modal__list" role="listbox" aria-labelledby="${titleId}"></div>
      </div>
    </div>
  `;

  document.body.append(modal);
  modal.querySelector(`#${titleId}`).textContent = listLabel;

  const panel = modal.querySelector(".tabs-picker-modal__panel");
  const list = modal.querySelector(".tabs-picker-modal__list");
  const closeTriggers = modal.querySelectorAll("[data-tabs-picker-close]");

  const getFocusable = () => {
    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length && !element.closest("[hidden]"));
  };

  const syncPicker = () => {
    const activeTab = tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0];
    const tabKey = activeTab.getAttribute("data-tab") || activeTab.id || "";
    const labelText = activeTab.textContent.replace(/\s+/g, " ").trim();

    current.replaceChildren(cloneTabContent(activeTab));
    picker.setAttribute("aria-label", labelText || listLabel);

    list.querySelectorAll(".tabs-picker-modal__option").forEach((option) => {
      const isActive = option.getAttribute("data-tab") === tabKey;
      option.classList.toggle("is-active", isActive);
      option.setAttribute("aria-selected", String(isActive));
    });
  };

  const finishClose = () => {
    if (modal.hidden) {
      return;
    }

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    picker.classList.remove("is-open");
    picker.setAttribute("aria-expanded", "false");

    if (!desktopQuery.matches) {
      picker.focus();
    }
  };

  const closeModal = () => {
    if (modal.hidden || !modal.classList.contains("is-open")) {
      return;
    }

    modal.classList.remove("is-open");
    picker.classList.remove("is-open");
    picker.setAttribute("aria-expanded", "false");
    window.clearTimeout(closeTimer);

    if (prefersReducedMotion) {
      finishClose();
      return;
    }

    closeTimer = window.setTimeout(finishClose, 520);
  };

  const openModal = () => {
    if (desktopQuery.matches) {
      return;
    }

    window.clearTimeout(closeTimer);
    syncPicker();
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    picker.classList.add("is-open");
    picker.setAttribute("aria-expanded", "true");
    void modal.offsetWidth;
    modal.classList.add("is-open");

    window.requestAnimationFrame(() => {
      const activeOption = list.querySelector(".tabs-picker-modal__option.is-active");
      (activeOption || panel).focus();
    });
  };

  tabs.forEach((tab) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "tabs-picker-modal__option";
    option.setAttribute("role", "option");
    option.setAttribute("data-tab", tab.getAttribute("data-tab") || tab.id || "");
    option.append(cloneTabContent(tab));

    option.addEventListener("click", () => {
      if (tab.getAttribute("aria-selected") !== "true") {
        tab.click();
      }

      syncPicker();
      closeModal();
    });

    list.append(option);
    tab.addEventListener("click", syncPicker);
  });

  picker.addEventListener("click", () => {
    if (modal.classList.contains("is-open") && !modal.hidden) {
      closeModal();
      return;
    }

    openModal();
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

  const handleViewportChange = () => {
    if (desktopQuery.matches) {
      closeModal();
    }
  };

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", handleViewportChange);
  } else if (typeof desktopQuery.addListener === "function") {
    desktopQuery.addListener(handleViewportChange);
  }

  root.classList.add("has-tab-picker");
  root.dataset.tabPicker = "true";
  syncPicker();
}

function initTabs(rootSelector = ".tabs, .dashboard-tabs") {
  const roots = Array.from(document.querySelectorAll(rootSelector));

  if (!roots.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  roots.forEach((root) => {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));

    if (!tabs.length || !panels.length) {
      return;
    }

    const revealPanel = (panel) => {
      panel.classList.remove("is-revealed");

      if (prefersReducedMotion) {
        panel.classList.add("is-revealed");
        return;
      }

      void panel.offsetWidth;
      panel.classList.add("is-revealed");
    };

    const activateTab = (nextTab) => {
      const nextPanelId = nextTab.getAttribute("aria-controls");

      tabs.forEach((tab) => {
        const isActive = tab === nextTab;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel) => {
        const isActive = panel.id === nextPanelId;
        panel.classList.toggle("is-active", isActive);
        panel.classList.remove("is-revealed");
        panel.hidden = !isActive;
      });

      const nextPanel = panels.find((panel) => panel.id === nextPanelId);
      if (nextPanel) {
        revealPanel(nextPanel);
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        if (tab.getAttribute("aria-selected") === "true") {
          return;
        }

        activateTab(tab);
      });

      tab.addEventListener("keydown", (event) => {
        let targetIndex = null;

        if (event.key === "ArrowRight") {
          targetIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          targetIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          targetIndex = 0;
        } else if (event.key === "End") {
          targetIndex = tabs.length - 1;
        }

        if (targetIndex === null) {
          return;
        }

        event.preventDefault();
        const nextTab = tabs[targetIndex];
        activateTab(nextTab);
        nextTab.focus();
      });
    });

    const initialPanel = panels.find((panel) => panel.classList.contains("is-active")) || panels[0];
    if (initialPanel && !initialPanel.classList.contains("is-revealed")) {
      revealPanel(initialPanel);
    }

    initTabPicker(root, tabs);
  });
}
