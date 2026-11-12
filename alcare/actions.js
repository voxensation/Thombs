import { CONFIG } from './config.js';

/** Browser input only. Every game rule is enforced by engine.dispatch(). */
export function bindActions(dispatch, changeLanguage, changeTheme) {
  const game = document.getElementById('game');
  const scene = document.getElementById('scene');
  const character = document.getElementById('alastor');
  const confirm = document.getElementById('restart-dialog');
  let drag = null;
  let suppressClick = false;
  const shower = value => dispatch({ type: 'action', id: 'shower', payload: value });

  function stopDrag(event) {
    if (!drag || (event?.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
    const { element, pointerId, kind } = drag; drag = null;
    if (kind === 'character') dispatch({ type: 'end-character-drag', cancelled: event?.type !== 'pointerup' });
    else {
      element.style.transform = ''; element.classList.remove('dragging');
      shower(false);
    }
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
  }

  function characterArea() {
    const bounds = scene.getBoundingClientRect();
    return {
      left: bounds.left + scene.clientLeft, top: bounds.top + scene.clientTop,
      width: Math.max(1, scene.clientWidth - character.offsetWidth),
      height: Math.max(1, scene.clientHeight - character.offsetHeight),
    };
  }

  game.addEventListener('change', event => {
    if (event.target.matches('[data-theme-select]')) changeTheme(event.target.value);
  });

  game.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.language) { changeLanguage(button.dataset.language); return; }
    if (button.dataset.draggable && suppressClick && event.detail !== 0) { suppressClick = false; return; }
    if (button.id === 'back-button') { stopDrag(); dispatch({ type: 'navigate', location: 'room' }); }
    else if (button.dataset.location) { stopDrag(); dispatch({ type: 'navigate', location: button.dataset.location }); }
    else if (button.dataset.action) dispatch({ type: 'action', id: button.dataset.action });
    else if (button.id === 'close-call') dispatch({ type: 'close-call' });
    else if (button.id === 'restart') confirm.showModal();
    else if (button.id === 'cancel-restart') confirm.close();
    else if (button.id === 'confirm-restart') { confirm.close(); dispatch({ type: 'restart' }); }
  });

  function updateDrag(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.kind === 'character') {
      const area = characterArea();
      const motion = {
        distance: Math.hypot(event.clientX - drag.lastX, event.clientY - drag.lastY),
        elapsedMs: event.timeStamp - drag.lastTime,
      };
      drag.lastX = event.clientX; drag.lastY = event.clientY; drag.lastTime = event.timeStamp;
      const accepted = dispatch({ type: 'move-character',
        x: (event.clientX - drag.offsetX - area.left) / area.width,
        y: (event.clientY - drag.offsetY - area.top) / area.height,
        motion,
      });
      if (!accepted) stopDrag();
      return;
    }
    drag.element.style.transform = `translate(${event.clientX - drag.x}px, ${event.clientY - drag.y}px)`;
    const target = character.getBoundingClientRect();
    const over = event.clientX >= target.left && event.clientX <= target.right && event.clientY >= target.top && event.clientY <= target.bottom;
    if (over !== drag.over) { drag.over = over; shower(over); }
  }

  game.addEventListener('pointerdown', event => {
    const element = event.target.closest('[data-draggable]');
    if (drag || !element || element.disabled || element.getAttribute('aria-disabled') === 'true' || event.button !== 0 || event.isPrimary === false) return;
    const kind = element === character ? 'character' : 'shower';
    if (kind === 'character' && !dispatch({ type: 'start-character-drag' })) return;
    event.preventDefault();
    const bounds = element.getBoundingClientRect();
    drag = { element, kind, pointerId: event.pointerId,
      x: event.clientX, y: event.clientY, over: false,
      lastX: event.clientX, lastY: event.clientY, lastTime: event.timeStamp,
      offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top,
    };
    if (kind === 'shower') { suppressClick = true; element.classList.add('dragging'); }
    else element.focus({ preventScroll: true });
    element.setPointerCapture(event.pointerId);
    updateDrag(event);
  });
  game.addEventListener('pointermove', updateDrag);
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) game.addEventListener(event, stopDrag);
  game.addEventListener('keydown', event => {
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const direction = directions[event.key];
    if (!event.target.closest('#alastor') || !direction) return;
    stopDrag();
    if (!dispatch({ type: 'start-character-drag' })) return;
    event.preventDefault();
    const area = characterArea(); const bounds = character.getBoundingClientRect();
    dispatch({ type: 'move-character',
      x: (bounds.left - area.left) / area.width + direction[0] * CONFIG.characterKeyboardStep,
      y: (bounds.top - area.top) / area.height + direction[1] * CONFIG.characterKeyboardStep,
    });
    dispatch({ type: 'end-character-drag' });
  });
  window.addEventListener('blur', () => { stopDrag(); shower(false); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopDrag(); shower(false); } });
  document.getElementById('vox-dialog').addEventListener('cancel', event => { event.preventDefault(); dispatch({ type: 'close-call' }); });
  document.getElementById('death-dialog').addEventListener('cancel', event => event.preventDefault());
  return {
    sync(view) {
      if (!drag) return;
      const active = drag.kind === 'character'
        ? view.state.isDraggingCharacter
        : view.objects.some(object => object.id === drag.element.dataset.object && !object.disabled);
      if (!active) stopDrag();
    },
  };
}
