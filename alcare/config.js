// Missing images still fall back to the emoji placeholders below.
export const USE_IMAGES = true;
export const LANGUAGES = Object.freeze({ ru: 'Русский', en: 'English' });
export const THEMES = Object.freeze({
  light: { label: 'themeLight', color: '#6f253c' },
  roseville: { label: 'themeRoseville', color: '#071b12' },
});

export const SPRITES = Object.freeze({
  alastor_neutral: '😐', alastor_happy: '😊', alastor_angry: '😠',
  alastor_in_bath: '🛁', alastor_eating: '😋', alastor_sick: '🤢',
  item_bathtub: '🛁', item_shower: '🚿', item_food_bowl: '🍖',
  item_remote: '📺', vox_call: '📞', bg_room: '🛏️', bg_bathroom: '🛁',
  bg_kitchen: '🍳', bg_living_room: '📺',
});

// Keep stable sprite IDs while using the supplied filenames without renaming the artwork.
export const SPRITE_FILES = Object.freeze({
  bg_room: 'favorite_bg_room.png',
  bg_bathroom: 'favorite_bg_bathroom.png',
  bg_kitchen: 'favorite_bg_kitchen.png',
  bg_living_room: 'favorite_bg_living_room.png',
  item_bathtub: 'favorite_bathtub.png',
});

export const SPRITE_ANIMATIONS = Object.freeze({
  alastor_neutral: {
    frames: ['alastor_neutral.png', 'alastor_neutral_2.png'],
    frameMs: 700,
  },
  alastor_in_bath: {
    frames: ['alastor_in_bath.png', 'alastor_in_bath_2.png'],
    frameMs: 700,
  },
});

// Temporary shared animation. Remove an alias when that mood gets its own art.
export const SPRITE_ALIASES = Object.freeze({
  alastor_happy: 'alastor_neutral',
  alastor_angry: 'alastor_neutral',
  alastor_eating: 'alastor_neutral',
  alastor_sick: 'alastor_neutral',
});

export const CONFIG = Object.freeze({
  tickMs: 5000, frameMs: 100, saveMs: 1000, msPerSecond: 1000,
  characterKeyboardStep: 0.05,
  gentleHoldMs: 600,
  shakeSpeedPxPerSecond: 900, shakeDistancePx: 80, shakeSampleMaxMs: 250, shakeCooldownMs: 900,
  shakeAngerChance: 1 / 3,
  spriteSizePx: 372, swayMs: 2800, swayDegrees: 2, breatheMs: 2400, breathePixels: 2,
  angerParticleMs: 850, angerParticleDistancePx: 85, angerParticleSizePx: 24,
  angerEmojis: ['😠', '💢', '😡', '💢', '😠', '💢'],
  maxStat: 100, initialHealth: 100, initialHunger: 50,
  hungerPerTick: 1, angryThreshold: 80, starvationThreshold: 90,
  starvationDamage: 0.5, passiveDamage: 0.2,
  gentleHeal: 5, gentleMoodMs: 3000, roughDamage: 10, roughHunger: 5, roughMoodMs: 5000,
  bathSeconds: 5, bathHeal: 30, bathMoodMs: 2000,
  foodHunger: 40, foodHeal: 5, eatingMs: 3000, foodCooldownMs: 30000,
  remoteSeconds: 60, remoteMoodMs: 3000, callHeal: 10, callHunger: 10,
  storageKey: 'alastor-tamagotchi-v1', storageVersion: 1,
  defaultLanguage: 'ru', languageStorageKey: 'alastor-language',
  defaultTheme: 'light', themeStorageKey: 'alastor-theme',
  serverPort: 4183,
});

export const MOODS = Object.freeze({
  neutral: { label: { ru: 'Всё спокойно', en: 'All is well' }, sprite: 'alastor_neutral', line: { ru: 'Ну что, дорогуша. Чем займёмся?', en: 'Well, darling. What shall we do?' } },
  happy: { label: { ru: 'Доволен собой', en: 'Feeling pleased' }, sprite: 'alastor_happy', line: { ru: 'Ха! Вот это уже совсем другое дело.', en: 'Ha! Now that’s more like it.' } },
  angry: { label: { ru: 'Лучше не злить', en: 'Best not to annoy him' }, sprite: 'alastor_angry', line: { ru: 'Дорогуша, не испытывай моё терпение.', en: 'Darling, don’t test my patience.' } },
  hungry: { label: { ru: 'Пора перекусить', en: 'Time for a snack' }, sprite: 'alastor_angry', line: { ru: 'Кажется, время обеда.', en: 'I believe it’s lunchtime.' } },
  in_bath: { label: { ru: 'Принимает ванну', en: 'Taking a bath' }, sprite: 'alastor_in_bath', line: { ru: 'Только не намочи мои уши!', en: 'Just keep my ears dry!' } },
  eating: { label: { ru: 'Приятного аппетита', en: 'Enjoying his meal' }, sprite: 'alastor_eating', line: { ru: 'М-м-м. Комплименты шеф-повару.', en: 'Mmm. My compliments to the chef.' } },
  sick: { label: { ru: 'Нужна забота', en: 'Needs some care' }, sprite: 'alastor_sick', line: { ru: 'Кажется, эфир закончился…', en: 'Looks like we’re off the air…' } },
});
