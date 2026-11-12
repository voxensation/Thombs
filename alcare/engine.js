import { CONFIG, MOODS } from './config.js';
import { createInitialState, sanitizeState } from './state.js';
import { translate, message, normalizeLanguage } from './i18n.js';

const clamp = n => Math.max(0, Math.min(CONFIG.maxStat, Math.round(n * 1000) / 1000));
const resolve = (value, state) => typeof value === 'function' ? value(state) : value;

/** Pure game model: no DOM, storage, Date, setTimeout or browser APIs. */
export function createEngine(definitions, initial = createInitialState(), { random = Math.random } = {}) {
  const locations = new Map(definitions.map(location => [location.id, location]));
  const state = sanitizeState(initial);
  if (!locations.has(state.currentLocation)) state.currentLocation = 'room';
  const canMoveCharacter = () => !state.activity && !['in_bath', 'eating'].includes(state.mood);

  function normalize() {
    state.health = clamp(state.health); state.hunger = clamp(state.hunger);
    if (!canMoveCharacter()) {
      state.isDraggingCharacter = false;
      state.characterPosition = null;
    }
    if (state.voxCallActive) state.isDraggingCharacter = false;
    if (state.health <= 0) Object.assign(state, {
      health: 0, isDead: true, mood: 'sick', activity: null, isHeld: null,
      isWashing: false, moodTimer: 0, voxCallActive: false, isDraggingCharacter: false, angerTimer: 0,
    });
    if (!state.isDraggingCharacter) Object.assign(state, { dragElapsed: 0, dragFastDistance: 0, dragWasRough: false, dragAngry: false });
  }

  function reactToMotion(motion) {
    if (!motion || !Number.isFinite(motion.distance) || !Number.isFinite(motion.elapsedMs)
      || motion.distance < 0 || motion.elapsedMs <= 0 || motion.elapsedMs > CONFIG.shakeSampleMaxMs) {
      state.dragFastDistance = 0; return;
    }
    const speed = motion.distance / motion.elapsedMs * CONFIG.msPerSecond;
    state.dragFastDistance = speed >= CONFIG.shakeSpeedPxPerSecond ? state.dragFastDistance + motion.distance : 0;
    if (state.dragFastDistance < CONFIG.shakeDistancePx) return;
    state.dragFastDistance = 0;
    // Roll once per grab, not per pointer event. Tolerated shaking is still not gentle care.
    if (!state.dragWasRough) {
      state.dragWasRough = true;
      state.dragAngry = random() < CONFIG.shakeAngerChance;
      if (state.dragAngry) {
        state.health -= CONFIG.roughDamage; state.hunger += CONFIG.roughHunger;
      }
    }
    if (!state.dragAngry) return;
    Object.assign(state, { mood: 'angry', moodTimer: CONFIG.roughMoodMs, isHeld: 'rough' });
    if (state.shakeCooldown <= 0) {
      state.angerBurst += 1; state.angerTimer = CONFIG.angerParticleMs;
      state.shakeCooldown = CONFIG.shakeCooldownMs;
    }
  }

  function tick() {
    state.tickCount += 1;
    state.hunger = Math.min(CONFIG.maxStat, state.hunger + CONFIG.hungerPerTick);
    if (state.hunger > CONFIG.angryThreshold && state.mood !== 'angry') state.mood = 'angry';
    else if (state.hunger <= CONFIG.angryThreshold && state.mood === 'angry'
      && !(state.isHeld === 'rough' && state.moodTimer > 0)) state.mood = 'neutral';
    if (state.hunger > CONFIG.starvationThreshold) state.health -= CONFIG.starvationDamage;
    else if (!state.isWashing) state.health -= CONFIG.passiveDamage;
    if (state.remoteStolen && !state.voxCallActive) {
      state.remoteTimer = Math.max(0, state.remoteTimer - CONFIG.tickMs / CONFIG.msPerSecond);
      if (state.remoteTimer <= 0) {
        state.voxCallActive = true;
        // A modal takes pointer/keyboard control away from the scene.
        state.isWashing = false;
      }
    }
    normalize();
  }

  function dispatch(command) {
    if (command.type === 'restart' && state.isDead) {
      Object.assign(state, createInitialState()); return true;
    }
    if (state.isDead) return false;
    if (command.type === 'close-call' && state.voxCallActive) {
      Object.assign(state, { voxCallActive: false, remoteStolen: false, remoteTimer: 0,
        health: state.health + CONFIG.callHeal, hunger: state.hunger - CONFIG.callHunger });
      normalize(); return true;
    }
    if (state.voxCallActive) return false;
    if (command.type === 'start-character-drag') {
      if (!canMoveCharacter() || state.isDraggingCharacter) return false;
      Object.assign(state, { isDraggingCharacter: true, dragElapsed: 0, dragFastDistance: 0, dragWasRough: false, dragAngry: false });
      return true;
    }
    if (command.type === 'end-character-drag') {
      if (!state.isDraggingCharacter) return false;
      if (!command.cancelled && !state.dragWasRough && state.dragElapsed >= CONFIG.gentleHoldMs) {
        Object.assign(state, { health: state.health + CONFIG.gentleHeal, mood: 'happy', moodTimer: CONFIG.gentleMoodMs, isHeld: 'gentle' });
      }
      state.isDraggingCharacter = false; normalize(); return true;
    }
    if (command.type === 'move-character') {
      if (!state.isDraggingCharacter || !canMoveCharacter() || !Number.isFinite(command.x) || !Number.isFinite(command.y)) return false;
      state.characterPosition = { x: Math.max(0, Math.min(1, command.x)), y: Math.max(0, Math.min(1, command.y)) };
      reactToMotion(command.motion);
      normalize();
      return true;
    }
    const location = locations.get(state.currentLocation);
    if (command.type === 'navigate') {
      if (!locations.has(command.location) || command.location === state.currentLocation) return false;
      if (state.currentLocation !== 'room' && command.location !== 'room') return false;
      Object.assign(state, location.leave?.(state) ?? {}, {
        currentLocation: command.location, characterPosition: null, isDraggingCharacter: false,
      });
      normalize(); return true;
    }
    if (command.type !== 'action') return false;
    const action = location.actions?.find(item => item.id === command.id);
    if (!action || (action.available && !action.available(state))) return false;
    Object.assign(state, action.effect(state, command.payload) ?? {});
    normalize(); return true;
  }

  function advance(ms) {
    if (!Number.isFinite(ms) || ms <= 0 || state.isDead) return;
    let remaining = ms;
    while (remaining > 0 && !state.isDead) {
      const events = definitions.map(location => location.nextEvent?.(state) ?? Infinity);
      const step = Math.min(remaining, CONFIG.tickMs - state.tickElapsed,
        state.moodTimer > 0 ? state.moodTimer : Infinity, ...events);
      // Event boundaries prevent late timers from overwriting newer actions.
      if (step <= 0) break;
      remaining -= step; state.tickElapsed += step;
      if (state.isDraggingCharacter) state.dragElapsed += step;
      state.shakeCooldown = Math.max(0, state.shakeCooldown - step);
      state.angerTimer = Math.max(0, state.angerTimer - step);
      if (state.moodTimer > 0) {
        state.moodTimer = Math.max(0, state.moodTimer - step);
        if (state.moodTimer === 0) {
          state.mood = 'neutral'; state.isHeld = null;
          if (state.activity === 'eat') state.activity = null;
        }
      }
      if (state.tickElapsed >= CONFIG.tickMs) {
        state.tickElapsed = 0; tick();
        if (state.isDead) break;
      }
      for (const location of definitions) Object.assign(state, location.elapse?.(state, step) ?? {});
      normalize();
    }
  }

  /** Presentation decisions live with the model; renderer only displays this data. */
  function view(language = CONFIG.defaultLanguage) {
    language = normalizeLanguage(language);
    const localize = value => translate(resolve(value, state), language);
    const location = locations.get(state.currentLocation);
    const blocked = state.isDead || state.voxCallActive;
    const actions = (location.actions ?? []).map(action => ({
      id: action.id, label: localize(action.label), detail: localize(action.detail),
      icon: action.icon ?? '✦', tone: action.tone ?? 'secondary',
      disabled: blocked || (action.available ? !action.available(state) : false),
    }));
    const mood = { ...MOODS[state.mood], label: localize(MOODS[state.mood].label), line: localize(MOODS[state.mood].line) };
    const characterSprite = state.isDead ? MOODS.sick.sprite
      : state.activity === 'bath' ? MOODS.in_bath.sprite
      : state.activity === 'eat' ? MOODS.eating.sprite : mood.sprite;
    const characterMotion = state.isDead ? 'still' : state.isDraggingCharacter ? 'held'
      : state.activity ?? (['neutral', 'happy'].includes(state.mood) ? 'idle' : 'alert');
    return {
      language,
      location: { ...location, title: localize(location.title),
        eyebrow: localize(location.eyebrow) || message('defaultLocationEyebrow', language), description: localize(location.description) },
      state: { ...state }, mood, actions,
      characterSprite, characterMotion,
      angerEffectActive: !state.isDead && state.angerTimer > 0,
      characterDraggable: !blocked && canMoveCharacter(),
      backDisabled: blocked || state.currentLocation === 'room',
      destinations: definitions.filter(item => item.id !== 'room').map(item => ({
        id: item.id, label: localize(item.shortTitle ?? item.title), icon: item.icon,
        active: item.id === state.currentLocation,
        disabled: blocked || state.currentLocation !== 'room',
      })),
      objects: (location.objects ?? []).map(object => {
        const presented = { ...object, disabled: actions.find(action => action.id === object.action)?.disabled ?? blocked, ...object.view?.(state) };
        return { ...presented, label: localize(presented.label), caption: localize(presented.caption) };
      }),
      bathVisible: state.activity === 'bath',
      bathProgress: state.bathTimer / CONFIG.bathSeconds * CONFIG.maxStat,
      bathLabel: message(state.isWashing ? 'bathWashing' : 'bathPaused', language, { elapsed: state.bathTimer.toFixed(1), seconds: CONFIG.bathSeconds }),
      healthLabel: `${Number(state.health.toFixed(1))}`, hungerLabel: `${Number(state.hunger.toFixed(1))}`,
      hungerWarning: state.hunger > CONFIG.angryThreshold,
      sceneHint: state.remoteStolen ? message('remoteHint', language, { seconds: state.remoteTimer }) : localize(location.hint),
    };
  }

  normalize();
  return { state, dispatch, advance, view };
}
