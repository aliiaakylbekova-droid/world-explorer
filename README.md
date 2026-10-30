# METEOR MATH — Космическая математика

Full-screen cosmic arithmetic game. Rocky meteors drift through a star field; after you start, one flies to the center and only then shows a generated equation. Answer on the on-screen keypad or the keyboard before the timer runs out. A wrong answer can be retried until time expires. The interface is in Russian.

WORLD EXPLORER, the grade-7 geography quiz, stays on its own screen at `#/explorer`. Return with «К метеорам». The game itself has no site header, sidebar, or quiz link.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:47231](http://127.0.0.1:47231). The dev server listens on `0.0.0.0:47231`.

Choose the time limit (10 / 15 / 20 / 30 / 45 / 60 seconds, default 30) and how many problems to face (5, 10, 20, or endless). Every difficulty uses addition, subtraction, multiplication, and exact division; harder levels use larger numbers. The countdown starts when the problem appears. A timeout explodes the meteor and shows the answer. Endless mode has a stop control.

## Production build

```bash
npm run build
```

Vite writes the site to `dist`. On Vercel, set the framework to Vite, leave the root directory as the repository root, build command `npm run build`, and output directory `dist`.

# WORLD EXPLORER

Fullscreen geography quiz for grade 7. The world map fills the screen for the whole game. Fifteen questions, twenty minutes, score out of 1500. The interface is in Russian.

## What is on screen

- Esri World Street Map (no API key), shifted with a light parchment filter so oceans read as parchment, land as beige, and borders as brown. CARTO’s free tiles watermark without a key, and the public OpenStreetMap tile server blocks this app. If the street tiles fail, the map falls back to Esri’s World Physical Map with the same treatment.
- A compact top bar: title, question number, countdown, score, and progress.
- A bottom panel with the question and four answers.
- After the quiz, the result and a review of every answer stay over the map.

Progress is stored only in the browser. Refreshing the page starts over.
