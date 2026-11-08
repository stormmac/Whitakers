// Photo-style 3D renders of the before/after rings for the Whitakers homepage.
// Open render.html#<name> through a local web server; the page sets window.done when the frame is drawn.
// Units: 1 = ring inner radius (about 8.5 mm). Rings stand upright with the head at the top (+Y) and the finger hole along Z.
import * as THREE from 'three';

const W = 1200, H = 900;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H);
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// ---------- Studio lighting: a dark room with soft boxes, like a jewellery photo set ----------
function studioEnv() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x4a4744);
  const box = (w, h, x, y, z, intensity, color = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  box(14, 6, 0, 12, 0, 4.2);            // big overhead soft box
  box(4, 10, -11, 3, 4, 3.0);           // left strip
  box(4, 10, 11, 3, 4, 2.4);            // right strip
  box(10, 3, 0, 2, 12, 2.2, 0xfff4e6);  // warm front fill
  box(10, 3, 0, 2, -12, 1.4);           // back rim
  box(30, 30, 0, -14, 0, 1.1, 0xf3ece2); // pale floor bounce
  box(3, 3, 6, 8, 8, 6); box(2, 2, -7, 7, 6, 6); box(2, 2, 3, 9, -5, 5); // small hot lights for sparkle
  const pm = new THREE.PMREMGenerator(renderer);
  return pm.fromScene(env, 0.02).texture;
}
const envMap = studioEnv();
// Gems get their own high-contrast room: black with many small bright lights, so facets flash white or go dark like real stones
function gemEnv() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x050505);
  const rnd = (() => { let x = 7; return () => ((x = (x * 16807) % 2147483647) / 2147483647); })();
  for (let i = 0; i < 70; i++) {
    const th = rnd() * Math.PI * 2, ph = Math.acos(1 - rnd() * 1.6), r = 10;
    const sz = 0.6 + rnd() * 2.2;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(2 + rnd() * 6), side: THREE.DoubleSide }));
    m.position.setFromSphericalCoords(r, ph, th); m.lookAt(0, 0, 0); env.add(m);
  }
  const top = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(3), side: THREE.DoubleSide }));
  top.position.set(0, 10, 0); top.lookAt(0, 0, 0); env.add(top);
  return new THREE.PMREMGenerator(renderer).fromScene(env, 0.0).texture;
}
const gemEnvMap = gemEnv();

// ---------- Materials ----------
const METALS = { yellow: 0xffd28a, rose: 0xffc0a6, white: 0xf4f5f7 };
const metal = (kind, rough = 0.16) => new THREE.MeshPhysicalMaterial({ color: METALS[kind], metalness: 1, roughness: rough, envMap, envMapIntensity: 1.25, clearcoat: 0.3, clearcoatRoughness: 0.1 });
const gemMat = (kind) => {
  const base = { envMap: gemEnvMap, vertexColors: true, metalness: 0, roughness: 0, flatShading: true, specularIntensity: 1, envMapIntensity: 2.2 };
  // Diamonds: mirror-like flat facets picking up the bright soft boxes and the dark room, with a little fire from iridescence
  if (kind === 'diamond') return new THREE.MeshPhysicalMaterial({ ...base, color: 0xffffff, vertexColors: true, metalness: 0.35, roughness: 0.0, emissive: 0x9aa4b0, emissiveIntensity: 0.06, iridescence: 0.5, iridescenceIOR: 1.9, iridescenceThicknessRange: [200, 600], envMapIntensity: 2.4 });
  if (kind === 'sapphire') return new THREE.MeshPhysicalMaterial({ ...base, color: 0x1c3c9a, transmission: 0.45, ior: 1.77, thickness: 0.8, attenuationColor: 0x0a2a9a, attenuationDistance: 0.3, envMapIntensity: 1.6 });
  if (kind === 'emerald') return new THREE.MeshPhysicalMaterial({ ...base, color: 0x0f9a5c, transmission: 0.6, ior: 1.58, thickness: 0.8, attenuationColor: 0x04703c, attenuationDistance: 0.35, envMapIntensity: 1.5 });
  if (kind === 'onyx') return new THREE.MeshPhysicalMaterial({ ...base, color: 0x050506, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.2 });
  if (kind === 'pearl') return new THREE.MeshPhysicalMaterial({ envMap, color: 0xf7f1ea, roughness: 0.25, sheen: 1, sheenColor: 0xffe8f0, iridescence: 0.6, iridescenceIOR: 1.3, clearcoat: 1, flatShading: false });
};

