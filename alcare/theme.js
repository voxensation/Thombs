import { CONFIG, THEMES } from './config.js';

// Appearance is a browser preference, independent of game progress.
export function loadTheme(storage) {
  try {
    const theme = (storage ?? globalThis.localStorage).getItem(CONFIG.themeStorageKey);
    return Object.hasOwn(THEMES, theme) ? theme : CONFIG.defaultTheme;
  } catch { return CONFIG.defaultTheme; }
}

export function saveTheme(theme, storage) {
  if (!Object.hasOwn(THEMES, theme)) return false;
  try { (storage ?? globalThis.localStorage).setItem(CONFIG.themeStorageKey, theme); return true; }
  catch { return false; }
}
