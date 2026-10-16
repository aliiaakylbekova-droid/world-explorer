# WORLD EXPLORER

Fullscreen geography quiz for grade 7. The world map fills the screen for the whole game. Fifteen questions, twenty minutes, score out of 1500. The interface is in Russian.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:47231](http://127.0.0.1:47231). The dev server listens on `0.0.0.0:47231`.

## What is on screen

- Esri World Street Map (no API key), shifted with a light parchment filter so oceans read as parchment, land as beige, and borders as brown. CARTO’s free tiles watermark without a key, and the public OpenStreetMap tile server blocks this app. If the street tiles fail, the map falls back to Esri’s World Physical Map with the same treatment.
- A compact top bar: title, question number, countdown, score, and progress.
- A bottom panel with the question and four answers.
- After the quiz, the result and a review of every answer stay over the map.

Progress is stored only in the browser. Refreshing the page starts over.

## Production build

```bash
npm run build
```

Vite writes the site to `dist`. On Vercel, set the framework to Vite, leave the root directory as the repository root, build command `npm run build`, and output directory `dist`.
