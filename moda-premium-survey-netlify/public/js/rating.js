(function () {
  function createStar(value) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "star";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-label", `${value} star${value > 1 ? "s" : ""}`);
    btn.dataset.value = String(value);
    return btn;
  }

  function initRating(ratingEl) {
    const name = ratingEl.dataset.name;
    const hidden = ratingEl.parentElement.querySelector(`input[type="hidden"][name="${name}"]`)
      || ratingEl.parentElement.querySelector("input[type='hidden']");
    ratingEl.setAttribute("role", "radiogroup");

    for (let i = 1; i <= 5; i++) ratingEl.appendChild(createStar(i));

    const stars = Array.from(ratingEl.querySelectorAll(".star"));
    function setValue(val) {
      const n = Number(val) || 0;
      hidden.value = n ? String(n) : "";
      stars.forEach((s) => {
        const v = Number(s.dataset.value);
        s.classList.toggle("selected", v <= n);
        s.setAttribute("aria-checked", n && v === n ? "true" : "false");
      });
    }

    // Pre-fill from hidden value (set by formflow.js)
    const initial = hidden.value || "";
    if (initial) setValue(initial);

    stars.forEach((s) => {
      s.addEventListener("click", () => setValue(s.dataset.value));
      s.addEventListener("keydown", (e) => {
        const current = Number(hidden.value) || 0;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setValue(Math.min(5, current + 1 || 1)); }
        if (e.key === "ArrowLeft"  || e.key === "ArrowDown") { e.preventDefault(); setValue(Math.max(1, current - 1 || 1)); }
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); setValue(s.dataset.value); }
      });
      s.tabIndex = 0;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".rating").forEach(initRating);
  });
})();

