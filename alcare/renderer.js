import { CONFIG, LANGUAGES, THEMES, SPRITES, SPRITE_FILES, USE_IMAGES, SPRITE_ANIMATIONS, SPRITE_ALIASES } from './config.js';
import { message } from './i18n.js';

/** The only sprite rendering entry point, including backgrounds and image fallback. */
export function renderSprite(name) {
  const node = document.createElement('div');
  node.className = 'sprite'; node.dataset.sprite = name; node.setAttribute('aria-hidden', 'true');
  const fallback = () => {
    node.classList.remove('sprite-animated', 'sprite-ready');
    // Unavailable background art uses the CSS room, without decorative emoji.
    node.textContent = name.startsWith('bg_') ? '' : SPRITES[name] ?? '✦';
  };
  if (!USE_IMAGES) { fallback(); return node; }
  const sourceName = SPRITE_ALIASES[name] ?? name;
  const animation = SPRITE_ANIMATIONS[sourceName];
  if (animation) {
    node.classList.add('sprite-animated');
    node.style.setProperty('--sprite-frame-count', animation.frames.length);
    node.style.setProperty('--sprite-cycle', `${animation.frameMs * animation.frames.length}ms`);
    const strip = document.createElement('div');
    strip.className = 'sprite-strip';
    const ready = animation.frames.map(file => {
      const frame = document.createElement('img');
      frame.src = `./assets/sprites/${file}`; frame.alt = ''; frame.draggable = false;
      strip.append(frame);
      return frame.decode();
    });
    // Start only after all frames are decoded, preventing flashes on a cold load.
    Promise.all(ready).then(() => {
      node.append(strip);
      node.classList.add('sprite-ready');
    }).catch(fallback);
    return node;
  }
  const img = document.createElement('img');
  const folder = sourceName.startsWith('bg_') ? 'backgrounds' : 'sprites';
  img.alt = ''; img.draggable = false;
  img.addEventListener('load', () => node.classList.add('sprite-ready'), { once: true });
  img.addEventListener('error', fallback, { once: true });
  img.src = `./assets/${folder}/${SPRITE_FILES[sourceName] ?? `${sourceName}.png`}`;
  node.append(img); return node;
}

const byId = id => document.getElementById(id);
const text = (id, value) => { const el = byId(id); if (el.textContent !== value) el.textContent = value; };
const syncSprite = (host, name) => {
  if (host.firstElementChild?.dataset.sprite !== name) host.replaceChildren(renderSprite(name));
};