// ---------- Geometry helpers ----------
// A cut stone from a girdle outline (points in the XZ plane, table facing +Y).
function gemGeometry(outline, { crown = 0.32, pav = 0.62, table = 0.56, girdle = 0.03, culet = 0 } = {}) {
  // keep every outline running the same way round so the facets face outwards
  let area = 0;
  outline.forEach((p, i) => { const q = outline[(i + 1) % outline.length]; area += p[0] * q[1] - q[0] * p[1]; });
  if (area < 0) outline = [...outline].reverse();
  const n = outline.length, pos = [];
  const mid = (a, b, s) => [(a[0] + b[0]) / 2 * s, (a[1] + b[1]) / 2 * s];
  const tri = (a, b, c) => pos.push(...a, ...c, ...b); // wound so faces point outwards
  const v = (p, y) => [p[0], y, p[1]];
  for (let i = 0; i < n; i++) {
    const a = outline[i], b = outline[(i + 1) % n];
    const gt0 = v(a, girdle), gt1 = v(b, girdle), gb0 = v(a, -girdle), gb1 = v(b, -girdle);
    const star = v(mid(a, b, (1 + table) / 2 + 0.06), girdle + crown * 0.55);
    const t0 = v([a[0] * table, a[1] * table], girdle + crown), t1 = v([b[0] * table, b[1] * table], girdle + crown);
    const top = [0, girdle + crown, 0];
    // crown: upper girdle facets, star facets, table
    tri(gt0, gt1, star); tri(gt0, star, t0); tri(gt1, t1, star); tri(t0, star, t1); tri(top, t0, t1);
    // girdle band
    tri(gt0, gb0, gt1); tri(gt1, gb0, gb1);
    // pavilion: main facets and lower girdle facets down to the culet
    const pm = v(mid(a, b, 0.55), -girdle - pav * 0.55);
    const c0 = v([a[0] * culet, a[1] * culet], -girdle - pav), c1 = v([b[0] * culet, b[1] * culet], -girdle - pav);
    tri(gb0, pm, gb1); tri(gb0, c0, pm); tri(gb1, pm, c1); tri(pm, c0, c1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  // Each facet gets its own brightness, standing in for the light bouncing around inside a real stone
  const col = [];
  let seed = n * 97 + 13;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let f = 0; f < pos.length / 9; f++) {
    const r = rnd(), v = r < 0.38 ? 1 : r < 0.58 ? 0.86 : r < 0.78 ? 0.45 : 0.12;
    for (let k = 0; k < 3; k++) col.push(v, v, v);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
const circle = (r, n = 16, rot = 0) => Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2 + rot; return [Math.cos(t) * r, Math.sin(t) * r]; });
const ovalO = (rx, rz, n = 20) => Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return [Math.cos(t) * rx, Math.sin(t) * rz]; });
const marquiseO = (w, l, n = 24) => Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return [Math.sin(t) * w / 2 * (1 - 0.3 * Math.abs(Math.cos(t)) ** 3), Math.cos(t) * l / 2]; });
const octO = (w, l, c) => { const x = w / 2, z = l / 2; return [[-x + c, -z], [x - c, -z], [x, -z + c], [x, z - c], [x - c, z], [-x + c, z], [-x, z - c], [-x, -z + c]]; };
const trillO = (s) => [[0, -s * 0.62], [s * 0.55, s * 0.36], [-s * 0.55, s * 0.36]];

