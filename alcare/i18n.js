import { CONFIG, LANGUAGES } from './config.js';

/** Locations keep their own copy; ordinary strings remain valid for new modules. */
export const copy = (ru, en) => ({ ru, en });
export const normalizeLanguage = language => Object.hasOwn(LANGUAGES, language) ? language : CONFIG.defaultLanguage;

export function translate(value, language = CONFIG.defaultLanguage, params = {}) {
  const template = typeof value === 'string' ? value : value?.[normalizeLanguage(language)] ?? value?.ru ?? '';
  return template.replace(/\{(\w+)\}/g, (placeholder, key) => Object.hasOwn(params, key) ? String(params[key]) : placeholder);
}

export const TEXT = Object.freeze({
  pageTitle: copy('Тамагочи Аластор · На твоей волне', 'Alastor Tamagotchi · On your wavelength'),
  pageDescription: copy('Маленький радиодемон, которому нужна твоя забота. Тамагочи Аластор — уютная браузерная игра.', 'A little Radio Demon who needs your care. Alastor Tamagotchi — a cozy browser game.'),
  gameLabel: copy('Тамагочи Аластор', 'Alastor Tamagotchi'),
  backLabel: copy('Вернуться в комнату', 'Back to the room'),
  backText: copy('В комнату', 'Back to room'),
  locationsLabel: copy('Локации', 'Locations'),
  navCaption: copy('ЗАГЛЯНЕМ В…', 'LET’S VISIT…'),
  sceneLabel: copy('Игровая сцена', 'Game scene'),
  characterLabel: copy('Аластор: перетащи мышкой, пальцем или перемести стрелками', 'Alastor: drag with a mouse or finger, or move with arrow keys'),
  characterTitle: copy('Двигай бережно — он доволен. От тряски может разозлиться.', 'Handle him gently to make him happy. Shaking may make him angry.'),
  characterName: copy('АЛАСТОР', 'ALASTOR'),
  careLabel: copy('Уход за Аластором', 'Care for Alastor'),
  health: copy('Здоровье', 'Health'),
  hunger: copy('Голод', 'Hunger'),
  careHeading: copy('НЕМНОГО ЗАБОТЫ', 'A LITTLE CARE'),
  hungerHelp: copy('Меньше голода — лучше', 'Less hunger is better'),
  washingLabel: copy('Мытьё', 'Washing'),
  languageLabel: copy('Язык', 'Language'),
  themeLabel: copy('Оформление', 'Appearance'),
  themeLight: copy('Светлая', 'Light'),
  themeRoseville: copy('Roseville', 'Roseville'),
  callEyebrow: copy('ВХОДЯЩИЙ ВЫЗОВ', 'INCOMING CALL'),
  callTitle: copy('📞 Вокс: АЛАСТОР. ГДЕ. МОЙ. ПУЛЬТ. 😡', '📞 Vox: ALASTOR. WHERE. IS. MY. REMOTE. 😡'),
  callDescription: copy('Кажется, твою маленькую шалость заметили.', 'Looks like someone noticed your little prank.'),
  returnRemote: copy('Ладно, возвращаю пульт', 'Fine, here’s your remote'),
  callReward: copy('+10 здоровья · −10 голода', '+10 health · −10 hunger'),
  deathEyebrow: copy('КОНЕЦ ЭФИРА', 'OFF THE AIR'),
  deathTitle: copy('Аластор протух 💀', 'Alastor has gone rotten 💀'),
  deathDescription: copy('Даже демонам иногда нужна забота.\nПопробуем ещё раз?', 'Even demons need a little care.\nShall we try again?'),
  restart: copy('Начать заново', 'Start again'),
  restartTitle: copy('Начать новый эфир?', 'Start a new broadcast?'),
  restartDescription: copy('Текущий прогресс будет сброшен.', 'Your current progress will be reset.'),
  confirmRestart: copy('Да, начать заново', 'Yes, start again'),
  cancel: copy('Отмена', 'Cancel'),
  saveSuccess: copy('Прогресс сохранён', 'Progress saved'),
  saveError: copy('Сохранение недоступно в этом браузере', 'Saving is unavailable in this browser'),
  bathWashing: copy('Моем ушки · {elapsed} / {seconds} с', 'Washing those ears · {elapsed} / {seconds} s'),
  bathPaused: copy('Душ на паузе · {elapsed} / {seconds} с', 'Shower paused · {elapsed} / {seconds} s'),
  remoteHint: copy('Пульт у Аластора · Вокс заметит через {seconds} с', 'Alastor has the remote · Vox will notice in {seconds} s'),
  defaultLocationEyebrow: copy('НОВОЕ МЕСТО', 'SOMEWHERE NEW'),
  openGame: copy('Открыть игру', 'Open game'),
  retry: copy('Попробовать снова', 'Try again'),
});

export const message = (key, language, params) => translate(TEXT[key] ?? key, language, params);

export function loadLanguage(storage) {
  try { return normalizeLanguage((storage ?? globalThis.localStorage).getItem(CONFIG.languageStorageKey)); }
  catch { return CONFIG.defaultLanguage; }
}

export function saveLanguage(language, storage) {
  if (!Object.hasOwn(LANGUAGES, language)) return false;
  try { (storage ?? globalThis.localStorage).setItem(CONFIG.languageStorageKey, language); return true; }
  catch { return false; }
}
