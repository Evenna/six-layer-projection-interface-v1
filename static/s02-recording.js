const buttons = Array.from(document.querySelectorAll("[data-phase]"));
const layers = Array.from(document.querySelectorAll(".projection-layer"));
const screen = document.getElementById("projectionScreen");
const world = document.getElementById("projectionWorld");
const canvas = document.getElementById("s02Canvas");
const ctx = canvas.getContext("2d");
const sourceConsole = document.querySelector(".source-console");
const outputConsole = document.querySelector(".output-console");

const phases = Array.from({ length: layers.length });

const cameraPresets = [
  { tilt: 0, roll: 0, scale: 0 },
  { tilt: 0, roll: 0, scale: 0 },
  { tilt: 0, roll: 0, scale: 0 },
  { tilt: 0, roll: 0, scale: 0 },
  { tilt: 0, roll: 0, scale: 0 },
  { tilt: 0, roll: 0, scale: 0 },
];

const state = {
  phase: 0,
  timer: null,
  width: window.innerWidth,
  height: window.innerHeight,
  particles: [],
  rays: [],
  locked: false,
  lastRevealDuration: 0,
  focusTimer: null,
  restoreTimer: null,
  view: {
    tilt: 0,
    roll: 0,
    scale: 0,
    dragging: false,
    startX: 0,
    startY: 0,
    startTilt: 0,
    startRoll: 0,
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function updateViewControls() {
  screen.style.setProperty("--view-tilt", `${state.view.tilt.toFixed(1)}deg`);
  screen.style.setProperty("--view-roll", `${state.view.roll.toFixed(1)}deg`);
  screen.style.setProperty("--view-scale", state.view.scale.toFixed(3));
}

function setViewPreset(view) {
  state.view.tilt = view.tilt;
  state.view.roll = view.roll;
  state.view.scale = view.scale;
  updateViewControls();
}

function getBridgeView(index) {
  const target = cameraPresets[index];
  return {
    tilt: target.tilt,
    roll: target.roll,
    scale: target.scale,
  };
}

function getFocusView(index) {
  const target = cameraPresets[index];
  return {
    tilt: target.tilt,
    roll: target.roll,
    scale: target.scale,
  };
}

function clearCameraTimers() {
  window.clearTimeout(state.focusTimer);
  window.clearTimeout(state.restoreTimer);
}

function wrapTextNodes(root) {
  if (!root || root.dataset.wrapped === "true") return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.classList.contains("char")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    Array.from(node.nodeValue).forEach((char) => {
      const span = document.createElement("span");
      span.className = char === " " ? "char space" : "char";
      span.textContent = char === " " ? "\u00A0" : char;
      fragment.appendChild(span);
    });
    node.replaceWith(fragment);
  });
  root.dataset.wrapped = "true";
}

function resetChars(container) {
  container.querySelectorAll(".char").forEach((char) => {
    char.classList.remove("on");
    char.style.transitionDelay = "0ms";
  });
}

function revealChars(container, baseDelay = 0, step = 18) {
  const chars = Array.from(container.querySelectorAll(".char"));
  resetChars(container);
  chars.forEach((char, index) => {
    window.setTimeout(() => {
      char.classList.add("on");
    }, baseDelay + index * step);
  });
  return baseDelay + chars.length * step + 420;
}

function setDynamicText(element, text, step = 18) {
  element.dataset.wrapped = "false";
  element.textContent = text;
  wrapTextNodes(element);
  revealChars(element, 120, step);
}

function prepareTextAnimation() {
  layers.forEach((layer) => {
    wrapTextNodes(layer.querySelector(".layer-plane"));
    resetChars(layer);
  });
  [sourceConsole, outputConsole].forEach((panel) => {
    wrapTextNodes(panel);
    resetChars(panel);
  });
}