function gem(kind, outline, opts, pos = [0, 0, 0], rotY = 0, tilt = 0) {
  const m = new THREE.Mesh(gemGeometry(outline, opts), gemMat(kind));
  m.position.set(...pos); m.rotation.set(tilt, rotY, 0, 'YXZ');
  return m;
}
const roundGem = (kind, r, pos, opts = {}) => gem(kind, circle(r, 16), { ...opts }, pos);

// Shank swept around the finger: width and thickness can change around the ring (wider at the top for dress bands).
function shank(mat, { r = 1, width = 0.24, thick = 0.16, widthTop = null, thickTop = null, gap = 0, segs = 160, prof = 20 } = {}) {
  widthTop ??= width; thickTop ??= thick;
  const pos = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const a = -Math.PI / 2 + (i / segs) * Math.PI * 2;          // start at the bottom
    const up = (Math.sin(a) + 1) / 2;                           // 0 at bottom, 1 at the top
    const k = up ** 2.2;
    const w = width + (widthTop - width) * k, t = thick + (thickTop - thick) * k;
    for (let j = 0; j <= prof; j++) {
      const q = (j / prof) * Math.PI * 2;
      // rounded comfort-fit profile: superellipse
      const cx = Math.sign(Math.cos(q)) * Math.abs(Math.cos(q)) ** 0.45, cz = Math.sign(Math.sin(q)) * Math.abs(Math.sin(q)) ** 0.45;
      const rad = r + t / 2 + (t / 2) * cx;
      pos.push(Math.cos(a) * rad, Math.sin(a) * rad, (w / 2) * cz);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < prof; j++) {
    const a = i * (prof + 1) + j, b = a + prof + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}
// A prong: a tapering wire from base up to a ball tip.
function prong(mat, base, tip, r = 0.028) {
  const g = new THREE.Group();
  const a = new THREE.Vector3(...base), b = new THREE.Vector3(...tip);
  const len = a.distanceTo(b);
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r * 1.2, len, 12), mat);
  c.position.copy(a).lerp(b, 0.5); c.lookAt(b); c.rotateX(Math.PI / 2);
  const s = new THREE.Mesh(new THREE.SphereGeometry(r * 1.15, 16, 12), mat); s.position.copy(b);
  g.add(c, s); return g;
}
// Prongs around a stone sitting at y with girdle outline points (pick some).
function prongs(mat, center, pts, y, { r = 0.03, base = -0.35, over = 0.05, inset = 0.96 } = {}) {
  const g = new THREE.Group();
  for (const [x, z] of pts) g.add(prong(mat, [center[0] + x * 0.6, center[1] + base, center[2] + z * 0.6], [center[0] + x * inset, center[1] + y * 0.5 + over * 0.15, center[2] + z * inset], r));
  return g;
}
// A wall around a 2D outline (bezel / collet / plate rim).
function wall(mat, outline, { y = 0, h = 0.12, t = 0.035, bevel = 0.012 } = {}) {
  const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x * (1 + t * 2), z * (1 + t * 2) + (z >= 0 ? t : -t) * 0)));
  const outer = outline.map(([x, z]) => { const l = Math.hypot(x, z) || 1; return new THREE.Vector2(x + (x / l) * t, z + (z / l) * t); });
  const s = new THREE.Shape(outer); s.holes.push(new THREE.Path(outline.map(([x, z]) => new THREE.Vector2(x, z))));
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 24 });
  g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
  return new THREE.Mesh(g, mat);
}
// A solid plate (domed slightly) from an outline.
function plate(mat, outline, { y = 0, h = 0.06, bevel = 0.03 } = {}) {
  const s = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, z)));
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 5, curveSegments: 32 });
  g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
  return new THREE.Mesh(g, mat);
}
function beads(mat, pts, r = 0.014) {
  const g = new THREE.Group(), geo = new THREE.SphereGeometry(r, 10, 8);
  for (const p of pts) { const m = new THREE.Mesh(geo, mat); m.position.set(...p); g.add(m); }
  return g;
}
function tubeAlong(mat, points, r = 0.03, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), closed);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 120, r, 12, closed), mat);
}
const TOP = 1.16; // y of the top of a standard shank

