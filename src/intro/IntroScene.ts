import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PAISLEY_LEFT, PAISLEY_RIGHT, PAISLEY_RIGHT_HOLE } from '../data/paisley';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { drawCardCanvas, makeCardBackCanvas, makeLogoBackdropCanvas, makeMandalaCanvas, makeSpriteCanvas } from './textures';
import type { LogoBackdropStyle } from './textures';

/** Backdrop behind the SURABHI logo at the end of the intro: 'spotlight' or 'rangoli'. */
const LOGO_BACKDROP: LogoBackdropStyle = 'rangoli';

/* ------------------------------------------------------------------
   "SURABHI — the mass entry"   (all times in seconds)

   ACT 1  MASCOT
   0.0 – 1.25   the mascot plummets out of the sky, spinning (3D, with real thickness)
   1.25         GROUND SLAM: floor shockwave, dust + gold sparks, flash, camera shake
   1.25 – 2.45  hero shot: low-angle camera push, mascot swings & settles, mandala halo
   2.45 – 3.0   mascot steps aside and raises his hand — the show begins

   ACT 2  ART-FORM CARDS
   2.9 – 9.5    ten cards burst out of the mascot's hand, one by one: rocket in,
                slow-motion turn, SLAM (word + shockwave + sparks + shake), whip into orbit
   9.35 – 10.0  orbit + mascot are sucked into a vortex → EXPLOSION

   ACT 3  LOGO
   9.8 – 11.1   the two paisleys swirl in and lock
   11.3 – 12.2  SURABHI wordmark rises under the emblem
   11.1 – 11.65 logo + wordmark fade away; the rangoli backdrop stays

   ACT 4  TAGLINE (DOM, Loader.tsx)
   11.6 – 14.6  THIS TIME / BIGGER / & / BETTER! dash in one by one
   14.6 – 15.3  whole intro fades to Home (exit)
   ------------------------------------------------------------------ */
export const T = {
  drop: 0,
  land: 1.25,
  aside: 2.45,
  // the swirl starts right as the last card (Kurukshetra) settles into the orbit, no dead gap
  converge: 7.05,
  burst: 7.7,
  paisleyStart: 7.5,
  lock: 8.8,
  word: 9.0,
  logoOut: 10.4,
  tagline: 10.9,
  exit: 13.9,
  end: 14.6,
};

/** Cards in the order they appear: each event's own logo (public/cards/) + its name. */
export type CardShape = 'rect' | 'circle';
export const CARDS: { logo: string; shape: CardShape; plate?: string; fill?: boolean; backdrop?: boolean; plateRim?: string; zoom?: number; label: string; tint: string; word?: boolean }[] = [
  { logo: '/cards/cine-carnival.webp', shape: 'circle', plate: '#ffffff', label: 'Cine Carnival', tint: '#b33a32', word: true },
  { logo: '/cards/nrithya.webp', shape: 'circle', label: 'Nrithya', tint: '#c4436b', word: true },
  { logo: '/cards/vastranaut.webp', shape: 'circle', backdrop: true, plate: '#d2d1d1', plateRim: '#7b8592', label: 'Vastranaut', tint: '#6a4bd6', word: true },
  { logo: '/cards/natyaka.webp', shape: 'circle', backdrop: true, plate: '#3a0c10', plateRim: '#1a0407', label: 'Natyaka', tint: '#94652f', word: true },
  { logo: '/cards/sahitya.webp', shape: 'circle', plate: '#000000', zoom: 1.65, label: 'Sahitya', tint: '#8a2f3c', word: true },
  { logo: '/cards/raaga.webp', shape: 'circle', plate: '#ffffff', label: 'Raaga', tint: '#d9893a', word: true },
  { logo: '/cards/chitrakala.webp?v=2', shape: 'circle', fill: true, label: 'Chitrakala', tint: '#3e78c9', word: true },
  { logo: '/cards/kurukshetra.webp', shape: 'circle', fill: true, label: 'Kurukshetra', tint: '#c25226', word: true },
];
export const WORDS = CARDS.filter((c) => c.word).map((c) => c.label);
export const WORD_START = 2.95;
export const WORD_STEP = 0.5;
/** last card slot: same pace as the rest (kept separate so it can be tuned) */
export const LAST_STEP = 0.5;
const LAST_I = CARDS.length - 1;
const slotStart = (i: number) => WORD_START + i * WORD_STEP;
const slotLen = (i: number) => (i === LAST_I ? LAST_STEP : WORD_STEP);
const SLAM_AT = 0.25; // fraction of a slot where the card lands (= the slam)
const HERO = new THREE.Vector3(0, 0.4, 3.2);
const WORD_SLAMS = WORDS.map((_, k) => slotStart(k) + SLAM_AT * slotLen(k));


/* mascot artwork (cut-out) is 786×1151 */
const MASCOT_H = 3.4;
const MASCOT_W = (MASCOT_H * 786) / 1151;
const FEET_Y = -1.75;
const HAND = new THREE.Vector3(-0.92 * (MASCOT_W / 2.32), MASCOT_H * 0.44, 0.15); // his raised hand, from the feet

