# GEO QUEST

**Explore the World. Discover the Unknown.**

Офлайн-игра для Windows: Electron + React + TypeScript + Three.js. После регистрации сразу **Исследуй** (нет главного меню из карточек). Интерфейс на русском.

## Запуск в браузере (ветка `localhost`)

```bash
npm install
npm run dev
```

Vite слушает **http://127.0.0.1:47231/** и открывает Google Chrome. Electron не нужен. HMR с `watch.usePolling`. Если порт уже занят живым Vite, команда только открывает браузер.

## Запуск Electron

```bash
npm install
npm run electron:dev
```

Живой URL тот же: **http://127.0.0.1:47231/**

`vite preview` смотрит уже собранный `dist/` на порту **4173**, не на 47231 — иначе Try Live показывал бы старый билд.

## Сборка Windows

```bash
npm run dist:win
```

На Linux без wine32 NSIS-установщик не дописывается. Реальный артефакт — zip/`win-unpacked/GEO QUEST.exe`. На Windows `npm run dist:win` даёт Setup.exe.

## Облако (Supabase, опционально)

Локальные сохранения (Electron JSON IPC или `localStorage`) работают **без ключей**. Если ключи заданы, клиент дополнительно пишет те же поля в облако.

1. Скопируйте `.env.example` → `.env.local` (Vite) и заполните:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (только anon / public; **никогда** `service_role` в клиенте)
2. В проекте Supabase выполните SQL из `supabase/migrations/20261109_geo_quest.sql`.
3. Auth → Providers: включите **Anonymous** (регистрация в игре — никнейм, без почты).
4. Таблицы совпадают с локальной архитектурой: `profiles`, `progress`, `leaderboard` (поля как `Profile` / `Progress` / `LeaderRow`). RLS: свои строки; таблица очков читается всеми.

Ключи не коммитьте. Не вставляйте их в чат.

## Vercel (подготовка, не автодеплой из этого репозитория)

Репозиторий GitHub: `aliiaakylbekova-droid/world-explorer`. Файлы: `vercel.json` (Vite, `dist`, SPA rewrite).

Остаётся в **дашборде Vercel** (этот репозиторий не включает прод-деплой):

1. Import Project → тот GitHub-репозиторий.
2. Framework Preset: Vite. Build: `npm run build`. Output: `dist`.
3. Environment Variables (Production / Preview): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Production Branch: `main` и включить Auto-deploy on push.
5. После первого деплоя проверить SPA-роутинг (`/` и прямой заход на путь).

Пока импорт в дашборде не сделан, продакшен **не считается живым**.

Локальная проверка прод-сборки:

```bash
npm run build
npx vite preview --host 127.0.0.1 --port 4173
```

## Игровой цикл

1. **Исследуй** — реалистичный глобус (NASA Blue Marble + bump), GeoJSON Natural Earth (границы, реки, озёра, города, моря, горы), слои, LOD подписей.
2. **Открой** — сцена места (Тянь-Шань/Иссык-Куль, Эйфель, Гиза) с точками сведений.
3. **Миссия** — только после знакомства с картой: найди реку, гору, координаты, город, материк. Кликни по карте. Неверно — географическая подсказка и повтор, пока есть время.
4. **Флаги** — большая картинка флага + глобус, клик по стране. Также: столица, координаты, соседи, контур.

HUD: слева задача, в центре 3D, справа страна/таймер/слои, снизу навигация.

Сохранение профиля через безопасный IPC (десктоп) или `localStorage` (браузер). Онлайн — опциональный Supabase в `src/net/`.

Карты и текстуры лежат в `public/` (см. `public/ATTRIBUTION.txt`).
