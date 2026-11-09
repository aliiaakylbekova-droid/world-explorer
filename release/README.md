# Windows-сборки GEO QUEST

Собираются командой `npm run dist:win` в корне репозитория.

На этой Linux-машине:

- Полный NSIS-установщик **не дописывается**: electron-builder вызывает 32-bit Wine (`syswow64/ntdll.dll`), а в среде есть только wine64. Заглушка `GEO QUEST Setup.exe` (~150 КБ) без рабочего uninstall — **не готовый установщик**.
- Рабочий Windows-артефакт: zip с `GEO QUEST.exe` (`GEO QUEST Portable.zip` / `GEO QUEST Setup.zip`) и папка `win-unpacked/`.
- На Windows 10/11 x64 распакуй zip и запусти `GEO QUEST.exe`. Ярлык установщика появится, когда NSIS соберут на машине с Wine32 или на самом Windows (`npm run dist:win`).

Не коммить бинарники из этой папки в git (они больше 100 МБ).
