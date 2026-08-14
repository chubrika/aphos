function initFlights() {
  if (typeof initTabs === "function") {
    initTabs(".tabs");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFlights);
} else {
  initFlights();
}
