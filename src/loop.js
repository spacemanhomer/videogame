export function createGameLoop({ update, render }) {
  let frameId = null;

  function tick() {
    update();
    render();
    frameId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (frameId === null) tick();
    },
    stop() {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}
