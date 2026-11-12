# Тамагочи Аластор

Готовая статическая сборка игры из [voxensation/AlCare](https://github.com/voxensation/AlCare), версия `49d06d1`.

Игра открывается по адресу [voxensation.github.io/Thombs/alcare/](https://voxensation.github.io/Thombs/alcare/) и через кнопку в «Сундучке Аластора».

Для обновления выполни `node build.mjs` в исходном проекте AlCare и скопируй содержимое `dist/` в эту папку. Обязательно включи `locations/manifest.json`, изображения и шрифты. GitHub Pages публикует корень ветки `main`; отдельный сервер для игры не нужен.

Язык, оформление и прогресс хранятся в localStorage. Поскольку AlCare и Thombs размещены на одном домене `voxensation.github.io`, сохранения игры доступны по обоим адресам в одном браузере.
