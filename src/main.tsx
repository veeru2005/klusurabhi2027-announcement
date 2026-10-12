import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './intro.css';
import { shouldPlayIntro } from './introSeen';

// start downloading the 3D intro right away (in parallel with React), not after the first render
if (shouldPlayIntro) {
  import('./intro/IntroScene').catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);