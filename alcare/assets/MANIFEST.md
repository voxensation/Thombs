# Манифест изображений

`USE_IMAGES = true` уже включён в `config.js`. Положи остальные PNG по указанным путям.
Прозрачный фон рекомендуется для персонажа, предметов и звонка. Фоны — непрозрачные.
Все размеры рекомендуемые. На компьютере сцена сохраняет пропорции фонов 800×500; на телефоне фон обрезается по бокам, сохраняя пол. Если предмет отсутствует, renderSprite покажет эмодзи; если нет фона — CSS-интерьер.

Четыре новых фона `favorite_bg_*.png` и ванна `favorite_bathtub.png` подключены напрямую через `SPRITE_FILES` в config.js. Имена игровых спрайтов (`bg_room`, `item_bathtub` и т. д.) остались прежними; переименовывать или дублировать картинки не нужно. Ванна сохраняет пропорции 260×164 и прозрачность.

Подключены две анимации по 700 мс на кадр: спокойствие (`alastor_neutral.png`, `alastor_neutral_2.png`) и купание (`alastor_in_bath.png`, `alastor_in_bath_2.png`). Кадры купания подготовлены из `IMG_0135.PNG` и `IMG_0136.PNG`. Все остальные состояния пока используют спокойную анимацию через `SPRITE_ALIASES`. Для нового состояния удали его соответствие из `SPRITE_ALIASES` и при необходимости добавь кадры в `SPRITE_ANIMATIONS`.

| Имя файла | Куда положить | Размер, px | Содержимое |
|---|---|---|---|
| alastor_neutral.png | assets/sprites/ | 256×256 | Первый кадр спокойствия, подключён |
| alastor_neutral_2.png | assets/sprites/ | 256×256 | Второй кадр спокойствия, подключён |
| alastor_happy.png | assets/sprites/ | 128×128 | Аластор chibi, довольная улыбка |
| alastor_angry.png | assets/sprites/ | 128×128 | Аластор chibi, сердитый, уши прижаты |
| alastor_in_bath.png | assets/sprites/ | 256×256 | Первый кадр купания, из IMG_0135.PNG |
| alastor_in_bath_2.png | assets/sprites/ | 256×256 | Второй кадр купания, из IMG_0136.PNG |
| alastor_eating.png | assets/sprites/ | 128×128 | Аластор chibi жуёт, довольное лицо |
| alastor_sick.png | assets/sprites/ | 128×128 | Аластор chibi, бледный и нездоровый |
| favorite_bathtub.png | assets/sprites/ | 260×164 | Подключённая ванна с пеной и прозрачным фоном, ID item_bathtub |
| item_shower.png | assets/sprites/ | 96×96 | Душевая лейка с каплями воды |
| item_food_bowl.png | assets/sprites/ | 128×96 | Миска с едой; пустая миска рисуется CSS |
| item_remote.png | assets/sprites/ | 64×128 | Пульт Вокса с кнопками |
| vox_call.png | assets/sprites/ | 128×128 | Сердитый Вокс на экране входящего звонка |
| favorite_bg_room.png | assets/backgrounds/ | 800×500 | Подключённая комната с книжным шкафом, столом и ковром, ID bg_room |
| favorite_bg_bathroom.png | assets/backgrounds/ | 800×500 | Подключённая ванная с синей плиткой и ковриком, ID bg_bathroom |
| favorite_bg_kitchen.png | assets/backgrounds/ | 800×500 | Подключённая кухня с окном и гарнитуром, ID bg_kitchen |
| favorite_bg_living_room.png | assets/backgrounds/ | 800×500 | Подключённая гостиная с креслом и книжным шкафом, ID bg_living_room |
