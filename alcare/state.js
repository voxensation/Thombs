import { CONFIG, MOODS } from './config.js';

export function createInitialState() {
  return {
    currentLocation: 'room', health: CONFIG.initialHealth, hunger: CONFIG.initialHunger,
    mood: 'neutral', isDead: false, isHeld: null, isWashing: false, bathTimer: 0,
    remoteStolen: false, remoteTimer: 0, voxCallActive: false, tickCount: 0,
    activity: null, moodTimer: 0, foodCooldown: 0, tickElapsed: 0,
    characterPosition: null, isDraggingCharacter: false,
    dragElapsed: 0, dragFastDistance: 0, dragWasRough: false, dragAngry: false,
    shakeCooldown: 0, angerBurst: 0, angerTimer: 0,
  };
}

const number = (value, fallback, max = Infinity) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : fallback;

export function sanitizeState(raw) {
  const s = createInitialState();
  if (!raw || typeof raw !== 'object') return s;
  if (typeof raw.currentLocation === 'string') s.currentLocation = raw.currentLocation;
  if (Number.isFinite(raw.characterPosition?.x) && Number.isFinite(raw.characterPosition?.y)) {
    s.characterPosition = {
      x: number(raw.characterPosition.x, 0, 1),
      y: number(raw.characterPosition.y, 0, 1),
    };
  }
  for (const key of ['health', 'hunger']) s[key] = number(raw[key], s[key], CONFIG.maxStat);
  if (Object.hasOwn(MOODS, raw.mood)) s.mood = raw.mood;
  s.isHeld = raw.isHeld === 'ear' ? 'rough' : ['gentle', 'rough'].includes(raw.isHeld) ? raw.isHeld : null;
  s.activity = ['bath', 'eat'].includes(raw.activity) ? raw.activity : null;
  s.bathTimer = number(raw.bathTimer, 0, CONFIG.bathSeconds);
  // Completion is settled immediately by the engine, so this cannot be a valid saved bath.
  if (s.bathTimer >= CONFIG.bathSeconds) s.bathTimer = 0;
  s.remoteStolen = raw.remoteStolen === true;
  s.voxCallActive = s.remoteStolen && raw.voxCallActive === true;
  s.remoteTimer = s.remoteStolen ? number(raw.remoteTimer, CONFIG.remoteSeconds, CONFIG.remoteSeconds) : 0;
  s.foodCooldown = number(raw.foodCooldown, 0, CONFIG.foodCooldownMs);
  s.moodTimer = number(raw.moodTimer, 0, Math.max(CONFIG.gentleMoodMs, CONFIG.roughMoodMs, CONFIG.bathMoodMs, CONFIG.eatingMs, CONFIG.remoteMoodMs));
  s.tickCount = Math.floor(number(raw.tickCount, 0));
  s.tickElapsed = number(raw.tickElapsed, 0, CONFIG.tickMs - 1);
  if (s.activity === 'bath' && s.currentLocation !== 'bathroom') s.activity = null;
  if (s.activity !== 'bath') s.bathTimer = 0;
  if (s.activity === 'eat' && s.moodTimer === 0) s.activity = null;
  if (!s.activity && ['in_bath', 'eating'].includes(s.mood)) s.mood = 'neutral';
  if (s.moodTimer === 0) s.isHeld = null;
  if (raw.isDead === true || s.health <= 0) {
    Object.assign(s, { health: 0, isDead: true, mood: 'sick', activity: null, isHeld: null, moodTimer: 0, voxCallActive: false });
  }
  // A page reload cannot leave a shower running without its pointer.
  s.isWashing = false;
  return s;
}

export function loadState(storage) {
  try {
    const saved = JSON.parse((storage ?? globalThis.localStorage).getItem(CONFIG.storageKey));
    return saved?.version === CONFIG.storageVersion ? sanitizeState(saved.state) : createInitialState();
  } catch { return createInitialState(); }
}

export function saveState(state, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(CONFIG.storageKey, JSON.stringify({ version: CONFIG.storageVersion, state }));
    return true;
  } catch { return false; }
}
