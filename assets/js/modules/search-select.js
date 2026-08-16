const SHOP_OPTIONS = [
  "Amazon",
  "eBay",
  "Walmart",
  "Target",
  "Best Buy",
  "Costco",
  "Macy's",
  "Nordstrom",
  "Nike",
  "Adidas",
  "Zara",
  "H&M",
  "Gap",
  "Old Navy",
  "Forever 21",
  "Shein",
  "Temu",
  "AliExpress",
  "Etsy",
  "ASOS",
  "Boohoo",
  "PrettyLittleThing",
  "Farfetch",
  "Sephora",
  "Ulta",
  "Apple",
  "Samsung",
  "IKEA",
  "Home Depot",
  "Lowe's",
  "Wayfair",
  "Chewy",
  "StockX",
  "GOAT",
  "Revolve",
  "Fashion Nova",
  "Victoria's Secret",
  "Bath & Body Works",
  "Dick's Sporting Goods",
  "Foot Locker",
  "New Balance",
  "Puma",
  "Under Armour",
  "Lululemon",
  "Coach",
  "Michael Kors",
  "Gucci",
  "Louis Vuitton",
  "Prada",
  "Balenciaga",
];

function slugifyOptionValue(label) {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function populateShopOptions(select) {
  const list = select.querySelector(".search-select__list");
  if (!list || list.children.length) {
    return;
  }

  SHOP_OPTIONS.forEach((name) => {
    const option = document.createElement("li");
    option.role = "option";
    option.className = "search-select__option";
    option.dataset.value = slugifyOptionValue(name);
    option.tabIndex = -1;
    option.setAttribute("aria-selected", "false");
    option.textContent = name;
    list.append(option);
  });
}

function initSearchSelects(root = document) {
  root.querySelectorAll("[data-search-select]").forEach((select) => {
    if (select.dataset.searchSelectReady === "true") {
      return;
    }

    if (select.dataset.searchSelectType === "shop") {
      populateShopOptions(select);
    }

    const hiddenInput = select.querySelector('input[type="hidden"]');
    const trigger = select.querySelector(".search-select__trigger");
    const labelEl = select.querySelector("[data-search-label]");
    const menu = select.querySelector(".search-select__menu");
    const searchInput = select.querySelector(".search-select__search");
    const list = select.querySelector(".search-select__list");
    const form = select.closest("form");
    const placeholder = labelEl?.dataset.placeholder || labelEl?.textContent?.trim() || "აირჩიეთ";
    const getOptions = () => Array.from(select.querySelectorAll(".search-select__option"));

    if (!hiddenInput || !trigger || !menu || !list) {
      return;
    }

    select.dataset.searchSelectReady = "true";

    const menuTransitionMs = 250;
    let menuCloseTimer = null;

    const getOptionLabel = (option) => option.textContent.trim();

    const setPlaceholderState = (hasValue) => {
      trigger.classList.toggle("is-placeholder", !hasValue);

      if (hasValue) {
        trigger.classList.remove("input--required");
        trigger.classList.remove("is-invalid");
      }
    };

    const syncFromValue = (value) => {
      const options = getOptions();
      const option = options.find((item) => item.dataset.value === value);

      if (!option) {
        hiddenInput.value = "";
        if (labelEl) {
          labelEl.textContent = placeholder;
        }
        options.forEach((item) => {
          item.classList.remove("is-selected");
          item.setAttribute("aria-selected", "false");
        });
        setPlaceholderState(false);
        hiddenInput.dispatchEvent(new Event("input", { bubbles: true }));
        hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }

      hiddenInput.value = value;
      if (labelEl) {
        labelEl.textContent = getOptionLabel(option);
      }

      options.forEach((item) => {
        const selected = item === option;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-selected", String(selected));
      });
      setPlaceholderState(true);
      hiddenInput.dispatchEvent(new Event("input", { bubbles: true }));
      hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const filterOptions = (query) => {
      const normalized = query.trim().toLowerCase();
      let visibleCount = 0;

      getOptions().forEach((option) => {
        const matches = !normalized || getOptionLabel(option).toLowerCase().includes(normalized);
        option.hidden = !matches;
        if (matches) {
          visibleCount += 1;
        }
      });

      list.classList.toggle("search-select__list--empty", visibleCount === 0);
    };

    const closeSelect = () => {
      if (!select.classList.contains("is-open")) {
        return;
      }

      select.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");

      if (searchInput) {
        searchInput.value = "";
        filterOptions("");
      }

      window.clearTimeout(menuCloseTimer);
      menuCloseTimer = window.setTimeout(() => {
        menu.hidden = true;
      }, menuTransitionMs);
    };

    const openSelect = () => {
      window.clearTimeout(menuCloseTimer);
      menu.hidden = false;
      menu.setAttribute("aria-hidden", "false");
      void menu.offsetHeight;
      select.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      searchInput?.focus();
      searchInput?.select();
    };

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (select.classList.contains("is-open")) {
        closeSelect();
      } else {
        openSelect();
      }
    });

    searchInput?.addEventListener("input", () => {
      filterOptions(searchInput.value);
    });

    searchInput?.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeSelect();
        trigger.focus();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const firstVisible = getOptions().find((option) => !option.hidden);
        if (firstVisible) {
          syncFromValue(firstVisible.dataset.value || "");
          closeSelect();
          trigger.focus();
        }
      }
    });

    list.addEventListener("click", (event) => {
      const option = event.target.closest(".search-select__option");
      if (!option || option.hidden) {
        return;
      }

      syncFromValue(option.dataset.value || "");
      closeSelect();
      trigger.focus();
    });

    document.addEventListener("click", (event) => {
      window.setTimeout(() => {
        if (!select.contains(event.target)) {
          closeSelect();
        }
      }, 0);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && select.classList.contains("is-open")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeSelect();
        trigger.focus();
      }
    });

    form?.addEventListener("reset", () => {
      window.requestAnimationFrame(() => {
        syncFromValue(hiddenInput.value || hiddenInput.defaultValue || "");
        closeSelect();
      });
    });

    hiddenInput.addEventListener("invalid", () => {
      trigger.classList.add("is-invalid");
    });

    hiddenInput.addEventListener("input", () => {
      trigger.classList.remove("is-invalid");
    });

    syncFromValue(hiddenInput.value || hiddenInput.defaultValue || "");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initSearchSelects());
} else {
  initSearchSelects();
}
