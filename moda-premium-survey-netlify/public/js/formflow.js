// Handles multipage flow using localStorage and form validation.
// Final submit posts to /api/submit (Netlify Function).

const STORE_KEY = "moda-premium-survey";

function save(partial) {
  const cur = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
  localStorage.setItem(STORE_KEY, JSON.stringify({ ...cur, ...partial }));
}

function load() {
  return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
}

function prefill(selectorMap) {
  const data = load();
  for (const [name, el] of Object.entries(selectorMap)) {
    if (!el) continue;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      if (typeof data[name] !== "undefined") el.value = data[name];
    }
  }
}

function allRated(form, names) {
  return names.every((n) => {
    const v = Number(form.querySelector(`input[name="${n}"]`)?.value);
    return Number.isInteger(v) && v >= 1 && v <= 5;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname;

  // INDEX (intro)
  if (path.endsWith("/index.html") || path === "/" || path === "/public/") {
    const form = document.getElementById("intro-form");
    if (form) {
      const suite = form.querySelector('input[name="suite_or_section"]');
      prefill({ suite_or_section: suite });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        save({ suite_or_section: suite.value.trim() });
        location.href = "staff.html";
      });
    }
  }

  // STAFF
  if (path.endsWith("/staff.html")) {
    const form = document.getElementById("staff-form");
    const suite = form.querySelector('input[name="suite_or_section"]');
    const fields = ["staff_friendliness","staff_attentiveness","staff_professionalism"];
    prefill({ suite_or_section: suite });
    // prefill ratings into hidden inputs
    const data = load();
    fields.forEach((k) => {
      const inp = form.querySelector(`input[name="${k}"]`);
      if (inp && data[k]) inp.value = data[k];
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const values = {
        suite_or_section: suite.value.trim(),
        staff_friendliness: Number(form.staff_friendliness.value),
        staff_attentiveness: Number(form.staff_attentiveness.value),
        staff_professionalism: Number(form.staff_professionalism.value)
      };
      if (!allRated(form, Object.keys(values).filter(k=>k!=="suite_or_section"))) {
        form.querySelector(".form-error").hidden = false;
        return;
      }
      save(values);
      location.href = "drinks.html";
    });
  }

  // DRINKS
  if (path.endsWith("/drinks.html")) {
    const form = document.getElementById("drinks-form");
    const fields = [
      "drinks_service_staff","drinks_taste","drinks_value","drinks_variety","drinks_wait_time"
    ];
    // prefill ratings
    const data = load();
    fields.forEach((k) => {
      const inp = form.querySelector(`input[name="${k}"]`);
      if (inp && data[k]) inp.value = data[k];
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const values = Object.fromEntries(fields.map((k) => [k, Number(form[k].value)]));
      if (!allRated(form, fields)) {
        form.querySelector(".form-error").hidden = false;
        return;
      }
      save(values);
      location.href = "food.html";
    });
  }

  // FOOD (final submit)
  if (path.endsWith("/food.html")) {
    const form = document.getElementById("food-form");
    const fields = [
      "food_portion_size","food_quality","food_service_staff",
      "food_taste","food_value","food_wait_time"
    ];
    const data = load();
    // prefill ratings & comment
    fields.forEach((k) => {
      const inp = form.querySelector(`input[name="${k}"]`);
      if (inp && data[k]) inp.value = data[k];
    });
    const comments = form.querySelector('textarea[name="comments"]');
    if (data.comments) comments.value = data.comments;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const values = Object.fromEntries(fields.map((k) => [k, Number(form[k].value)]));
      if (!allRated(form, fields)) {
        form.querySelector(".form-error").hidden = false;
        return;
      }
      const payload = {
        ...load(),
        ...values,
        comments: comments.value.trim()
      };

      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const j = await res.json();
        if (!res.ok || !j.ok) throw new Error(j.error || "Failed");
        localStorage.removeItem(STORE_KEY);
        location.href = "thank-you.html";
      } catch (err) {
        alert("Submission failed. Please check your connection and try again.");
      }
    });
  }
});


