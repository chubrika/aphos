function initDashboardTabs() {
  const root = document.querySelector(".dashboard-tabs");
  if (!root) {
    return;
  }

  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));

  if (!tabs.length || !panels.length) {
    return;
  }

  const activateTab = (nextTab) => {
    tabs.forEach((tab) => {
      const isActive = tab === nextTab;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.id === nextTab.getAttribute("aria-controls");
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboardTabs);
} else {
  initDashboardTabs();
}