// ---------- The pieces ----------
const PIECES = {
  // BEFORE: 1950s cluster: sapphire ringed by eight diamonds on a milgrain platter, yellow gold
  'before-cluster'() {
    const g = new THREE.Group(), m = metal('yellow');
    g.add(shank(m, { width: 0.2, thick: 0.13, widthTop: 0.3 }));
    const y = TOP + 0.05;
    g.add(plate(m, circle(0.55, 48), { y, h: 0.05 }));
    g.add(beads(m, circle(0.585, 64).map(([x, z]) => [x, y + 0.075, z]), 0.018));
    g.add(roundGem('sapphire', 0.2, [0, y + 0.2, 0], { crown: 0.08, pav: 0.18, table: 0.55 }));
    g.add(prongs(m, [0, y + 0.2, 0], circle(0.2, 6), 0.1, { base: -0.12, r: 0.022 }));
    for (const [x, z] of circle(0.38, 8, Math.PI / 8)) {
      g.add(roundGem('diamond', 0.12, [x, y + 0.16, z], { crown: 0.05, pav: 0.11 }));
      g.add(prongs(m, [x, y + 0.16, z], circle(0.12, 4, Math.PI / 4), 0.06, { base: -0.08, r: 0.016 }));
    }
    return g;
  },
  // AFTER: the sapphire with three of its diamonds in a light white-gold setting
  'sapphire'() {
    const g = new THREE.Group(), m = metal('white');
    g.add(shank(m, { width: 0.18, thick: 0.12 }));
    const y = TOP + 0.3;
    g.add(roundGem('sapphire', 0.26, [0, y, 0], { crown: 0.1, pav: 0.22 }));
    g.add(prongs(m, [0, y, 0], circle(0.26, 4, Math.PI / 4), 0.11, { base: -0.36, r: 0.03 }));
    for (const ang of [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]) {
      const x = Math.cos(ang) * 0.4, z = Math.sin(ang) * 0.4;
      g.add(roundGem('diamond', 0.14, [x, y - 0.04, z], { crown: 0.06, pav: 0.12 }));
      g.add(prongs(m, [x, y - 0.04, z], circle(0.14, 4, Math.PI / 4), 0.07, { base: -0.3, r: 0.018 }));
    }
    return g;
  },
  // BEFORE: 1920s Art Deco: long navette plate in white gold with milgrain, marquise centre, small diamonds in a line
  'before-deco'() {
    const g = new THREE.Group(), m = metal('white', 0.2);
    g.add(shank(m, { width: 0.18, thick: 0.12, widthTop: 0.26 }));
    const y = TOP + 0.03;
    const nav = marquiseO(0.62, 1.15, 48);
    g.add(plate(m, nav, { y, h: 0.06, bevel: 0.025 }));
    g.add(beads(m, nav.map(([x, z]) => [x * 0.92, y + 0.09, z * 0.92]), 0.014));
    g.add(gem('diamond', marquiseO(0.22, 0.46), { crown: 0.07, pav: 0.16 }, [0, y + 0.17, 0]));
    g.add(prongs(m, [0, y + 0.17, 0], [[0, -0.23], [0, 0.23]], 0.06, { base: -0.07, r: 0.022 }));
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const z = s * (0.3 + k * 0.08), r = 0.04 - k * 0.006;
      g.add(roundGem('diamond', r, [0, y + 0.11, z], { crown: 0.02, pav: 0.04 }));
    }
    return g;
  },
  // AFTER: the marquise on a slim rose-gold band with two small marquise side stones
  'marquise'() {
    const g = new THREE.Group(), m = metal('rose');
    g.add(shank(m, { width: 0.17, thick: 0.12 }));
    const y = TOP + 0.26;
    g.add(gem('diamond', marquiseO(0.3, 0.62), { crown: 0.09, pav: 0.2 }, [0, y, 0], Math.PI / 2));
    g.add(prongs(m, [0, y, 0], [[-0.31, 0], [0.31, 0]], 0.09, { base: -0.3, r: 0.024 }));
    for (const s of [-1, 1]) {
      g.add(gem('diamond', marquiseO(0.09, 0.2), { crown: 0.04, pav: 0.08 }, [s * 0.44, y - 0.12, 0], Math.PI / 2, 0));
      g.add(prongs(m, [s * 0.44, y - 0.12, 0], [[-0.1, 0], [0.1, 0]], 0.04, { base: -0.12, r: 0.014 }));
    }
    return g;
  },
  // BEFORE: 1970s illusion solitaire: small diamond in a petal plate on a heavy yellow band
  'before-illusion'() {
    const g = new THREE.Group(), m = metal('yellow');
    g.add(shank(m, { width: 0.28, thick: 0.18, widthTop: 0.34 }));
    const y = TOP + 0.08;
    for (const [x, z] of circle(0.22, 8)) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 16), m);
      p.scale.set(1, 0.32, 1); p.position.set(x, y, z); g.add(p);
    }
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.27, 0.06, 48), m); disc.position.set(0, y + 0.03, 0); g.add(disc);
    g.add(beads(m, circle(0.2, 32).map(([x, z]) => [x, y + 0.07, z]), 0.012));
    g.add(roundGem('diamond', 0.1, [0, y + 0.12, 0], { crown: 0.04, pav: 0.09 }));
    g.add(prongs(m, [0, y + 0.12, 0], circle(0.1, 4, Math.PI / 4), 0.05, { base: -0.06, r: 0.016 }));
    return g;
  },
  // AFTER: oval solitaire on a fine yellow-gold band
  'oval'() {
    const g = new THREE.Group(), m = metal('yellow');
    g.add(shank(m, { width: 0.17, thick: 0.12 }));
    const y = TOP + 0.3;
    const o = ovalO(0.24, 0.33, 24);
    g.add(gem('diamond', o, { crown: 0.1, pav: 0.24 }, [0, y, 0]));
    g.add(prongs(m, [0, y, 0], [[0.17, 0.23], [-0.17, 0.23], [0.17, -0.23], [-0.17, -0.23]], 0.11, { base: -0.36, r: 0.03 }));
    return g;
  },
  // BEFORE: Edwardian bar brooch with a row of old-cut diamonds
  'before-brooch'() {
    const g = new THREE.Group(), m = metal('white', 0.22);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 24), m); bar.rotation.z = Math.PI / 2; g.add(bar);
    for (const s of [-1, 1]) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), m); k.position.x = s * 1.27; g.add(k); }
    const oval = plate(m, ovalO(0.74, 0.28, 48), { y: -0.04, h: 0.05 }); g.add(oval);
    g.add(beads(m, ovalO(0.79, 0.33, 64).map(([x, z]) => [x, 0.05, z]), 0.016));
    for (let k = 0; k < 7; k++) {
      const x = -0.54 + k * 0.18, r = k === 3 ? 0.11 : 0.08;
      g.add(roundGem('diamond', r, [x, 0.1, 0], { crown: 0.035, pav: 0.07, table: 0.45 }));
    }
    for (const s of [-1, 1]) g.add(tubeAlong(m, [[s * 0.75, 0, 0.02], [s * 0.85, 0.02, -0.14], [s * 0.98, 0.03, -0.05], [s * 0.93, 0.02, 0.04]], 0.022));
    g.rotation.x = 0.85; g.position.y = 1.1;
    return g;
  },
  // AFTER: oval with a hidden halo, seen from the side, yellow gold
  'hidden-halo'() {
    const g = new THREE.Group(), m = metal('yellow');
    g.add(shank(m, { width: 0.17, thick: 0.12 }));
    const y = TOP + 0.36;
    g.add(gem('diamond', ovalO(0.24, 0.33, 24), { crown: 0.1, pav: 0.24 }, [0, y, 0]));
    g.add(prongs(m, [0, y, 0], [[0.17, 0.23], [-0.17, 0.23], [0.17, -0.23], [-0.17, -0.23]], 0.11, { base: -0.42, r: 0.028 }));
    // hidden halo under the stone
    const halo = ovalO(0.2, 0.27, 18);
    for (const [x, z] of halo) g.add(roundGem('diamond', 0.032, [x, y - 0.26, z], { crown: 0.015, pav: 0.03 }));
    g.add(tubeAlong(m, halo.map(([x, z]) => [x * 1.15, y - 0.29, z * 1.15]), 0.02, true));
    return g;
  },
  // BEFORE: wide yellow dress band: round centre in a diamond-shaped plate, six smaller diamonds
  'before-band'() {
    const g = new THREE.Group(), m = metal('yellow');
    g.add(shank(m, { width: 0.3, thick: 0.16, widthTop: 0.95, thickTop: 0.2 }));
    const y = TOP + 0.08;
    const lozenge = [[0, -0.46], [0.42, 0], [0, 0.46], [-0.42, 0]].map(([x, z]) => [z, x]);
    g.add(plate(m, lozenge, { y: y - 0.02, h: 0.04, bevel: 0.03 }));
    g.add(roundGem('diamond', 0.21, [0, y + 0.1, 0], { crown: 0.08, pav: 0.16 }));
    g.add(prongs(m, [0, y + 0.1, 0], circle(0.21, 4), 0.08, { base: -0.1, r: 0.026 }));
    for (const [x, z] of [[0.36, -0.24], [-0.36, -0.24], [0.36, 0.24], [-0.36, 0.24], [0.6, 0], [-0.6, 0]]) {
      const yy = y + 0.02 - Math.abs(x) * 0.12;
      g.add(roundGem('diamond', 0.085, [x, yy, z * 0.9], { crown: 0.035, pav: 0.06 }));
      g.add(wall(m, circle(0.085, 24), { y: yy - 0.04, h: 0.04, t: 0.02 }).translateX(x).translateZ(z * 0.9));
    }
    return g;
  },
  // AFTER: bezel-set trilogy, rose gold
  'after-trilogy'() {
    const g = new THREE.Group(), m = metal('rose');
    g.add(shank(m, { width: 0.2, thick: 0.13 }));
    const y = TOP + 0.2;
    g.add(roundGem('diamond', 0.21, [0, y + 0.03, 0], { crown: 0.08, pav: 0.16 }));
    g.add(wall(m, octO(0.47, 0.47, 0.13), { y: y - 0.06, h: 0.11, t: 0.04 }));
    for (const s of [-1, 1]) {
      g.add(roundGem('diamond', 0.13, [s * 0.37, y - 0.03, 0], { crown: 0.05, pav: 0.1 }));
      const w = wall(m, octO(0.3, 0.3, 0.08), { y: y - 0.1, h: 0.1, t: 0.035 }); w.position.x = s * 0.37; g.add(w);
    }
    return g;
  },
  // BEFORE: onyx and diamond cocktail ring, yellow gold
  'before-onyx'() {
    const g = new THREE.Group(), m = metal('yellow');
    g.add(shank(m, { width: 0.18, thick: 0.13 }));
    const y = TOP + 0.18;
    g.add(gem('onyx', octO(0.4, 0.5, 0.06), { crown: 0.07, pav: 0.14, table: 0.7, culet: 0.3 }, [0, y, 0], Math.PI / 2));
    g.add(prongs(m, [0, y, 0], [[0.25, 0.2], [-0.25, 0.2], [0.25, -0.2], [-0.25, -0.2]], 0.08, { base: -0.2, r: 0.026 }));
    for (const s of [-1, 1]) {
      const bar = plate(m, octO(0.08, 0.36, 0.02), { y: y - 0.04, h: 0.03 }); bar.position.x = s * 0.33; g.add(bar);
      for (let k = 0; k < 4; k++) g.add(roundGem('diamond', 0.03, [s * 0.33, y + 0.02, -0.13 + k * 0.087], { crown: 0.012, pav: 0.025 }));
      g.add(gem('onyx', trillO(0.3), { crown: 0.05, pav: 0.1, table: 0.6 }, [s * 0.52, y - 0.06, 0], s > 0 ? -Math.PI / 2 : Math.PI / 2));
    }
    return g;
  },
  // AFTER: the onyx east-west across a ridged triple band, rose gold
  'after-onyx-ridged'() {
    const g = new THREE.Group(), m = metal('rose');
    for (const z of [-0.12, 0, 0.12]) { const s = shank(m, { width: 0.1, thick: 0.13 }); s.position.z = z; g.add(s); }
    const y = TOP + 0.08;
    g.add(gem('onyx', octO(0.5, 0.36, 0.05), { crown: 0.07, pav: 0.12, table: 0.72, culet: 0.3 }, [0, y, 0], Math.PI / 2));
    g.add(wall(m, octO(0.38, 0.52, 0.06), { y: y - 0.08, h: 0.11, t: 0.03 }));
    return g;
  },
  // BEFORE: filigree emerald ring
  'before-filigree'() {
    const g = new THREE.Group(), m = metal('yellow');
    g.add(shank(m, { width: 0.16, thick: 0.11, widthTop: 0.5 }));
    const y = TOP + 0.05;
    // raised wire scrolls on each shoulder
    const R = 1.205;
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) for (const z0 of [-0.1, 0.1]) {
      const a0 = Math.PI / 2 + s * (0.26 + k * 0.17), pts = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40, rr = 0.055 * (1 - t * 0.75), th = t * Math.PI * 3.2 * s * Math.sign(z0);
        const a = a0 + (rr * Math.cos(th)) / R, z = z0 + rr * Math.sin(th);
        const rad = R + 0.004 * Math.sin(Math.PI * t);
        pts.push([Math.cos(a) * rad, Math.sin(a) * rad, z]);
      }
      g.add(tubeAlong(m, pts, 0.011));
    }
    g.add(gem('emerald', ovalO(0.12, 0.17, 20), { crown: 0.06, pav: 0.12 }, [0, y + 0.1, 0]));
    g.add(prongs(m, [0, y + 0.1, 0], [[0.09, 0.12], [-0.09, 0.12], [0.09, -0.12], [-0.09, -0.12]], 0.05, { base: -0.14, r: 0.018 }));
    return g;
  },
  // AFTER: the emerald east-west in a white-gold bypass ring
  'after-emerald-bypass'() {
    const g = new THREE.Group(), m = metal('white');
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const a = Math.PI / 2 + 0.24 + (i / 60) * (Math.PI * 2 - 0.48);
      const z = -0.16 * Math.cos(((i / 60) * Math.PI));
      pts.push([Math.cos(a) * 1.09, Math.sin(a) * 1.09, z]);
    }
    g.add(tubeAlong(m, pts, 0.075));
    const y = TOP + 0.02;
    g.add(gem('emerald', ovalO(0.24, 0.17, 24), { crown: 0.08, pav: 0.16 }, [0, y, 0]));
    g.add(prongs(m, [0, y, 0], [[0.22, 0.07], [0.22, -0.07], [-0.22, 0.07], [-0.22, -0.07]], 0.06, { base: -0.1, r: 0.02 }));
    return g;
  },
  // BEFORE: chunky emerald cluster ring
  'before-emerald-cluster'() {
    const g = new THREE.Group(), m = metal('yellow');
    g.add(shank(m, { width: 0.26, thick: 0.15, widthTop: 0.8, thickTop: 0.2 }));
    const y = TOP + 0.12;
    g.add(gem('emerald', ovalO(0.22, 0.3, 24), { crown: 0.09, pav: 0.18 }, [0, y + 0.08, 0]));
    g.add(prongs(m, [0, y + 0.08, 0], [[0.16, 0.2], [-0.16, 0.2], [0.16, -0.2], [-0.16, -0.2]], 0.07, { base: -0.12, r: 0.02 }));
    for (const [x, z] of ovalO(0.33, 0.42, 12)) {
      g.add(roundGem('diamond', 0.075, [x, y + 0.03, z], { crown: 0.03, pav: 0.06 }));
      g.add(prongs(m, [x, y + 0.03, z], circle(0.075, 4, Math.PI / 4), 0.035, { base: -0.06, r: 0.012 }));
    }
    return g;
  },
  // AFTER: the emerald in a bezel hanging in a gold circle pendant on a chain
  'after-emerald-circle'() {
    const g = new THREE.Group(), m = metal('yellow');
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 24, 120), m); g.add(ring);
    const bail = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 12, 32), m); bail.position.y = 0.65; bail.rotation.y = Math.PI / 2; g.add(bail);
    const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.3, 8), m); drop.position.y = 0.4; g.add(drop);
    const e = gem('emerald', ovalO(0.2, 0.26, 24), { crown: 0.07, pav: 0.14 }, [0, 0.0, 0.0], 0, Math.PI / 2);
    g.add(e);
    const bz = wall(m, ovalO(0.2, 0.26, 32), { y: -0.05, h: 0.08, t: 0.03 }); bz.rotation.x = Math.PI / 2; bz.position.set(0, 0.0, -0.03); g.add(bz);
    // chain
    const link = new THREE.TorusGeometry(0.03, 0.009, 8, 16);
    for (const s of [-1, 1]) for (let k = 0; k < 40; k++) {
      const t = k / 40, x = s * (0.08 + t * 1.6), yy = 0.78 + t * t * 1.4;
      const l = new THREE.Mesh(link, m); l.position.set(x, yy, 0); l.rotation.set(k % 2 ? Math.PI / 2 : 0, 0, s * Math.atan(2.8 * t)); l.scale.set(1.5, 1, 1); g.add(l);
    }
    g.position.y = 0.55;
    return g;
  },
};

