# WORLD EXPLORER

Fullscreen geography quiz for grade 7. The world map fills the screen for the whole game. Fifteen questions, twenty minutes, score out of 1500. The interface is in Russian. Students and teachers share one device (or the same browser profile): there is no cloud account.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:47231](http://127.0.0.1:47231). The dev server listens on `0.0.0.0:47231`.

## Who logs in how

On the first screen choose **Ученик** or **Учитель**.

- **Ученик:** enter a name (required, at least two letters) and an optional class, then **Войти**. The start card is the student cabinet. After the quiz, the attempt is saved. **Пройти ещё раз** writes a new attempt.
- **Учитель:** code `учитель`, PIN `4723`. The cabinet lists every attempt stored in this browser: name, score /1500, percent, correct count, time, date. Click a row to open the same answer review the student sees. **Обновить** re-reads storage if another tab just finished a quiz.

Change the teacher code and PIN from the bottom of the teacher cabinet (saved on this device) or by editing `src/session/credentials.ts` (`DEFAULT_TEACHER_CODE` / `DEFAULT_TEACHER_PIN`).

## Where results live

Attempts are stored in the browser **localStorage** key `world-explorer-attempts` on this device only. No server and no API key. A refresh of the teacher cabinet is enough to see new local results. The current login lives in `sessionStorage` (`world-explorer-session`) so a page reload keeps the cabinet, but another browser or computer will not see these scores.

## What is on screen

- Esri World Street Map (no API key), shifted with a light parchment filter so oceans read as parchment, land as beige, and borders as brown. CARTO’s free tiles watermark without a key, and the public OpenStreetMap tile server blocks this app. If the street tiles fail, the map falls back to Esri’s World Physical Map with the same treatment.
- A compact top bar: title, question number, countdown, score, and progress. **Выйти** returns to the role screen (hidden while a question is in play).
- A bottom panel with the question and four answers.
- After the quiz, the result and a review of every answer stay over the map.

## Production build

```bash
npm run build
```

Vite writes the site to `dist`. On Vercel, set the framework to Vite, leave the root directory as the repository root, build command `npm run build`, and output directory `dist`.
