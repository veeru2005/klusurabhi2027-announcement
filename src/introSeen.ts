/* sessionStorage lives per browser tab: it survives a refresh but a new tab starts empty */
const KEY = 'surabhi-intro-seen';

function readSeen(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

function writeSeen(): void {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* private mode etc. – intro will just play again */
  }
}

/* Decided once, when the page loads. The tab is marked as "seen" the moment the
   intro STARTS, so refreshing in the middle of the intro (or right after it)
   opens Home directly instead of replaying it. */
export const shouldPlayIntro: boolean =
  !new URLSearchParams(window.location.search).has('nointro') && !readSeen();

if (shouldPlayIntro) {
  // Chrome can prerender the page while the URL is still being typed; only mark the
  // tab once the page is actually opened.
  const doc = document as Document & { prerendering?: boolean };
  if (doc.prerendering) document.addEventListener('prerenderingchange', writeSeen, { once: true });
  else writeSeen();
}

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
  writeSeen();
}
