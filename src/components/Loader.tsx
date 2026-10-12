import { useEffect, useRef, useState } from 'react';
import type { IntroScene as IntroSceneType } from '../intro/IntroScene';
import { whenPageVisible } from '../introSeen';



/* Cinematic 3D preloader: mascot drop + ground slam, art-form cards from his hand, movie-title SURABHI.
   Real-time WebGL: hero-entry cards in slow motion with slams → gold burst → the two logo
   paisleys swirl and lock → wordmark → camera pushes through.
   Falls back to a simple fade if WebGL is unavailable. */


/* seconds after T.tagline at which each line dashes in: THIS TIME, BIGGER, &, BETTER! */
const TAGLINE_AT = [0, 0.75, 1.25, 1.7];
/* each word hits the screen this long after it starts (matches tlSlam's impact frame) */
const TAGLINE_HIT = 0.43;

export default function Loader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let disposed = false;
    let scene: IntroSceneType | null = null;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      document.body.style.overflow = '';
      onDone();
    };

    const run = async () => {
      let WORDS_LIST: string[] = [];
      let T = { exit: 3.0, end: 3.6, lock: 99, burst: 99, converge: 99, tagline: 99 };
      try {
        const mod = await import('../intro/IntroScene');
        if (disposed || !canvasRef.current) return;
        scene = new mod.IntroScene(canvasRef.current);
        T = mod.T;
        WORDS_LIST = mod.WORDS;
        // wait for the logo textures, but never longer than 2.5 s
        await Promise.race([scene.ready, new Promise((r) => setTimeout(r, 2500))]);
      } catch {
        setFallback(true);
        scene = null;
      }
      if (disposed) return;

      const onResize = () => scene?.resize();
      window.addEventListener('resize', onResize);

      // Dev helper: ?introT=4.2 freezes the intro at that second (for design review)
      const freeze = import.meta.env.DEV || new URLSearchParams(location.search).has('introT') ? Number(new URLSearchParams(location.search).get('introT') ?? NaN) : NaN;
      // Don't start the clock until the page is truly on screen. Chrome prerenders a URL
      // while it's typed in the address bar, and background tabs pause; starting earlier
      // made the intro open half-way through (at the cards).
      await whenPageVisible();
      if (disposed) return;
      // warm up: draw frame 0 once so shader compilation doesn't eat the first seconds
      scene?.update(0);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      if (disposed) return;

      // 'KL University presents' starts on the same clock as the mascot's entry
      rootRef.current?.classList.add('is-started');

      // Intro clock advances frame by frame with each step capped, so a stalled frame,
      // a hidden tab or a slow device never skips part of the intro.
      let elapsed = 0;
      let last = -1;
      let curWord: string | null = null;
      const lastWord = WORDS_LIST[WORDS_LIST.length - 1];
      const frame = (now: number) => {
        if (last >= 0) elapsed += Math.min(Math.max(0, (now - last) / 1000), 1 / 20);
        last = now;
        let t = reduced ? T.exit - 0.6 + Math.min(elapsed, 1.4) : elapsed;

        if (!Number.isNaN(freeze)) t = freeze;
        scene?.update(t);


        // the scene says which art form is "on stage"; slam its word in
        const w = scene?.word ?? null;
        const el = wordRef.current;
        if (el && w !== curWord) {
          const prev = curWord;
          curWord = w;
          if (w) {
            el.textContent = w;
            el.style.setProperty('--len', String(Math.max(6, w.length)));
            el.classList.remove('is-in', 'is-out');
            void el.offsetWidth; // restart CSS animation
            el.classList.add('is-in');
          } else if (prev && prev === lastWord) {
            // last word (Adventure): as its card swings off to the orbit, the letters slowly drift apart and dissolve
            const txt = el.textContent ?? '';
            el.textContent = '';
            const n = txt.length;
            [...txt].forEach((ch, i) => {
              const s = document.createElement('span');
              s.className = 'wl';
              s.textContent = ch;
              const c = i - (n - 1) / 2; // distance from the centre letter
              s.style.setProperty('--dx', `${(c * 0.55 + (Math.random() - 0.5) * 0.4).toFixed(2)}em`);
              s.style.setProperty('--dy', `${(-0.6 - Math.random() * 0.9).toFixed(2)}em`);
              s.style.setProperty('--rot', `${((Math.random() - 0.5) * 50).toFixed(0)}deg`);
              s.style.setProperty('--d', `${(Math.abs(c) * 0.08 + Math.random() * 0.05).toFixed(2)}s`);
              el.appendChild(s);
            });
            el.classList.remove('is-in');
            void el.offsetWidth;
            el.classList.add('is-out');
          }
        }
        const root = rootRef.current;
        if (root) {
          root.dataset.phase = t < T.converge ? 'tiles' : t < T.tagline ? 'emblem' : t < T.exit ? 'tagline' : 'exit';
          // ACT 4: tagline lines dash in one after another
          const box = taglineRef.current;
          if (box) {
            const lines = box.querySelectorAll<HTMLElement>('.tl');
            let shake = 0;
            lines.forEach((el2, i) => {
              const at = T.tagline + TAGLINE_AT[i];
              const on = t >= at;
              if (on !== el2.classList.contains('is-in')) el2.classList.toggle('is-in', on);
              const dt = t - (at + TAGLINE_HIT);
              if (dt >= 0) shake += Math.exp(-dt * 9) * (i === 2 ? 0.5 : 1);
            });
            // ground-slam camera shake on every impact
            const sx = Math.sin(t * 91) * shake * 9;
            const sy = Math.cos(t * 77) * shake * 7;
            box.style.transform = shake > 0.01 ? `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)` : '';
          }
          const exit = Math.min(1, Math.max(0, (t - T.exit) / (T.end - T.exit)));
          root.style.setProperty('--exit', exit.toFixed(3));
        }
        if (flashRef.current) flashRef.current.style.opacity = (scene?.flash ?? 0).toFixed(3);

        if (t >= T.end && Number.isNaN(freeze)) {
          window.removeEventListener('resize', onResize);
          finish();
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };
    run();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      scene?.dispose();
      document.body.style.overflow = '';
    };
  }, [onDone]);

  return (
    <div className={`intro3d ${fallback ? 'intro3d--fallback' : ''}`} ref={rootRef} data-phase="tiles" aria-label="Surabhi 2027 intro">
      <div className="intro3d__bg" />
      <div className="intro3d__rays" />
      <canvas ref={canvasRef} className="intro3d__canvas" />
      {fallback && <img className="intro3d__fallback-logo" src="/surabhi-logo-2027.jpg" alt="" />}
      <div className="intro3d__vignette" />
      <div className="intro3d__flash" ref={flashRef} />

      <p className="intro3d__kicker">KL University presents</p>

      <div className="intro3d__word" ref={wordRef} aria-hidden="true" />

      <div className="intro3d__tagline" ref={taglineRef} aria-label="This time, bigger and better!">
        <div className="tl-row tl-row--top">
          <span className="tl">This Time</span>
        </div>
        <div className="tl-row tl-row--bottom">
          <span className="tl">Bigger</span>
          <span className="tl tl--amp">&amp;</span>
          <span className="tl">Better!</span>
        </div>
      </div>


    </div>
  );
}