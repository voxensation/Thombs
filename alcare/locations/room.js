import { copy } from '../i18n.js';

export default {
  id: 'room', title: copy('Комната Аластора', 'Alastor’s room'), shortTitle: copy('Комната', 'Room'), icon: '🛏️',
  background: 'bg_room', theme: 'room', order: 0,
  eyebrow: copy('ДОМА ЛУЧШЕ', 'HOME SWEET HOME'), description: copy('Маленький демон. Большая ответственность.', 'Little demon. Big responsibility.'),
  hint: copy('Зажми Аластора и двигай бережно — ему понравится. А вот тряску он не любит.', 'Hold Alastor and move him gently — he’ll like that. Shaking, not so much.'),
  objects: [],
  actions: [],
};