export function createRenderer() {
  let locationId;
  let language;
  let theme;
  let saveOk = true;
  let lastAngerBurst = 0;
  const objects = new Map(); const buttons = new Map(); const destinations = new Map();
  const vox = byId('vox-dialog'); const death = byId('death-dialog');
  const effects = byId('character-effects');
  const scene = byId('scene');
  const characterStyle = byId('alastor').style;
  // Size the visible frame and its drag bounds together; preserve a margin on narrow screens.
  function fitCharacter() {
    const size = Math.max(1, Math.min(CONFIG.spriteSizePx, (scene.clientWidth - 32) / 0.75, scene.clientHeight - 92));
    scene.style.setProperty('--sprite-size', `${size}px`);
    characterStyle.setProperty('--breathe-scale', 1 + CONFIG.breathePixels / size);
  }
  fitCharacter();
  new ResizeObserver(fitCharacter).observe(scene);
  characterStyle.setProperty('--sway-duration', `${CONFIG.swayMs}ms`);
  characterStyle.setProperty('--sway-angle', `${CONFIG.swayDegrees}deg`);
  characterStyle.setProperty('--breathe-duration', `${CONFIG.breatheMs}ms`);
  effects.style.setProperty('--particle-duration', `${CONFIG.angerParticleMs}ms`);
  effects.style.setProperty('--particle-size', `${CONFIG.angerParticleSizePx}px`);
  byId('vox-sprite').append(renderSprite('vox_call'));
  for (const picker of document.querySelectorAll('.language-switch')) {
    for (const [code, name] of Object.entries(LANGUAGES)) {
      const button = document.createElement('button'); button.type = 'button';
      button.dataset.language = code; button.textContent = code.toUpperCase();
      button.lang = code; button.setAttribute('aria-label', name); button.title = name;
      picker.append(button);
    }
  }

  for (const picker of document.querySelectorAll('.theme-switch')) {
    const label = document.createElement('label');
    const caption = document.createElement('span'); caption.dataset.i18n = 'themeLabel';
    const select = document.createElement('select'); select.dataset.themeSelect = '';
    select.setAttribute('data-i18n-aria-label', 'themeLabel');
    for (const [id, appearance] of Object.entries(THEMES)) {
      const option = document.createElement('option'); option.value = id;
      option.dataset.i18n = appearance.label; select.append(option);
    }
    label.append(caption, select); picker.append(label);
  }

  function renderTheme(nextTheme) {
    if (theme === nextTheme) return;
    theme = nextTheme;
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = THEMES[theme].color;
    for (const select of document.querySelectorAll('[data-theme-select]')) select.value = theme;
  }

  function renderSaveStatus() {
    text('save-status', message(saveOk ? 'saveSuccess' : 'saveError', language));
    byId('save-status').classList.toggle('save-error', !saveOk);
  }

  function renderLanguage(nextLanguage) {
    if (language === nextLanguage) return;
    language = nextLanguage;
    document.documentElement.lang = language;
    document.title = message('pageTitle', language);
    for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = message(node.dataset.i18n, language);
    for (const attribute of ['aria-label', 'title', 'content']) {
      for (const node of document.querySelectorAll(`[data-i18n-${attribute}]`)) {
        node.setAttribute(attribute, message(node.getAttribute(`data-i18n-${attribute}`), language));
      }
    }
    for (const button of document.querySelectorAll('[data-language]')) {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    }
    renderSaveStatus();
  }

  function renderAnger(view) {
    if (!view.angerEffectActive) {
      if (effects.childElementCount) effects.replaceChildren();
    } else if (view.state.angerBurst !== lastAngerBurst) {
      const actor = byId('alastor').getBoundingClientRect();
      const scene = byId('scene').getBoundingClientRect();
      const particles = CONFIG.angerEmojis.map((emoji, index) => {
        const node = document.createElement('span'); node.className = 'anger-particle'; node.textContent = emoji;
        const angle = index / CONFIG.angerEmojis.length * Math.PI * 2;
        node.style.left = `${actor.left - scene.left + actor.width / 2}px`;
        node.style.top = `${actor.top - scene.top + actor.height / 3}px`;
        node.style.setProperty('--burst-x', `${Math.cos(angle) * CONFIG.angerParticleDistancePx}px`);
        node.style.setProperty('--burst-y', `${Math.sin(angle) * CONFIG.angerParticleDistancePx - CONFIG.angerParticleDistancePx / 2}px`);
        return node;
      });
      effects.replaceChildren(...particles);
    }
    lastAngerBurst = view.state.angerBurst;
  }

  function buildLocation(view) {
    locationId = view.location.id;
    effects.replaceChildren();
    byId('scene').dataset.theme = view.location.theme ?? 'room';
    byId('scene').style.setProperty('--background-position', view.location.backgroundPosition ?? '50% 100%');
    byId('scene').style.setProperty('--background-position-mobile', view.location.mobileBackgroundPosition ?? view.location.backgroundPosition ?? '50% 100%');
    syncSprite(byId('background'), view.location.background);
    byId('scene-objects').replaceChildren(); objects.clear();
    for (const object of view.objects) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = `scene-object ${object.position ?? 'bottom-right'}`;
      button.dataset.action = object.action; button.dataset.object = object.id;
      button.setAttribute('aria-label', object.label); button.title = object.label;
      if (object.draggable) { button.dataset.draggable = 'true'; button.classList.add('draggable'); }
      button.append(renderSprite(object.sprite));
      const caption = document.createElement('span'); caption.className = 'object-caption'; button.append(caption);
      byId('scene-objects').append(button); objects.set(object.id, button);
    }
    byId('action-buttons').replaceChildren(); buttons.clear();
    for (const action of view.actions) {
      const button = document.createElement('button'); button.type = 'button';
      button.className = `care-button ${action.tone}`; button.dataset.action = action.id;
      const icon = document.createElement('span'); icon.className = 'action-icon'; icon.textContent = action.icon; icon.setAttribute('aria-hidden', 'true');
      const labels = document.createElement('span'); labels.className = 'action-labels';
      labels.append(document.createElement('strong'), document.createElement('small'));
      const arrow = document.createElement('span'); arrow.className = 'action-arrow'; arrow.textContent = '↗';
      button.append(icon, labels, arrow); byId('action-buttons').append(button); buttons.set(action.id, button);
    }
  }

  function render(view, appearance = CONFIG.defaultTheme) {
    renderLanguage(view.language);
    renderTheme(appearance);
    if (locationId !== view.location.id) buildLocation(view);
    text('location-title', view.location.title);
    text('scene-eyebrow', view.location.eyebrow);
    text('scene-description', view.location.description);
    if (destinations.size !== view.destinations.length) {
      destinations.clear(); byId('destinations').replaceChildren();
      for (const item of view.destinations) {
        const button = document.createElement('button'); button.type = 'button'; button.dataset.location = item.id;
        button.textContent = `${item.icon}  ${item.label}`; byId('destinations').append(button); destinations.set(item.id, button);
      }
    }
    for (const item of view.destinations) {
      const button = destinations.get(item.id); button.disabled = item.disabled;
      const label = `${item.icon}  ${item.label}`;
      if (button.textContent !== label) button.textContent = label;
      button.classList.toggle('active', item.active); button.setAttribute('aria-current', item.active ? 'page' : 'false');
    }
    byId('back-button').disabled = view.backDisabled;
    text('mood-label', view.mood.label); text('speech', view.mood.line);
    byId('mood-badge').dataset.mood = view.state.mood;
    byId('alastor').dataset.activity = view.state.activity ?? '';
    byId('alastor').dataset.held = view.state.isHeld ?? '';
    const character = byId('alastor');
    character.dataset.motion = view.characterMotion;
    character.setAttribute('aria-disabled', String(!view.characterDraggable));
    character.tabIndex = view.characterDraggable ? 0 : -1;
    character.classList.toggle('dragging', view.state.isDraggingCharacter);
    character.classList.toggle('positioned', Boolean(view.state.characterPosition));
    character.style.setProperty('--character-x', view.state.characterPosition?.x ?? 0);
    character.style.setProperty('--character-y', view.state.characterPosition?.y ?? 0);
    syncSprite(byId('character-sprite'), view.characterSprite);
    renderAnger(view);
    for (const object of view.objects) {
      const node = objects.get(object.id); node.disabled = object.disabled;
      node.setAttribute('aria-label', object.label); node.title = object.label;
      node.hidden = Boolean(object.hidden); node.classList.toggle('empty', Boolean(object.empty));
      node.querySelector('.object-caption').textContent = object.caption ?? '';
    }
    for (const action of view.actions) {
      const node = buttons.get(action.id); node.disabled = action.disabled;
      node.querySelector('strong').textContent = action.label; node.querySelector('small').textContent = action.detail;
    }
    text('health-value', view.healthLabel); text('hunger-value', view.hungerLabel);
    byId('health').value = view.state.health; byId('hunger').value = view.state.hunger;
    byId('hunger').classList.toggle('warning', view.hungerWarning);
    byId('bath-progress').hidden = !view.bathVisible;
    text('bath-label', view.bathLabel); byId('bath-fill').style.width = `${view.bathProgress}%`;
    byId('bath-meter').setAttribute('aria-valuenow', String(view.bathProgress));
    byId('scene').classList.toggle('washing', view.state.isWashing);
    text('scene-hint', view.sceneHint ?? '');
    if (view.state.voxCallActive && !vox.open) vox.showModal();
    if (!view.state.voxCallActive && vox.open) vox.close();
    if (view.state.isDead && !death.open) death.showModal();
    if (!view.state.isDead && death.open) death.close();
    byId('game-content').inert = view.state.isDead || view.state.voxCallActive;
  }
  return { render, saved(ok) {
    saveOk = ok; renderSaveStatus();
  } };
}
