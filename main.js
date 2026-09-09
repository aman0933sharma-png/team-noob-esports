(function () {
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () { mobileNav.classList.toggle("open"); });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { mobileNav.classList.remove("open"); });
    });
  }
  const form = document.getElementById("joinForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const note = document.getElementById("formNote");
      if (note) {
        note.textContent = "Application locked in. We'll ping you on Discord if the drop fits.";
        note.style.color = "#c8ff3d";
      }
      form.reset();
    });
  }
  document.querySelectorAll(".card-3d").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.transform = "rotateX(" + ((0.5 - y) * 12) + "deg) rotateY(" + ((x - 0.5) * 14) + "deg)";
    });
    card.addEventListener("pointerleave", function () { card.style.transform = ""; });
  });
  if (typeof THREE === "undefined") return;
  const canvas = document.getElementById("webgl");
  if (!canvas) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(0, 0.4, 8);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  const group = new THREE.Group();
  scene.add(group);
  function wire(color, opacity) {
    return new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: opacity == null ? 0.6 : opacity });
  }
  const core = new THREE.Mesh(new THREE.TorusKnotGeometry(1.2, 0.28, 160, 14), wire(0xff6a00, 0.85));
  group.add(core);
  group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), wire(0xc8ff3d, 0.95)));
  const crates = [];
  for (let i = 0; i < 8; i++) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), wire(i % 2 ? 0x39f3ff : 0xf5c518, 0.75));
    box.userData = { angle: (i / 8) * Math.PI * 2, radius: 2.5 + (i % 3) * 0.35, speed: 0.25 + i * 0.03, y: i % 2 ? 0.45 : -0.4 };
    crates.push(box);
    group.add(box);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.018, 12, 100), wire(0xc8ff3d, 0.4));
  ring.rotation.x = Math.PI / 2.4;
  group.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.012, 12, 120), wire(0xff6a00, 0.28));
  ring2.rotation.x = Math.PI / 1.7;
  group.add(ring2);
  const COUNT = 700;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const palette = [new THREE.Color(0xff6a00), new THREE.Color(0xc8ff3d), new THREE.Color(0x39f3ff), new THREE.Color(0xf5c518), new THREE.Color(0xffffff)];
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 26;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    const c = palette[i % palette.length];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
  scene.add(points);
  const mouse = { x: 0, y: 0 };
  window.addEventListener("pointermove", function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();
    core.rotation.x = t * 0.25;
    core.rotation.y = t * 0.35;
    ring.rotation.z = t * 0.15;
    ring2.rotation.z = -t * 0.08;
    crates.forEach(function (c) {
      const d = c.userData;
      d.angle += d.speed * 0.01;
      c.position.set(Math.cos(d.angle) * d.radius, d.y + Math.sin(t * 0.8 + d.angle) * 0.2, Math.sin(d.angle) * d.radius);
      c.rotation.x += 0.01;
      c.rotation.y += 0.016;
    });
    points.rotation.y = t * 0.02;
    camera.position.x += (mouse.x * 1.3 - camera.position.x) * 0.04;
    camera.position.y += (mouse.y * 0.7 + 0.35 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
