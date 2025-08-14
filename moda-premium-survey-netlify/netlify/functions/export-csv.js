// Return all submissions as a CSV download
import { getStore } from "@netlify/blobs";

// CSV headers
const HEADERS = [
  "timestamp",
  "venue",
  "suite_or_section",
  "staff_friendliness",
  "staff_attentiveness",
  "staff_professionalism",
  "drinks_service_staff",
  "drinks_taste",
  "drinks_value",
  "drinks_variety",
  "drinks_wait_time",
  "food_portion_size",
  "food_quality",
  "food_service_staff",
  "food_taste",
  "food_value",
  "food_wait_time",
  "comments"
];

function toCsvRow(obj) {
  return HEADERS.map((h) => {
    let v = obj[h] ?? "";
    if (typeof v === "string") {
      // escape quotes
      v = `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  }).join(",");
}

export default async (req, ctx) => {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const store = getStore("responses");
  const { blobs } = await store.list(); // list all keys in the store

  const rows = [HEADERS.join(",")];

  for (const { key } of blobs) {
    const txt = await store.get(key);
    if (!txt) continue;
    try {
      const obj = JSON.parse(txt);
      rows.push(toCsvRow(obj));
    } catch {}
  }

  const csv = rows.join("\n");
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="responses.csv"`
    }
  });
};

