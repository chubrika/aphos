function initWarehouseCopy() {
  const status = document.querySelector("[data-copy-status]");
  const buttons = Array.from(document.querySelectorAll("[data-copy]"));

  if (!buttons.length) {
    return;
  }

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  };

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy") || "";

      if (!value) {
        return;
      }

      try {
        await copyText(value);
        button.classList.add("is-copied");
        button.setAttribute("aria-label", "დაკოპირდა");

        if (status) {
          status.textContent = "დაკოპირდა";
        }

        window.setTimeout(() => {
          button.classList.remove("is-copied");
          button.setAttribute("aria-label", button.dataset.copyLabel || "კოპირება");

          if (status) {
            status.textContent = "";
          }
        }, 1600);
      } catch (error) {
        console.error(error);
      }
    });
  });
}

function initWarehouses() {
  if (typeof initTabs === "function") {
    initTabs(".tabs");
  }

  initWarehouseCopy();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWarehouses);
} else {
  initWarehouses();
}