/* speed ramp: fast in, slow-motion hold, whip out */
function ramp(p: number) {
  if (p < SLAM_AT) return 0.45 * (1 - Math.pow(1 - p / SLAM_AT, 3));
  if (p < 0.8) return 0.45 + 0.15 * ((p - SLAM_AT) / (0.8 - SLAM_AT));
  return 0.6 + 0.4 * Math.pow((p - 0.8) / 0.2, 2);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = THREE.MathUtils.lerp;
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInCubic = (x: number) => x * x * x;
const easeInQuad = (x: number) => x * x;
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOutBack = (x: number) => {
  const c1 = 1.4;
  return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

const EMBLEM_SCALE = 5;
const CENTER = { x: 0.5, y: 0.624 }; // centre of both paisleys in normalised logo coords
const EMBLEM_Y = 0.5;
/** centre of the whole lockup (emblem top ~1.8 to wordmark bottom ~-2.2) */
const LOCKUP_Y = -0.2;
/** how far behind the logo the backdrop plane sits */
const LOGO_BACKDROP_Z = 1.2;


interface Burst {
  points: THREE.Points;
  velocities: Float32Array;
  start: number;
  life: number;
  gravity: number;
}

export class IntroScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  private baseZ = 11;
  private visW = 10;
  private visH = 7;
  private ringScale = 1;
  private cards: THREE.Mesh[] = [];
  private streak!: THREE.Mesh;
  private rings: { mesh: THREE.Mesh; at: number; pos: () => THREE.Vector3; big: number; flat?: boolean; life?: number }[] = [];
  /** read by the Loader each frame */
  word: string | null = null;
  flash = 0;
  /* mascot */
  private mascot = new THREE.Group();
  private mascotFront?: THREE.MeshBasicMaterial;
  private mascotSide?: THREE.MeshBasicMaterial;
  private mascotHalo!: THREE.Mesh;
  private mascotGlow!: THREE.Mesh;
  private mascotHaloBase = 0.83;
  private mascotAsideShrink = 0.15;
  private cardLift = 0;
  private heroDrop = 0;
  private heroPush = 0.24;
  private ringLift = 0;
  private heroCardScale = 1.35;
  private mascotScale = 1;
  private mascotSideX = 0;
  private mascotSideY = FEET_Y;
  /* emblem + wordmark */
  private emblem = new THREE.Group();
  private left!: THREE.Mesh;
  private right!: THREE.Mesh;
  private mandala!: THREE.Mesh;
  private logoShade!: THREE.Mesh;
  private wordmark!: THREE.Mesh;
  private mandalaBase = 1;
  private mandalaY = EMBLEM_Y;
  private dropStartY = FEET_Y + 7.5;
  private dust!: THREE.Points;
  private bursts: Burst[] = [];
  private flashLight = new THREE.PointLight('#ffd998', 0, 30, 1.5);
  private rimA = new THREE.PointLight('#e9a03a', 30, 30, 1.6);
  private rimB = new THREE.PointLight('#5fd3a6', 18, 30, 1.6);
  private disposables: { dispose: () => void }[] = [];
  private tmp = new THREE.Vector3();
  readonly ready: Promise<void>;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = env;
    this.disposables.push(env, pmrem);

    this.scene.add(new THREE.AmbientLight('#cfe9dc', 0.35));
    const key = new THREE.DirectionalLight('#fff1d6', 2.2);
    key.position.set(3, 4, 7);
    this.scene.add(key, this.flashLight, this.rimA, this.rimB);
    this.flashLight.position.set(0, 0.5, 2.5);

    this.buildDust();
    this.buildCards();
    this.buildFx();
    this.resize();
    this.ready = Promise.all([this.buildEmblem(), this.buildMascot()]).then(() => undefined);
    this.buildBursts();
  }

  /* ---------------- builders ---------------- */

  private track<T extends { dispose: () => void }>(o: T): T {
    this.disposables.push(o);
    return o;
  }

  private spriteTex() {
    const t = this.track(new THREE.CanvasTexture(makeSpriteCanvas()));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /** A cut-out picture given real thickness: a stack of tinted silhouettes behind the face. */
  private thick(
    tex: THREE.Texture,
    w: number,
    h: number,
    depth: number,
    layers: number,
    side: THREE.Material,
    front: THREE.Material,
    uv: [number, number, number, number] = [0, 1, 0, 1],
    pivotBottom = false,
  ) {
    void tex;
    const g = new THREE.Group();
    const geo = this.track(new THREE.PlaneGeometry(w, h));
    const a = geo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < a.count; i++) a.setXY(i, uv[0] + a.getX(i) * (uv[1] - uv[0]), uv[2] + a.getY(i) * (uv[3] - uv[2]));
    if (pivotBottom) geo.translate(0, h / 2, 0);
    for (let i = 0; i < layers; i++) {
      const m = new THREE.Mesh(geo, side);
      m.position.z = -depth + (depth * i) / layers;
      m.renderOrder = 1 + i;
      g.add(m);
    }
    const f = new THREE.Mesh(geo, front);
    f.position.z = 0.002;
    f.renderOrder = 2 + layers;
    g.add(f);
    // back face: without it the cut-out disappears while its back is turned during a spin
    const b = new THREE.Mesh(geo, front);
    b.rotation.y = Math.PI;
    b.position.z = -depth - 0.002;
    b.renderOrder = 2 + layers;
    g.add(b);
    return g;
  }

  private buildDust() {
    const n = 700;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = -Math.random() * 22 + 2;
    }
    const g = this.track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = this.track(
      new THREE.PointsMaterial({ size: 0.09, map: this.spriteTex(), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, color: '#f3d58f' }),
    );
    this.dust = new THREE.Points(g, m);
    this.scene.add(this.dust);
  }

  private buildCards() {
    const geo = this.track(new RoundedBoxGeometry(1.0, 1.5, 0.05, 4, 0.08));
    const edge = this.track(new THREE.MeshStandardMaterial({ color: '#d4ad62', metalness: 1, roughness: 0.25, envMapIntensity: 1.3 }));
    const backTex = this.track(new THREE.CanvasTexture(makeCardBackCanvas()));
    backTex.colorSpace = THREE.SRGBColorSpace;
    backTex.anisotropy = 8;
    backTex.wrapS = THREE.RepeatWrapping;
    backTex.repeat.x = -1;
    const back = this.track(new THREE.MeshPhysicalMaterial({ map: backTex, roughness: 0.35, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.15 }));
    const redraws: (() => void)[] = [];
    CARDS.forEach((card) => {
      const cv = document.createElement('canvas');
      const img = new Image();
      img.decoding = 'async';
      const draw = () => drawCardCanvas(cv, img.complete && img.naturalWidth ? img : null, card.shape, card.label, card.tint, card.plate, card.fill, card.backdrop, card.plateRim, card.zoom);
      draw();
      const tex = this.track(new THREE.CanvasTexture(cv));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      const redraw = () => {
        draw();
        tex.needsUpdate = true;
      };
      redraws.push(redraw);
      img.onload = redraw;
      img.src = card.logo;
      const face = this.track(
        new THREE.MeshPhysicalMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.0, roughness: 0.55, metalness: 0.0, clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 0.15, toneMapped: false }),
      );
      const mesh = new THREE.Mesh(geo, [edge, edge, edge, edge, face, back]);
      mesh.scale.setScalar(0.0001);
      mesh.visible = false;
      this.cards.push(mesh);
      this.scene.add(mesh);
    });
    document.fonts?.load('52px Heavitas').then(() => redraws.forEach((r) => r())).catch(() => {});
  }

  private buildFx() {
    const sprite = this.spriteTex();
    // falling streak behind the mascot
    this.streak = new THREE.Mesh(
      this.track(new THREE.PlaneGeometry(1, 1)),
      this.track(new THREE.MeshBasicMaterial({ map: sprite, color: '#ffd27a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })),
    );
    this.scene.add(this.streak);

    const ringGeo = this.track(new THREE.RingGeometry(0.965, 1, 160));
    const thick = this.track(new THREE.RingGeometry(0.9, 1, 160));
    const add = (at: number, pos: () => THREE.Vector3, big: number, flat = false, life = 0.75) => {
      const mesh = new THREE.Mesh(
        flat ? thick : ringGeo,
        this.track(new THREE.MeshBasicMaterial({ color: '#ffd98a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })),
      );
      mesh.visible = false;
      this.scene.add(mesh);
      this.rings.push({ mesh, at, pos, big, flat, life });
    };
    const feet = () => new THREE.Vector3(0, FEET_Y + 0.02, 0);
    add(T.land, feet, 1.6, true, 0.9);
    add(T.land + 0.1, feet, 1.1, true, 0.9);
    WORD_SLAMS.forEach((ts) => add(ts, () => new THREE.Vector3(HERO.x, HERO.y, 1.5), 0.42));
    add(T.burst, () => new THREE.Vector3(0, EMBLEM_Y, 0), 1.4);
    add(T.burst + 0.12, () => new THREE.Vector3(0, EMBLEM_Y, -0.5), 1.0);
    add(T.lock, () => new THREE.Vector3(0, EMBLEM_Y, -0.3), 1.8);
  }

  private paisleyGeometry(pts: [number, number][], hole?: [number, number][]) {
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    if (hole) shape.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x, y))));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.006,
      bevelSegments: 4,
      curveSegments: 6,
    });
    g.translate(-CENTER.x, -CENTER.y, -0.025);
    g.scale(EMBLEM_SCALE, EMBLEM_SCALE, EMBLEM_SCALE);
    g.computeVertexNormals();
    return this.track(g);
  }

  private async buildMascot() {
    const tex = await new THREE.TextureLoader().loadAsync('/surabhi-mascot.webp');
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    this.track(tex);
    this.mascotFront = this.track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.04, toneMapped: false }));
    this.mascotSide = this.track(new THREE.MeshBasicMaterial({ map: tex, color: '#3a3330', transparent: true, alphaTest: 0.45, toneMapped: false, side: THREE.DoubleSide }));
    const body = this.thick(tex, MASCOT_W, MASCOT_H, 0.26, 22, this.mascotSide, this.mascotFront, [0, 1, 0, 1], true);
    this.mascot.add(body);
    this.mascot.visible = false;
    this.scene.add(this.mascot);
  }

  private async buildEmblem() {
    const loader = new THREE.TextureLoader();
    const [logo, word] = await Promise.all([loader.loadAsync('/surabhi-logo-2027.jpg'), loader.loadAsync('/surabhi-wordmark-hd.webp')]);
    [logo, word].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      this.track(t);
    });

    const gold = this.track(new THREE.MeshStandardMaterial({ color: '#d4ad62', metalness: 1, roughness: 0.22, envMapIntensity: 1.4 }));
    const leftFace = this.track(new THREE.MeshStandardMaterial({ map: logo, roughness: 0.5, metalness: 0.0, emissiveMap: logo, emissive: '#ffffff', emissiveIntensity: 0.04 }));
    const rightFace = this.track(new THREE.MeshStandardMaterial({ map: logo, roughness: 0.35, metalness: 0.35, emissiveMap: logo, emissive: '#ffffff', emissiveIntensity: 0.02, envMapIntensity: 0.9 }));

    this.left = new THREE.Mesh(this.paisleyGeometry(PAISLEY_LEFT), [leftFace, gold]);
    this.right = new THREE.Mesh(this.paisleyGeometry(PAISLEY_RIGHT, PAISLEY_RIGHT_HOLE), [rightFace, gold]);
    this.left.visible = this.right.visible = false;
    this.emblem.add(this.left, this.right);
    this.scene.add(this.emblem);

    // full-screen backdrop behind the logo; geometry + texture are sized in buildLogoBackdrop() on resize
    this.mandala = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      this.track(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, blending: THREE.NormalBlending })),
    );
    this.mandala.renderOrder = -2;
    this.scene.add(this.mandala);
    this.buildLogoBackdrop();
    // soft dark pool behind the SURABHI logo so the emblem and wordmark read clearly
    const shade = document.createElement('canvas');
    shade.width = shade.height = 256;
    const sc = shade.getContext('2d')!;
    const sg = sc.createRadialGradient(128, 128, 0, 128, 128, 128);
    sg.addColorStop(0, 'rgba(2, 14, 9, 0.9)');
    sg.addColorStop(0.55, 'rgba(2, 14, 9, 0.6)');
    sg.addColorStop(1, 'rgba(2, 14, 9, 0)');
    sc.fillStyle = sg;
    sc.fillRect(0, 0, 256, 256);
    const shTex = this.track(new THREE.CanvasTexture(shade));
    this.logoShade = new THREE.Mesh(this.track(new THREE.PlaneGeometry(6.4, 6.4)), this.track(new THREE.MeshBasicMaterial({ map: shTex, transparent: true, opacity: 0, depthWrite: false })));
    this.logoShade.renderOrder = -1;
    this.scene.add(this.logoShade);
    const mGeo = this.track(new THREE.PlaneGeometry(6.4, 6.4));
    const hTex = this.track(new THREE.CanvasTexture(makeMandalaCanvas(1024, true)));
    hTex.colorSpace = THREE.SRGBColorSpace;
    this.mascotHalo = new THREE.Mesh(mGeo, this.track(new THREE.MeshBasicMaterial({ map: hTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.NormalBlending })));
    this.scene.add(this.mascotHalo);
    // soft warm glow disc behind the mascot, inside the halo
    const gTex = this.track(new THREE.CanvasTexture(makeSpriteCanvas(256)));
    gTex.colorSpace = THREE.SRGBColorSpace;
    this.mascotGlow = new THREE.Mesh(mGeo, this.track(new THREE.MeshBasicMaterial({ map: gTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })));
    this.scene.add(this.mascotGlow);

    const ratio = 595 / 173;
    this.wordmark = new THREE.Mesh(
      this.track(new THREE.PlaneGeometry(3.5, 3.5 / ratio)),
      this.track(new THREE.MeshBasicMaterial({ map: word, transparent: true, opacity: 0, color: '#f6e7c1', depthWrite: false })),
    );
    this.wordmark.position.set(0, -1.65, 0.2);
    this.scene.add(this.wordmark);
  }

  private makeBurst(n: number, start: number, speed: [number, number], life: number, flatAxis: 'z' | 'y' | null = null, color = '#ffd98a', size = 0.11, gravity = 0.4): Burst {
    const pos = new Float32Array(n * 3);
    const vel = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3().randomDirection();
      if (flatAxis === 'z') v.z *= 0.25;
      if (flatAxis === 'y') v.y = Math.abs(v.y) * 0.35;
      v.multiplyScalar(speed[0] + Math.random() * (speed[1] - speed[0]));
      vel.set([v.x, v.y, v.z], i * 3);
    }
    const g = this.track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = this.track(new THREE.PointsMaterial({ size, map: this.spriteTex(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color }));
    const points = new THREE.Points(g, m);
    this.scene.add(points);
    return { points, velocities: vel, start, life, gravity };
  }

  private buildBursts() {
    // ground slam: low dust wave + gold sparks
    const dust = this.makeBurst(420, T.land, [2, 6.5], 1.3, 'y', '#e9d7a8', 0.16, 0.6);
    dust.points.position.set(0, FEET_Y + 0.05, 0);
    const sparks = this.makeBurst(260, T.land, [3, 8], 1.1, null, '#ffcf6a', 0.09, 2.2);
    sparks.points.position.set(0, FEET_Y + 0.4, 0.3);
    this.bursts.push(dust, sparks);

    WORD_SLAMS.forEach((ts) => {
      const b = this.makeBurst(170, ts, [2.5, 6.5], 0.9, 'z');
      b.points.position.set(HERO.x, HERO.y, 2.2);
      this.bursts.push(b);
    });
    const big = this.makeBurst(900, T.burst, [2.5, 10], 1.9);
    big.points.position.set(0, EMBLEM_Y, 0);
    const lock = this.makeBurst(380, T.lock, [1.5, 5], 1.8, 'z');
    lock.points.position.set(0, EMBLEM_Y, 0);
    this.bursts.push(big, lock);
  }

  /* ---------------- frame ---------------- */

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    this.camera.aspect = aspect;
    const unitH = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    this.baseZ = Math.max(11, 4.4 / (unitH * aspect), 5.6 / unitH);
    this.visH = unitH * this.baseZ;
    this.visW = this.visH * aspect;
    this.ringScale = Math.min(1, this.visW / 8.4);

    // mascot sizing per screen
    const phone = aspect < 0.8;
    // during the cards the mascot steps DOWN (centre, below the category word) on every screen,
    // and the card deck + orbit sit higher so the word and the mascot fit underneath
    this.mascotScale = 1;
    this.mascotSideX = 0;
    const sideVisH = this.visH * ((this.baseZ + 1.2) / this.baseZ);
    // feet sit a little higher and the mascot is smaller, so he clears the 'Tap anywhere to skip' line
    this.mascotSideY = phone ? 0.1 - sideVisH * 0.5 + 1.35 : 0.1 - sideVisH * 0.5 + sideVisH * 0.095;
    this.mascotAsideShrink = phone ? 0.56 : 0.5;
    // desktop: big card a touch smaller and lower so it clears 'KL University presents';
    // the orbit of small cards rides higher, away from the word
    this.cardLift = phone ? 0.53 : 0.6;
    // phones: aim lower so the mascot + his halo sit higher on screen (about 8% of screen height)
    this.heroDrop = phone ? 0.55 : 0.4;
    // desktop: gentler push-in so the mascot's circle stays between 'KL University presents' and the bottom
    this.heroPush = phone ? 0.24 : 0.1;
    this.ringLift = phone ? 0.53 : 1.0;
    this.heroCardScale = phone ? 1.35 : 1.15;
    HERO.y = 0.4 + this.cardLift;

    // emblem halo: on desktop/landscape drop it a little so it clears 'KL University presents'
    // logo circle big enough to hold the emblem AND the SURABHI wordmark inside it
    this.mandalaBase = phone ? 1 : 1.0;
    // halo: wider than the mascot; on phones as wide as the pushed-in screen allows
    // phones: a little bigger than before (about +15%)
    this.mascotHaloBase = phone ? Math.min(0.95, (1.15 * 0.95 * 0.76 * 1.12 * this.visW) / 5.5) : 0.83;
    // centred on the whole lockup (emblem + wordmark) so it sits snugly inside the ring
    // top edge of the view at the drop's start depth (z = -3), minus a touch so the feet are just in frame
    this.dropStartY = 0.3 + (this.baseZ * 1.12 + 3) * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) - 0.25;
    this.mandalaY = LOCKUP_Y;
    this.camera.updateProjectionMatrix();
    this.buildLogoBackdrop();
  }

  /** (Re)build the logo backdrop to cover the whole screen, centred on the lockup. */
  private backdropKey = '';
  private emblemFading = false;
  private buildLogoBackdrop() {
    if (!this.mandala) return;
    const depth = (this.baseZ + LOGO_BACKDROP_Z) / this.baseZ; // the plane sits behind the logo
    const bw = this.visW * depth;
    const bh = this.visH * depth;
    const topY = bh / 2 + (0.1 - LOCKUP_Y); // camera looks at y ~0.1 at this point
    const pw = bw * 1.25;
    const ph = Math.max(bh * 1.25, (topY + 1.2) * 2);
    const key = `${pw.toFixed(2)}x${ph.toFixed(2)}`;
    if (key === this.backdropKey) return;
    this.backdropKey = key;
    this.mandala.geometry.dispose();
    this.mandala.geometry = new THREE.PlaneGeometry(pw, ph);
    const mat = this.mandala.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    const tex = new THREE.CanvasTexture(makeLogoBackdropCanvas(LOGO_BACKDROP, pw, ph, topY));
    tex.colorSpace = THREE.SRGBColorSpace;
    mat.map = tex;
    mat.needsUpdate = true;
  }

  update(t: number) {
    const exit = easeInCubic(clamp01((t - T.exit) / (T.end - T.exit)));
    const hit = (ts: number, amp: number, decay = 9) => (t >= ts ? Math.exp(-(t - ts) * decay) * amp : 0);
    const flashAt = (ts: number, amp: number, w = 0.07) => Math.exp(-Math.pow((t - ts) / w, 2)) * amp;

    /* ---------- camera: shake + flash ---------- */
    let shake = hit(T.land, 2.0, 5) + hit(T.burst, 1.7, 6) + hit(T.lock, 1.3, 7);
    let flashSum = flashAt(T.burst, 0.9, 0.12) + flashAt(T.lock, 0.7, 0.12);
    WORD_SLAMS.forEach((ts) => {
      shake += hit(ts, 0.75);
      flashSum += flashAt(ts, 0.12);
    });
    this.flash = Math.min(1, flashSum);
    const sx = (Math.sin(t * 97) + Math.sin(t * 61.3)) * 0.06 * shake;
    const sy = (Math.cos(t * 83) + Math.sin(t * 47.7)) * 0.06 * shake;

    // act-1 hero shot: low angle push-in after the landing, then back out for the cards
    const push = clamp01((t - T.land) / 1.0);
    const back = clamp01((t - T.aside) / 0.6);
    const heroK = easeOutCubic(push) * (1 - easeInOutCubic(back));
    const intro = 1 - easeOutCubic(clamp01((t - 0) / T.land)); // starts a little further away
    const camZ = this.baseZ * (1 + intro * 0.12 - heroK * this.heroPush) * 1 - shake * 0.35;
    const camY = 0.15 + Math.cos(t * 0.3) * 0.15 * (1 - heroK) - heroK * 1.1 + sy;
    this.camera.position.set(Math.sin(t * 0.35) * 0.35 * (1 - heroK) + sx, camY, camZ);
    // desktop: aim a bit lower during the mascot's act so he and his halo sit higher on screen
    const heroDrop = this.heroDrop * (1 - easeInOutCubic(back));
    const lookY = lerp(0.1, FEET_Y + MASCOT_H * this.mascotScale * 0.55, heroK) - heroDrop;
    this.camera.lookAt(sx * 0.5, lookY + sy * 0.5, 0);
    this.camera.rotation.z += sx * 0.04;

    /* ---------- ambience ---------- */
    const dp = this.dust.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < dp.count; i++) {
      let y = dp.getY(i) + 0.006;
      if (y > 11) y = -11;
      dp.setY(i, y);
    }
    dp.needsUpdate = true;
    this.dust.rotation.y = t * 0.02;
    this.rimA.position.set(Math.cos(t * 0.6) * 6, 2.5, Math.sin(t * 0.6) * 4 - 1);
    this.rimB.position.set(Math.cos(t * 0.6 + Math.PI) * 6, -2, Math.sin(t * 0.6 + Math.PI) * 4 - 1);

    /* ---------- ACT 1: mascot ---------- */
    const conv = easeInCubic(clamp01((t - T.converge) / (T.burst - T.converge)));
    const handWorld = new THREE.Vector3();
    {
      const m = this.mascot;
      const ms = this.mascotScale;
      const showing = t >= T.drop && t < T.burst + 0.02 && !!this.mascotFront;
      m.visible = showing;
      const streakMat = this.streak.material as THREE.MeshBasicMaterial;
      streakMat.opacity = 0;
      if (showing) {
        let x = 0;
        let y = FEET_Y;
        let z = 0;
        let ry = 0;
        let rz = 0;
        let sxS = 1;
        let syS = 1;
        if (t < T.land) {
          // the drop: gravity fall + spin, stretched by speed
          const q = easeInQuad(clamp01((t - T.drop) / (T.land - T.drop)));
          // starts with his feet right at the top edge, so he's on screen from the first frame
          y = lerp(this.dropStartY, FEET_Y, q);
          z = lerp(-3, 0, q);
          ry = (1 - q) * Math.PI * 3;
          sxS = 0.9;
          syS = 1.12;
          streakMat.opacity = 0; // no spotlight behind the falling mascot
          this.streak.position.set(0, y + MASCOT_H * ms * 0.9, z - 0.4);
          this.streak.scale.set(1.4 * ms, 5.5 * ms * q + 0.01, 1);
        } else {
          // landing squash & stretch, then a heroic sway
          const a = t - T.land;
          const squash = Math.exp(-a * 7) * Math.cos(a * 22);
          sxS = 1 + 0.16 * squash;
          syS = 1 - 0.2 * squash;
          ry = Math.sin(a * 2.1) * 0.42 * Math.exp(-a * 0.9) + Math.sin(t * 1.3) * 0.06;
          y = FEET_Y + Math.max(0, Math.sin(a * 3.2)) * 0.04 * Math.exp(-a);
          // step aside for the cards
          const s = easeInOutCubic(clamp01((t - T.aside) / 0.55));
          x = lerp(0, this.mascotSideX, s);
          y = lerp(y, this.mascotSideY, s);
          z = lerp(0, -1.2, s);
          ry = lerp(ry, 0, s); // once he's down at the bottom he stands still, facing front
          sxS *= 1 - this.mascotAsideShrink * s;
          syS *= 1 - this.mascotAsideShrink * s;
          // sucked into the vortex
          if (conv > 0) {
            x = lerp(x, 0, conv);
            y = lerp(y, 0.3 - MASCOT_H * ms * 0.5 * (1 - conv), conv);
            z = lerp(z, -2, conv);
            ry += conv * conv * 14;
            sxS *= 1 - conv;
            syS *= 1 - conv;
          }
        }
        m.position.set(x, y, z);
        m.rotation.set(0, ry, rz);
        m.scale.set(ms * Math.max(0.0001, sxS), ms * Math.max(0.0001, syS), ms);
        m.updateMatrixWorld();
        handWorld.copy(HAND).applyMatrix4(m.matrixWorld);
      }

      // mandala halo behind the mascot after the landing
      const halo = clamp01((t - T.land) / 0.6) * (1 - clamp01((t - T.aside) / 0.5));
      const hm = this.mascotHalo?.material as THREE.MeshBasicMaterial | undefined;
      if (hm && this.mascotHalo) {
        hm.opacity = halo * 0.85;
        this.mascotHalo.position.set(0, FEET_Y + MASCOT_H * ms * 0.5, -1.4);
        // halo a good margin wider than the mascot, but its top stays clear of 'KL University presents'
        this.mascotHalo.scale.setScalar((0.55 + easeOutBack(clamp01((t - T.land) / 0.8)) * 0.45) * ms * this.mascotHaloBase);
        this.mascotHalo.rotation.z = -t * 0.15;
        this.mascotHalo.visible = halo > 0.001;
        if (this.mascotGlow) {
          (this.mascotGlow.material as THREE.MeshBasicMaterial).opacity = 0; // no light behind the mascot
          this.mascotGlow.position.set(0, FEET_Y + MASCOT_H * ms * 0.5, -1.45);
          this.mascotGlow.scale.copy(this.mascotHalo.scale).multiplyScalar(0.8);
          this.mascotGlow.visible = halo > 0.001;
        }
      }
    }

    /* ---------- ACT 2: cards out of the mascot's hand ---------- */
    {
      const n = this.cards.length;
      const k = this.ringScale;
      const ringAt = (slot: number, out: THREE.Vector3) => {
        const ang = (slot / n) * Math.PI * 2 + t * 0.32 + conv * conv * 9;
        const rx = 4.6 * (1 - conv);
        const ry = 1.35 * (1 - conv);
        out.set(Math.cos(ang) * rx * k, lerp(0.55 + this.ringLift, 0.3, conv) + Math.sin(ang) * ry * k, lerp(-4.2, 0, conv) + Math.sin(ang) * 1.4 * (1 - conv));
        return ang;
      };
      const ring = new THREE.Vector3();
      const from = new THREE.Vector3();
      this.word = null;
      this.cards.forEach((m, i) => {
        const s0 = slotStart(i);
        const p = (t - s0) / slotLen(i);
        if (t > T.burst + 0.05 || p < 0) {
          m.visible = false;
          return;
        }
        m.visible = true;
        const ang = ringAt(i, ring);
        const ringRot = (r: THREE.Euler) => r.set(Math.sin(t * 0.7 + i) * 0.2, Math.sin(ang) * 0.7 + conv * 6, Math.cos(ang) * 0.12);
        const ringScale = 0.72 * Math.sqrt(k) * (1 - conv * 0.85);
        if (p >= 1) {
          m.position.copy(ring);
          ringRot(m.rotation);
          m.scale.setScalar(ringScale);
          return;
        }
        const r = ramp(p);
        const side = i % 2 ? 1 : -1;
        const hs = this.heroCardScale;
        if (r < 0.45) {
          // bursts out of his hand, spinning
          const q = easeOutCubic(r / 0.45);
          from.copy(handWorld.lengthSq() > 0 ? handWorld : this.tmp.set(0, 0, -2));
          m.position.lerpVectors(from, HERO, q);
          m.position.y += Math.sin(q * Math.PI) * 0.9;
          m.rotation.set((1 - q) * 1.2, -side * 0.55 + (1 - q) * Math.PI * 4 * side, (1 - q) * side * 0.9);
          m.scale.setScalar(lerp(0.12, hs, q));
        } else if (r < 0.6) {
          const q = (r - 0.45) / 0.15;
          m.position.set(HERO.x, HERO.y + q * 0.06, HERO.z + q * 0.35);
          m.rotation.set(-0.06 + q * 0.06, -side * 0.55 * (1 - q) + side * 0.18 * q, Math.sin(q * Math.PI) * 0.05 * side);
          m.scale.setScalar(hs * (1 + 0.04 * q));
          this.word = CARDS[i].label;
        } else {
          const q = easeInCubic((r - 0.6) / 0.4);
          from.set(HERO.x, HERO.y + 0.06, HERO.z + 0.35);
          m.position.lerpVectors(from, ring, q);
          ringRot(m.rotation);
          m.rotation.y = lerp(side * 0.18, m.rotation.y + side * Math.PI * 2, q);
          m.scale.setScalar(lerp(hs * 1.04, ringScale, q));
          if (q < 0.25) this.word = CARDS[i].label;
        }
      });
    }

    /* ---------- shockwave rings ---------- */
    this.rings.forEach(({ mesh, at, pos, big, flat, life = 0.75 }) => {
      const dt = t - at;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (dt < 0 || dt > life) {
        mat.opacity = 0;
        mesh.visible = false;
        return;
      }
      mesh.visible = true;
      const q = easeOutCubic(dt / life);
      mesh.position.copy(pos());
      if (flat) mesh.rotation.set(-Math.PI / 2, 0, 0);
      else mesh.lookAt(this.camera.position);
      mesh.scale.setScalar((0.6 + q * 5.5) * big * (flat ? this.mascotScale : 1));
      mat.opacity = Math.pow(1 - q, 1.5) * (flat ? 0.85 : 0.6);
    });

    /* ---------- particle bursts ---------- */
    this.bursts.forEach((b) => {
      const dt = t - b.start;
      const mat = b.points.material as THREE.PointsMaterial;
      if (dt < 0 || dt > b.life) {
        mat.opacity = 0;
        return;
      }
      const f = (1 - Math.exp(-dt * 2.4)) * 1.1;
      const p = b.points.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        p.setXYZ(i, b.velocities[i * 3] * f, b.velocities[i * 3 + 1] * f - dt * dt * b.gravity, b.velocities[i * 3 + 2] * f);
      }
      p.needsUpdate = true;
      mat.opacity = Math.pow(1 - dt / b.life, 1.5);
    });

    const fl = Math.max(flashAt(T.burst, 1, 0.12), flashAt(T.lock, 1, 0.15));
    this.flashLight.intensity = fl * 160;

    /* ---------- ACT 3: emblem locks, wordmark rises ---------- */
    if (this.left && this.right) {
      const s = easeInOutCubic(clamp01((t - T.paisleyStart) / (T.lock - T.paisleyStart)));
      const vis = t > T.paisleyStart;
      this.left.visible = this.right.visible = vis;
      const ang = (1 - s) * Math.PI * 1.6;
      const r = (1 - s) * 5.2 * Math.max(0.7, this.ringScale);
      const ox = Math.cos(ang) * r;
      const oy = Math.sin(ang) * r * 0.55;
      const z = -(1 - s) * 4;
      this.left.position.set(-ox, -oy, z);
      this.right.position.set(ox, oy, z);
      this.left.rotation.set(0, -(1 - s) * Math.PI * 2, (1 - s) * 0.9);
      this.right.rotation.set(0, (1 - s) * Math.PI * 2, -(1 - s) * 0.9);
      const sc = 0.35 + 0.65 * s;
      this.left.scale.setScalar(sc);
      this.right.scale.setScalar(sc);

      const after = Math.max(0, t - T.lock);
      const thud = after > 0 ? 1 + Math.sin((Math.min(after, 0.35) / 0.35) * Math.PI) * 0.05 : 1;
      // ACT 3 end: the logo shrinks a touch and fades; the backdrop stays for the tagline
      const out = easeInCubic(clamp01((t - T.logoOut) / (T.tagline - T.logoOut)));
      this.emblem.position.set(0, EMBLEM_Y, 0);
      this.emblem.scale.setScalar(thud * (1 - out * 0.18));
      if (out > 0 && !this.emblemFading) {
        this.emblemFading = true;
        [this.left, this.right].forEach((m) => (m.material as THREE.Material[]).forEach((mat) => { mat.transparent = true; mat.needsUpdate = true; }));
      }
      [this.left, this.right].forEach((m) => (m.material as THREE.Material[]).forEach((mat) => { mat.opacity = 1 - out; }));
      if (out >= 1) this.left.visible = this.right.visible = false;
      // once the two paisleys lock, the logo stays still (no left/right sway)
      this.emblem.rotation.y = 0;
      this.emblem.rotation.x = 0;

      const halo = clamp01((t - (T.lock - 0.2)) / 0.9);
      const mm = this.mandala.material as THREE.MeshBasicMaterial;
      mm.opacity = halo * (1 - exit);
      // still, full-screen backdrop centred on the lockup (no spin, no scaling, so it never drifts off-centre)
      this.mandala.position.set(0, this.mandalaY, -LOGO_BACKDROP_Z);
      this.mandala.rotation.z = 0;
      this.mandala.scale.setScalar(1);
      (this.logoShade.material as THREE.MeshBasicMaterial).opacity = 0;
      this.logoShade.position.set(0, this.mandalaY, -1.25);
      this.logoShade.scale.setScalar(this.mandalaBase * 0.95);
      this.logoShade.visible = halo > 0.001;

      const w = easeOutCubic(clamp01((t - T.word) / 0.9));
      (this.wordmark.material as THREE.MeshBasicMaterial).opacity = w * (1 - out);
      this.wordmark.position.y = -1.95 + w * 0.3;
      this.wordmark.scale.setScalar(0.92 + w * 0.08);
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}