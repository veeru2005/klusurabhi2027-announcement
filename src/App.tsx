import { useCallback, useState } from 'react';
import Loader from './components/Loader';
import Home from './pages/Home';
import { shouldPlayIntro, markIntroSeen } from './introSeen';

export default function App() {
  // intro plays once per browser tab: a refresh goes straight to Home, a new tab plays it again
  const [loading, setLoading] = useState(shouldPlayIntro);
  // the home page's entrance animations wait until the intro starts fading out
  const [homeLive, setHomeLive] = useState(!shouldPlayIntro);
  const startHome = useCallback(() => setHomeLive(true), []);
  const finishLoading = useCallback(() => {
    markIntroSeen();
    setHomeLive(true);
    setLoading(false);
  }, []);

  return (
    <div className={`app app--single${homeLive ? '' : ' app--waiting'}`}>
      {loading && <Loader onDone={finishLoading} onExit={startHome} />}
      <main className="page-enter">
        <Home />
      </main>
    </div>
  );
}