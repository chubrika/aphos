function initHeaderMenu() {
  const toggleButton = document.querySelector(".site-header__toggle");
  const navigation = document.querySelector(".site-header__nav");
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

  if (!langSwitcher || !langTrigger || !langLabel || !langFlag || !langOptions.length) {
    return;
  }

  const setLanguage = (option) => {
    langLabel.textContent = option.dataset.lang || "eng";
    langFlag.src = option.dataset.flagSrc || "assets/images/flag_en.svg";
    langFlag.alt = option.dataset.flagAlt || "English";

    langOptions.forEach((item) => {
      item.classList.toggle("is-active", item === option);
    });
  };

  const closeLanguageMenu = () => {
    langSwitcher.classList.remove("is-open");
    langTrigger.setAttribute("aria-expanded", "false");
  };

  langTrigger.addEventListener("click", () => {
    const isOpen = langSwitcher.classList.toggle("is-open");
    langTrigger.setAttribute("aria-expanded", String(isOpen));
  });

  langOptions.forEach((option) => {
    option.addEventListener("click", () => {
      setLanguage(option);
      closeLanguageMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!langSwitcher.contains(event.target)) {
      closeLanguageMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLanguageMenu();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeaderMenu);
} else {
  initHeaderMenu();
}
