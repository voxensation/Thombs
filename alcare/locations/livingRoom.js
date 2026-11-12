import { CONFIG } from '../config.js';
import { copy } from '../i18n.js';

const stealLabel = copy('Спиздить пульт Вокса', 'Steal Vox’s fucking remote');

export default {
  id: 'living_room', title: copy('Гостиная Аластора', 'Alastor’s living room'), shortTitle: copy('Гостиная', 'Lounge'), icon: '📺',
  background: 'bg_living_room', theme: 'living-room', order: 3,
  eyebrow: copy('НА ТЕРРИТОРИИ АЛАСТОРА', 'ALASTOR’S TERRITORY'), description: copy('Один пульт. Очень много неприятностей.', 'One remote. A whole lot of trouble.'),
  hint: copy('Забери пульт. Интересно, сколько времени Воксу понадобится, чтобы заметить?', 'Take the remote. How long do you think Vox will take to notice?'),
  objects: [{ id: 'remote', sprite: 'item_remote', label: stealLabel, action: 'steal-remote', position: 'bottom-right',
    view: s => ({ hidden: s.remoteStolen, caption: stealLabel }) }],
  actions: [{ id: 'steal-remote', label: stealLabel, icon: '📺', tone: 'primary',
    detail: s => s.remoteStolen ? copy(`Вокс заметит через ${s.remoteTimer} с`, `Vox will notice in ${s.remoteTimer} s`) : copy('Небольшая шалость', 'A little mischief'),
    available: s => !s.remoteStolen && !s.activity,
    effect: () => ({ remoteStolen: true, remoteTimer: CONFIG.remoteSeconds, mood: 'happy', moodTimer: CONFIG.remoteMoodMs, isHeld: null }) }],
};
