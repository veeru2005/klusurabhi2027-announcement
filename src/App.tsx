import { useCallback, useState } from 'react';
import Loader from './components/Loader';
import Home from './pages/Home';
import { shouldPlayIntro, markIntroSeen } from './introSeen';

export default function App() {
  // intro plays once per browser tab: a refresh goes straight to Home, a new tab plays it again
  const [loading, setLoading] = useState(shouldPlayIntro);
  const finishLoading = useCallback(() => {
    markIntroSeen();
    setLoading(false);
  }, []);

  return (
    <div className="app app--single">
      {loading && <Loader onDone={finishLoading} />}
      <main className="page-enter">
        <Home />
      </main>
    </div>
  );
}