function applyPhase(index) {
  clearCameraTimers();
  state.phase = clamp(index, 0, phases.length - 1);
  screen.dataset.camera = String(state.phase);
  screen.style.setProperty("--chain-progress", `${state.phase}`);
  world.classList.remove("focus-close");
  setViewPreset(cameraPresets[state.phase]);
  buttons.forEach((button, i) => button.classList.toggle("active", i === state.phase));
  layers.forEach((layer, i) => {
    layer.classList.toggle("active", i === state.phase);
    layer.classList.toggle("past", i < state.phase);
    layer.classList.toggle("generating", i === state.phase);
    if (i >= state.phase) resetChars(layer);
  });
  if (outputConsole && state.phase < phases.length - 1) resetChars(outputConsole);
  const duration = revealChars(layers[state.phase], 320, 10);
  if (outputConsole && state.phase === phases.length - 1) {
    revealChars(outputConsole, 900, 14);
  }
  state.lastRevealDuration = Math.max(duration, 3900);
  state.focusTimer = window.setTimeout(() => {
    world.classList.add("focus-close");
    setViewPreset(getFocusView(state.phase));
  }, 260);
  state.restoreTimer = window.setTimeout(() => {
    world.classList.remove("focus-close");
    setViewPreset(cameraPresets[state.phase]);
  }, Math.max(state.lastRevealDuration - 1350, 2200));
  window.setTimeout(() => {
    layers[state.phase]?.classList.remove("generating");
  }, state.lastRevealDuration);
}

function transitionTo(index) {
  if (state.locked) return;
  clearCameraTimers();
  state.locked = true;
  world.classList.remove("focus-close");
  world.classList.add("camera-sweep");
  world.classList.add("flowing");
  world.classList.add("diving");
  setViewPreset(getBridgeView(clamp(index, 0, phases.length - 1)));
  window.setTimeout(() => {
    world.classList.remove("camera-sweep");
    applyPhase(index);
  }, 760);
  window.setTimeout(() => {
    world.classList.remove("flowing");
    world.classList.remove("diving");
    state.locked = false;
    scheduleNext();
  }, 2300);
}

function restartTimeline() {
  window.clearTimeout(state.timer);
  scheduleNext();
}

function scheduleNext() {
  window.clearTimeout(state.timer);
  if (state.view.dragging) return;
  const watchTime = 1200;
  state.timer = window.setTimeout(() => {
    transitionTo((state.phase + 1) % phases.length);
  }, state.lastRevealDuration + watchTime);
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.floor(state.width * dpr);
  canvas.height = Math.floor(state.height * dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seedAtmosphere();
}

function seedAtmosphere() {
  const count = clamp(Math.floor((state.width * state.height) / 26000), 28, 92);
  state.particles = Array.from({ length: count }, () => ({
    x: Math.random() * state.width,
    y: Math.random() * state.height,
    vx: 0.22 + Math.random() * 0.42,
    vy: (Math.random() - 0.5) * 0.04,
    r: 0.4 + Math.random() * 1.0,
    a: 0.08 + Math.random() * 0.14,
  }));
  state.rays = Array.from({ length: 18 }, (_, i) => ({
    y: state.height * (0.18 + i * 0.037),
    phase: Math.random() * Math.PI * 2,
  }));
}

function draw(time) {
  ctx.clearRect(0, 0, state.width, state.height);
  const pulseX = state.width * (0.1 + state.phase * 0.16);
  const pulseY = state.height * (0.5 + Math.sin(time / 1800) * 0.032);
  const glow = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, state.width * 0.28);
  glow.addColorStop(0, "rgba(255,36,77,0.06)");
  glow.addColorStop(0.45, "rgba(255,255,255,0.014)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, state.width, state.height);

  state.rays.forEach((ray, index) => {
    const alpha = 0.018 + Math.sin(time / 1200 + ray.phase) * 0.008;
    ctx.beginPath();
    const y = ray.y + Math.sin(time / 1900 + index) * 8;
    ctx.moveTo(state.width * 0.08, y);
    ctx.lineTo(state.width * 0.92, y + Math.sin(time / 2600 + index) * 18);
    ctx.strokeStyle = `rgba(255,255,255,${Math.max(0.006, alpha)})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  });

  state.particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x > state.width + 12) p.x = -12;
    if (p.y < 0) p.y = state.height;
    if (p.y > state.height) p.y = 0;
    ctx.beginPath();
    ctx.rect(p.x, p.y, p.r * 3.2, Math.max(1, p.r));
    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.fill();
  });

  window.requestAnimationFrame(draw);
}

window.addEventListener("resize", resizeCanvas);

updateViewControls();
resizeCanvas();
prepareTextAnimation();
if (sourceConsole) revealChars(sourceConsole, 160, 9);
applyPhase(0);
restartTimeline();
window.requestAnimationFrame(draw);