// ---------- Scene ----------
const name = decodeURIComponent(location.hash.slice(1)) || 'before-cluster';
const scene = new THREE.Scene();
scene.environment = envMap;
// Warm studio backdrop with a soft floor shadow (painted, so it stays soft)
function backdrop() {
  const c = document.createElement('canvas'); c.width = 600; c.height = 450;
  const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 450); gr.addColorStop(0, '#fbf8f3'); gr.addColorStop(1, '#eee6da'); x.fillStyle = gr; x.fillRect(0, 0, 600, 450);
  const rg = x.createRadialGradient(300, 190, 10, 300, 190, 320); rg.addColorStop(0, 'rgba(255,255,255,.8)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = rg; x.fillRect(0, 0, 600, 450);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
scene.background = backdrop();
const piece = PIECES[name]();
const pendant = name === 'after-emerald-circle', brooch = name === 'before-brooch';
// stand the ring up and turn it to a three-quarter view
if (!pendant && !brooch) { piece.rotation.set(0.38, -0.55, 0, 'YXZ'); }
const holder = new THREE.Group(); holder.add(piece); scene.add(holder);
// contact shadow under the ring
const sc = document.createElement('canvas'); sc.width = sc.height = 256;
const sx = sc.getContext('2d'); const sg = sx.createRadialGradient(128, 128, 4, 128, 128, 128); sg.addColorStop(0, 'rgba(70,52,30,.55)'); sg.addColorStop(.5, 'rgba(70,52,30,.18)'); sg.addColorStop(1, 'rgba(70,52,30,0)'); sx.fillStyle = sg; sx.fillRect(0, 0, 256, 256);
const st = new THREE.CanvasTexture(sc);
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.6), new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = pendant ? -0.3 : brooch ? 0.85 : -1.12; scene.add(shadow);
// key light for crisp highlights
const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-3, 6, 4); scene.add(key);
scene.add(new THREE.AmbientLight(0xffffff, 0.15));

const camera = new THREE.PerspectiveCamera(24, W / H, 0.1, 100);
const box = new THREE.Box3().setFromObject(holder), center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
const dist = Math.max(size.x * 1.02, size.y * 1.2, 1.9) / (2 * Math.tan((24 * Math.PI) / 360));
camera.position.set(center.x, center.y + dist * 0.55, center.z + dist);
camera.lookAt(center.x, center.y - size.y * 0.04, center.z);
renderer.render(scene, camera);
requestAnimationFrame(() => { renderer.render(scene, camera); window.done = true; });
