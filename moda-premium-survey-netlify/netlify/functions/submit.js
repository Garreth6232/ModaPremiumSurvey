// Save one survey submission to Netlify Blobs as JSON
import { getStore } from "@netlify/blobs";

// Helper: validate ratings are integers 1..5
const v = (n) => Number.isInteger(n) && n >= 1 && n <= 5;

export default async (req, ctx) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const data = await req.json();

    // Basic validation
    const required = [
      "suite_or_section",

      // Staff (3)
      "staff_friendliness",
      "staff_attentiveness",
      "staff_professionalism",

      // Drinks (5)
      "drinks_service_staff",
      "drinks_taste",
      "drinks_value",
      "drinks_variety",
      "drinks_wait_time",

      // Food (6)
      "food_portion_size",
      "food_quality",
      "food_service_staff",
      "food_taste",
      "food_value",
      "food_wait_time"
    ];

    for (const k of required) {
      if (typeof data[k] === "undefined" || data[k] === "") {
        return new Response(JSON.stringify({ ok: false, error: `Missing field: ${k}` }), {
          status: 400,
          headers: { "content-type": "application/json" }
        });
      }
    }

    // Validate numeric ratings
    const ratingKeys = required.filter((k) => k !== "suite_or_section");
    for (const rk of ratingKeys) {
      const n = Number(data[rk]);
      if (!v(n)) {
        return new Response(JSON.stringify({ ok: false, error: `Invalid rating for ${rk}` }), {
          status: 400,
          headers: { "content-type": "application/json" }
        });
      }
      data[rk] = n;
    }

    const record = {
      timestamp: new Date().toISOString(),
      venue: "Moda Center Premium",
      ...data
    };

    const store = getStore("responses"); // site-wide store
    const key = `${record.timestamp}_${Math.random().toString(36).slice(2, 8)}.json`;
    await store.setJSON(key, record);

    return new Response(JSON.stringify({ ok: true, key }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
};

