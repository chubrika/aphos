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

const FAVORITES_STORAGE_PREFIX = "aphos:search-select-favorites:";
const STAR_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
`;

function slugifyOptionValue(label) {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeOptionLabel(value) {
  return value.replace(/\s+/g, " ").trim();
}

function getFavoritesKey(select) {
  const id =
    select.querySelector('input[type="hidden"]')?.id ||
    select.querySelector(".search-select__list")?.id ||
    "default";
  return `${FAVORITES_STORAGE_PREFIX}${id}`;
}

function loadFavorites(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function saveFavorites(key, favorites) {
  try {
    localStorage.setItem(key, JSON.stringify([...favorites]));
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

function getOptionLabelText(option) {
  const label = option.querySelector(".search-select__option-label");
  return normalizeOptionLabel(label?.textContent || option.textContent || "");
}

function syncFavoriteButton(button, isFavorite) {
  button.setAttribute("aria-pressed", String(isFavorite));
  button.setAttribute("aria-label", isFavorite ? "ფავორიტიდან მოხსნა" : "ფავორიტად მონიშვნა");
  button.classList.toggle("is-active", isFavorite);
}

function enhanceOption(option, index, favorites) {
  if (option.dataset.originalIndex == null) {
    option.dataset.originalIndex = String(index);
  }

  let label = option.querySelector(".search-select__option-label");
  if (!label) {
    const text = getOptionLabelText(option);
    option.replaceChildren();
    label = document.createElement("span");
    label.className = "search-select__option-label";
    label.textContent = text;
    option.append(label);
  }

  let favoriteButton = option.querySelector(".search-select__favorite");
  if (!favoriteButton) {
    favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.className = "search-select__favorite";
    favoriteButton.innerHTML = STAR_ICON;
    option.append(favoriteButton);
  }

  const isFavorite = favorites.has(option.dataset.value);
  option.classList.toggle("is-favorite", isFavorite);
  syncFavoriteButton(favoriteButton, isFavorite);
}

function sortOptionsByFavorite(list, favorites) {
  const options = Array.from(list.querySelectorAll(".search-select__option"));

  options.sort((a, b) => {
    const aFavorite = favorites.has(a.dataset.value) ? 0 : 1;
    const bFavorite = favorites.has(b.dataset.value) ? 0 : 1;

    if (aFavorite !== bFavorite) {
      return aFavorite - bFavorite;
    }

    return Number(a.dataset.originalIndex || 0) - Number(b.dataset.originalIndex || 0);
  });

  options.forEach((option) => list.append(option));
}

function enhanceAndSortOptions(list, favorites, showFavorites) {
  if (!showFavorites) {
    return;
  }

  Array.from(list.querySelectorAll(".search-select__option")).forEach((option, index) => {
    enhanceOption(option, index, favorites);
  });
  sortOptionsByFavorite(list, favorites);
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
    const showFavorites = select.hasAttribute("data-search-select-favorites");
    const favoritesKey = showFavorites ? getFavoritesKey(select) : "";
    const favorites = showFavorites ? loadFavorites(favoritesKey) : new Set();

    const getOptionLabel = (option) => getOptionLabelText(option);

    enhanceAndSortOptions(list, favorites, showFavorites);

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
      enhanceAndSortOptions(list, favorites, showFavorites);
      menu.hidden = false;
      menu.setAttribute("aria-hidden", "false");
      void menu.offsetHeight;
      select.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      searchInput?.focus();
      searchInput?.select();
    };

    const toggleFavorite = (option) => {
      if (!showFavorites) {
        return;
      }

      const value = option.dataset.value;
      if (!value) {
        return;
      }

      if (favorites.has(value)) {
        favorites.delete(value);
      } else {
        favorites.add(value);
      }

      saveFavorites(favoritesKey, favorites);
      enhanceAndSortOptions(list, favorites, showFavorites);
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
      const favoriteButton = event.target.closest(".search-select__favorite");
      if (favoriteButton) {
        event.preventDefault();
        event.stopPropagation();
        const option = favoriteButton.closest(".search-select__option");
        if (option && !option.hidden) {
          toggleFavorite(option);
        }
        return;
      }

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
