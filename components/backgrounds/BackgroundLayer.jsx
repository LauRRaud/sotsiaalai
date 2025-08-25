'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, memo } from 'react';

const Particles    = dynamic(() => import('./Particles'), { ssr: false });
const Space        = dynamic(() => import('../Space'),   { ssr: false });
const SplashCursor = dynamic(() => import('../SplashCursor'), { ssr: false });

function getHtmlMode() {
  // Tõde on <html> klassis, mida DarkMode.jsx haldab
  return document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
}

function BackgroundLayer() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState('dark'); // turvaline default; ei renderda enne mounti

  useEffect(() => {
    setMounted(true);
    setMode(getHtmlMode());

    const onThemeChange = () => setMode(getHtmlMode());
    const onStorage = () => setMode(getHtmlMode());

    window.addEventListener('themechange', onThemeChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('themechange', onThemeChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (!mounted) return null; // väldi SSR/CSR ebakõla

  return (
    <>
      <div id="bg-stack" className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
        {/* key={mode} → kindel remount teema vahetusel */}
        <Space key={`space-${mode}`} mode={mode} />
        <Particles key={`particles-${mode}`} mode={mode} />
      </div>

      <div id="fx-stack" className="fixed inset-0 -z-10" aria-hidden="true">
        {/* reset ka kursorile */}
        <SplashCursor key={`cursor-${mode}`} />
      </div>
    </>
  );
}

export default memo(BackgroundLayer);
