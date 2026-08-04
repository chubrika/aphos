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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeaderMenu);
} else {
  initHeaderMenu();
}
