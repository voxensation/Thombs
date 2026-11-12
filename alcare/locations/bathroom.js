import { CONFIG } from '../config.js';
import { copy } from '../i18n.js';

export default {
  id: 'bathroom', title: copy('Ванная', 'Bathroom'), shortTitle: copy('Ванная', 'Bath'), icon: '🛁',
  background: 'bg_bathroom', theme: 'bathroom', order: 1,
  eyebrow: copy('ПЕНА, А НЕ ПРОБЛЕМЫ', 'BUBBLES, NOT TROUBLES'), description: copy('Чистота — залог хорошего настроения.', 'A clean demon is a happy demon.'),
  hint: copy('Нажми на ванну и перетащи душ на Аластора. Можно включить душ кнопкой.', 'Tap the tub, then drag the shower over Alastor. You can also use the shower button.'),
  objects: [
    { id: 'bathtub', sprite: 'item_bathtub', label: copy('Посадить в ванну', 'Put Alastor in the bath'), action: 'bathe', position: 'bottom-center' },
    { id: 'shower', sprite: 'item_shower', label: copy('Перетащи душ на Аластора', 'Drag the shower over Alastor'), action: 'shower', draggable: true, position: 'top-right' },
  ],
  actions: [
    { id: 'bathe', label: copy('В ванну', 'Bath time'), icon: '🛁', detail: copy('+30 здоровья за мытьё', '+30 health after washing'), tone: 'primary', available: s => !s.activity,
      effect: () => ({ activity: 'bath', mood: 'in_bath', moodTimer: 0, isHeld: null, bathTimer: 0, isWashing: false }) },
    { id: 'shower', label: s => s.isWashing ? copy('Выключить душ', 'Turn off shower') : copy('Включить душ', 'Turn on shower'), icon: '🚿', detail: copy('5 секунд под душем', '5 seconds under the shower'), available: s => s.activity === 'bath',
      effect: (s, payload) => ({ isWashing: typeof payload === 'boolean' ? payload : !s.isWashing }) },
  ],
  leave: s => s.activity === 'bath' ? { activity: null, bathTimer: 0, isWashing: false, mood: 'neutral', moodTimer: 0 } : {},
  nextEvent: s => s.activity === 'bath' && s.isWashing ? (CONFIG.bathSeconds - s.bathTimer) * CONFIG.msPerSecond : Infinity,
  elapse(s, ms) {
    if (s.currentLocation !== 'bathroom' || s.activity !== 'bath' || !s.isWashing) return {};
    const bathTimer = Math.min(CONFIG.bathSeconds, s.bathTimer + ms / CONFIG.msPerSecond);
    if (bathTimer < CONFIG.bathSeconds) return { bathTimer };
    return { bathTimer: 0, isWashing: false, activity: null, health: s.health + CONFIG.bathHeal, mood: 'happy', moodTimer: CONFIG.bathMoodMs };
  },
};
