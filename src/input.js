export function createInputController(target) {
  const keys = {};

  target.addEventListener("keydown", event => {
    keys[event.key.toLowerCase()] = true;
  });

  target.addEventListener("keyup", event => {
    keys[event.key.toLowerCase()] = false;
  });

  return {
    isPressed(...names) {
      return names.some(name => keys[name]);
    }
  };
}
