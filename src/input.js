export function createInputController(target, pointerTarget) {
  const keys = {};
  const pressed = {};
  const pointer = { x: 0, y: 0 };

  target.addEventListener("keydown", event => {
    const key = normalizeKey(event);

    if (key === "space") event.preventDefault();
    if (!keys[key]) pressed[key] = true;
    keys[key] = true;
  });

  target.addEventListener("keyup", event => {
    keys[normalizeKey(event)] = false;
  });

  pointerTarget.addEventListener("mousemove", event => {
    const rect = pointerTarget.getBoundingClientRect();
    const scaleX = pointerTarget.width / rect.width;
    const scaleY = pointerTarget.height / rect.height;

    pointer.x = (event.clientX - rect.left) * scaleX;
    pointer.y = (event.clientY - rect.top) * scaleY;
  });

  return {
    isPressed(...names) {
      return names.some(name => keys[name]);
    },
    consumePressed(name) {
      const wasPressed = Boolean(pressed[name]);
      pressed[name] = false;
      return wasPressed;
    },
    getAimPoint() {
      return { ...pointer };
    }
  };
}

function normalizeKey(event) {
  if (event.code === "Space") return "space";
  if (event.key === "Shift") return "shift";
  return event.key.toLowerCase();
}
