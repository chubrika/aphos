function updateFloatingField(field) {
  const control = field.querySelector(".floating-field__control");

  if (!control) {
    return;
  }

  const isFilled =
    control.tagName === "SELECT"
      ? control.value !== ""
      : control.value.trim() !== "";

  field.classList.toggle("is-filled", isFilled);
}

function initFloatingField(field) {
  const control = field.querySelector(".floating-field__control");

  if (!control) {
    return;
  }

  const refresh = () => updateFloatingField(field);

  refresh();

  control.addEventListener("input", refresh);
  control.addEventListener("change", refresh);
  control.addEventListener("blur", refresh);

  if (control.type === "password" || control.type === "email") {
    setTimeout(refresh, 100);
    setTimeout(refresh, 500);
  }
}

function initFloatingFields(root = document) {
  root.querySelectorAll(".floating-field").forEach(initFloatingField);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initFloatingFields());
} else {
  initFloatingFields();
}
