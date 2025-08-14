# Moda Center Premium Survey — Netlify

Static multi-page survey with 5-star ratings (using `public/assets/star.png`) and a serverless backend:

- **Netlify Functions** (`/api/submit`) save each submission to **Netlify Blobs** as JSON.
- **Export CSV** at `/api/export-csv`.

## Local dev
```bash
npm i -g netlify-cli
npm i
netlify dev
# open http://localhost:8888
```

## Deploy
Push to GitHub and connect the repo to Netlify.

No build step required. Publish dir: public/; Functions dir: netlify/functions/.

Put your star image at public/assets/star.png.

## Data
Stored in Netlify Blobs store named responses. Browse/download in the Netlify UI.

Download CSV from /api/export-csv (also linked on thank-you.html).

## Notes
Netlify Functions run JS/TS/Go (no Python). We replaced Flask with Functions + Blobs to be fully Netlify-native.

