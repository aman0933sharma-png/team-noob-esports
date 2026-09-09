import * as THREE from "three";

const canvasHost = document.getElementById("webgl");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070a, 0.045);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 80);
camera.position.set(0, 0.6, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
canvasHost.appendChild(renderer.domElement);

const group = new THREE.Group();
scene.add(group);

const orange = new THREE.Color(0xff6a00);
const lime = new THREE.Color(0xc8ff3d);
const cyan = new THREE.Color(0x39f3ff);
const gold = new THREE.Color(0xf5c518);

const wireMat = (color, opacity = 0.55) =>
  new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity });

const core = new THREE.Mesh(new THREE.TorusKnotGeometry(1.15, 0.28, 180, 16), wireMat(0xff6a00, 0.7));
group.add(core);
const coreInner = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), wireMat(0xc8ff3d, 0.9));
group.add(coreInner);

const crates = [];
for (let i = 0; i < 8; i++) {
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), wireMat(i % 2 ? 0x39f3ff : 0xf5c518, 0.7));
  const angle = (i / 8) * Math.PI * 2;
  box.userData = { angle, radius: 2.6 + (i % 3) * 0.35, speed: 0.25 + i * 0.03, y: (i % 2 ? 0.4 : -0.5) };
  crates.push(box);
  group.add(box);
}

const ring = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.015, 16, 120), wireMat(0xc8ff3d, 0.35));
ring.rotation.x = Math.PI / 2.4;
group.add(ring);
const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.01, 16, 160), wireMat(0xff6a00, 0.22));
ring2.rotation.x = Math.PI / 1.7;
group.add(ring2);

const COUNT = 900;
const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const palette = [orange, lime, cyan, gold, new THREE.Color(0xffffff)];
for (let i = 0; i < COUNT; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 28;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
  const c = palette[i % palette.length];
  colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false }));
scene.add(points);

const tris = [];
for (let i = 0; i < 14; i++) {
  const t = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 3), wireMat(i % 2 ? 0x39f3ff : 0xff6a00, 0.5));
  t.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
  t.userData.spin = 0.004 + Math.random() * 0.01;
  tris.push(t); scene.add(t);
}

const mouse = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const cursor = document.getElementById("cursor");
const ringEl = document.getElementById("cursorRing");
let cx = 0, cy = 0, rx = 0, ry = 0;
window.addEventListener("pointermove", (e) => { cx = e.clientX; cy = e.clientY; });
document.querySelectorAll("a, button, .player, input, textarea").forEach((el) => {
  el.addEventListener("pointerenter", () => ringEl.classList.add("hot"));
  el.addEventListener("pointerleave", () => ringEl.classList.remove("hot"));
});
document.querySelectorAll("[data-magnetic]").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.18}px)`;
  });
  el.addEventListener("pointerleave", () => { el.style.transform = ""; });
});
document.querySelectorAll(".card-3d").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.transform = `rotateX(${(0.5 - y) * 16}deg) rotateY(${(x - 0.5) * 18}deg) translateZ(18px)`;
  });
  card.addEventListener("pointerleave", () => { card.style.transform = ""; });
});
document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("mobileNav").classList.toggle("open");
});
document.querySelectorAll("#mobileNav a").forEach((a) =>
  a.addEventListener("click", () => document.getElementById("mobileNav").classList.remove("open"))
);
document.getElementById("joinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const note = document.getElementById("formNote");
  note.textContent = "Application locked in. We'll ping you on Discord if the drop fits.";
  note.style.color = "#c8ff3d";
  e.target.reset();
});

const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();
  core.rotation.x = t * 0.25; core.rotation.y = t * 0.35;
  coreInner.rotation.y = -t * 0.6; coreInner.rotation.z = t * 0.2;
  ring.rotation.z = t * 0.15; ring2.rotation.z = -t * 0.08;
  crates.forEach((c) => {
    const d = c.userData; d.angle += d.speed * 0.01;
    c.position.set(Math.cos(d.angle) * d.radius, d.y + Math.sin(t * 0.8 + d.angle) * 0.2, Math.sin(d.angle) * d.radius);
    c.rotation.x += 0.01; c.rotation.y += 0.016;
  });
  tris.forEach((tri, i) => { tri.rotation.y += tri.userData.spin; tri.position.y += Math.sin(t + i) * 0.002; });
  points.rotation.y = t * 0.02;
  const pos = pGeo.attributes.position.array;
  for (let i = 1; i < pos.length; i += 3) pos[i] += Math.sin(t * 0.4 + i) * 0.0015;
  pGeo.attributes.position.needsUpdate = true;
  camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.04;
  camera.position.y += (mouse.y * 0.8 + 0.4 - camera.position.y) * 0.04;
  camera.lookAt(0, 0, 0);
  rx += (cx - rx) * 0.18; ry += (cy - ry) * 0.18;
  if (cursor) cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
  if (ringEl) ringEl.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
