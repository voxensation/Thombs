import { CONFIG, LANGUAGES, THEMES } from './config.js';
import { loadLanguage, saveLanguage } from './i18n.js';
import { loadTheme, saveTheme } from './theme.js';
import { loadState, saveState } from './state.js';
import { createEngine } from './engine.js';
import { createRenderer } from './renderer.js';
import { bindActions } from './actions.js';
import { loadLocations } from './registry.js';

try {
  let language = loadLanguage();
  let theme = loadTheme();
  const engine = createEngine(await loadLocations(), loadState());
  const renderer = createRenderer();
  let input;
  const paint = () => {
    const view = engine.view(language);
    renderer.render(view, theme);
    input?.sync(view);
  };
  const persist = () => renderer.saved(saveState(engine.state));
  let previous = performance.now();
  // Settle elapsed time before input, so rewards never apply retroactively.
  function advanceClock() {
    const now = performance.now(); engine.advance(now - previous); previous = now;
  }
  input = bindActions(command => {
    advanceClock();
    const accepted = engine.dispatch(command);
    if (accepted) {
      paint();
      // Pointer movement can arrive many times per frame; save on drop and on the regular interval.
      if (command.type !== 'move-character') persist();
    }
    return accepted;
  }, nextLanguage => {
    if (!Object.hasOwn(LANGUAGES, nextLanguage) || language === nextLanguage) return;
    language = nextLanguage;
    saveLanguage(language);
    paint();
  }, nextTheme => {
    if (!Object.hasOwn(THEMES, nextTheme) || theme === nextTheme) return;
    theme = nextTheme;
    saveTheme(theme);
    paint();
  });
  paint(); persist();
  setInterval(() => { advanceClock(); paint(); }, CONFIG.frameMs);
  setInterval(persist, CONFIG.saveMs);
  window.addEventListener('pagehide', () => { advanceClock(); persist(); });
} catch (error) {
  // Bootstrap handles loading failures with a retry button on this same hosted URL.
  throw error;
}
