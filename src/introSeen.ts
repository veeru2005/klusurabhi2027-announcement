/* The intro plays on every page load, including a refresh. Add ?nointro to the URL to skip it. */
export const shouldPlayIntro: boolean = !new URLSearchParams(window.location.search).has('nointro');

/* Resolves when the page is really on screen: not prerendered and not a hidden tab. */
export function whenPageVisible(): Promise<void> {
  return new Promise((resolve) => {
    const doc = document as Document & { prerendering?: boolean };
    const check = () => {
      if (doc.prerendering || document.visibilityState !== 'visible') return;
      document.removeEventListener('prerenderingchange', check);
      document.removeEventListener('visibilitychange', check);
      resolve();
    };
    document.addEventListener('prerenderingchange', check);
    document.addEventListener('visibilitychange', check);
    check();
  });
}

export function introSeen(): boolean {
  return !shouldPlayIntro;
}

export function markIntroSeen(): void {
  /* nothing to remember: the intro replays on every load */
}

