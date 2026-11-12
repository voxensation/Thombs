import { CONFIG } from '../config.js';
import { copy } from '../i18n.js';

export default {
  id: 'kitchen', title: copy('Кухня', 'Kitchen'), shortTitle: copy('Кухня', 'Kitchen'), icon: '🍳',
  background: 'bg_kitchen', theme: 'kitchen', order: 2,
  mobileBackgroundPosition: '58% 100%',
  eyebrow: copy('ПОДАНО С ЛЮБОВЬЮ', 'SERVED WITH LOVE'), description: copy('Даже радиодемона нужно кормить.', 'Even the Radio Demon needs to eat.'),
  hint: copy('Нажми на миску. Новая порция будет готова через 30 секунд.', 'Tap the bowl. The next serving will be ready in 30 seconds.'),
  objects: [{ id: 'food-bowl', sprite: 'item_food_bowl', label: copy('Покормить Аластора', 'Feed Alastor'), action: 'feed', position: 'bottom-right',
    view: s => ({ empty: s.foodCooldown > 0, caption: s.foodCooldown > 0 ? copy(`Новая порция: ${Math.ceil(s.foodCooldown / CONFIG.msPerSecond)} с`, `Next serving: ${Math.ceil(s.foodCooldown / CONFIG.msPerSecond)} s`) : copy('Обед готов!', 'Lunch is ready!') }) }],
  actions: [{ id: 'feed', label: copy('Покормить', 'Feed him'), icon: '🍖', tone: 'primary',
    detail: s => s.foodCooldown > 0 ? copy(`Готовится · ${Math.ceil(s.foodCooldown / CONFIG.msPerSecond)} с`, `Preparing · ${Math.ceil(s.foodCooldown / CONFIG.msPerSecond)} s`) : copy('−40 голода · +5 здоровья', '−40 hunger · +5 health'),
    available: s => !s.activity && s.foodCooldown <= 0,
    effect: s => ({ activity: 'eat', mood: 'eating', moodTimer: CONFIG.eatingMs, isHeld: null, hunger: s.hunger - CONFIG.foodHunger, health: s.health + CONFIG.foodHeal, foodCooldown: CONFIG.foodCooldownMs }) }],
  elapse: (s, ms) => ({ foodCooldown: Math.max(0, s.foodCooldown - ms) }),
};
