import { useLayoutEffect, useRef } from 'react';
import Countdown from '../components/Countdown';
import Petals from '../components/Petals';
import { useParallax } from '../hooks/useParallax';

const SUB_TEXT = 'International Cultural Fest 2027';
const SUB_LETTERS = SUB_TEXT.split('');
const SUB_YEAR_AT = SUB_TEXT.indexOf('2027');

export default function Home() {
  const mandala = useParallax<HTMLDivElement>(0.25);
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  /* one screen, no scrolling: if the content is taller than the space between the
     badge and the credit line (short phones, landscape, small laptops), shrink it to fit */
  useLayoutEffect(() => {
    const hero = heroRef.current;
    const grid = gridRef.current;
    if (!hero || !grid) return;
    let raf = 0;
    const fit = () => {
      raf = 0;
      grid.style.setProperty('--fit', '1');
      const cs = getComputedStyle(hero);
      const room = hero.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const need = grid.offsetHeight;
      const scale = need > room && need > 0 ? Math.max(0.6, room / need) : 1;
      grid.style.setProperty('--fit', scale.toFixed(4));
    };
    const onResize = () => {
      if (!raf) raf = requestAnimationFrame(fit);
    };
    fit();
    document.fonts?.ready.then(onResize).catch(() => {});
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* 1. HERO — festival doorway: garland, arched window with the emblem */}
      <section className="hero" ref={heroRef}>
        <div className="hero__mandala" ref={mandala} aria-hidden="true" />
        <Petals />
        {/* corner logos: KL University top left, Surabhi symbol top right (Home only) */}
        <img className="hero__corner hero__corner--kl anim-rise" src="/kl-university-logo.webp" alt="KL University" width="539" height="220" decoding="async" />
        <img className="hero__corner hero__corner--symbol anim-rise" src="/surabhi-symbol-logo.webp" alt="Surabhi symbol" width="287" height="280" decoding="async" />
        <div className="container hero__grid" ref={gridRef}>
          <div className="hero__copy">
            <p className="hero__kicker hero__kicker--top anim-rise">KL University · KL SAC</p>
            <div className="hero__lockup hero__brand">
              {/* SURABHI + mascot on one row; the subtitle below spans exactly that row's width */}
              <div className="hero__namerow">
                <h1 className="hero__title anim-rise anim-d1">
                  <span className="hero__title-main">Surabhi</span>
                </h1>
                <img className="hero__mascot anim-rise anim-d1" src="/surabhi-mascot-home.webp" decoding="async" alt="Surabhi mascot" width="615" height="900" />
              </div>
              {/* each letter is a flex item, spread edge to edge under the name row */}
              <p className="hero__sub anim-rise anim-d2" aria-label="International Cultural Fest 2027">
                {SUB_LETTERS.map((ch, i) => (
                  <span key={i} aria-hidden="true" className={ch === ' ' ? 'sp' : i >= SUB_YEAR_AT ? 'hero__yr' : undefined}>
                    {ch === ' ' ? '\u00a0' : ch}
                  </span>
                ))}
              </p>
            </div>
            <p className="hero__date anim-rise anim-d2">
              <span className="dot">✦</span>
              <span>Announcement on 20th October</span>
              <span className="dot">✦</span>
            </p>
            <div className="anim-rise anim-d3">
              <Countdown />
            </div>
            {/* phones show the kicker under the buttons instead of over the logo */}
            <p className="hero__kicker hero__kicker--foot anim-rise anim-d4">KL University · KL SAC</p>
          </div>

          <div className="hero__window anim-window">
            {/* the mandala art fades at the bottom, so the top half is drawn twice (once mirrored) for an evenly bright circle */}
            <div className="hero__mandala-full" aria-hidden="true">
              <img src="/surabhi-mandala.webp" alt="" width="900" height="900" decoding="async" />
              <img className="hero__mandala-mirror" src="/surabhi-mandala.webp" alt="" width="900" height="900" decoding="async" />
            </div>
            <div className="jharokha">
              <div className="jharokha__halo" aria-hidden="true" />
              <img src="/surabhi-logo-2027.jpg" {...{ fetchpriority: 'high' }} alt="Surabhi 2027 – International Cultural Fest logo" />
            </div>
          </div>
        </div>
        <footer className="hero__credit">
          <span className="hero__credit-copy">
            © 2027 SURABHI<span className="hero__credit-rights">. All Rights Reserved</span>
          </span>
          <span className="hero__credit-sep" aria-hidden="true" />
          <span className="hero__credit-by">
            Designed &amp; Developed by{' '}
            <a href="https://veerendra-portfolio.in" target="_blank" rel="noopener noreferrer">
              Veerendra Chowdary
            </a>
          </span>
        </footer>
        <div className="scallop scallop--ivory" aria-hidden="true" />
      </section>

    </>
  );
}