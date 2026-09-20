import { createSignal, onMount } from 'solid-js';
import { SunIcon, MoonIcon } from './Icons';

export default function ThemeToggle() {
  const [theme, setTheme] = createSignal<'dark' | 'light'>('dark');

  onMount(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  });

  const applyTheme = (t: 'dark' | 'light') => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggle = () => {
    const next = theme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      class="p-2 rounded-md bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
      title="Toggle Dark / Light Theme"
      aria-label="Toggle Theme"
    >
      {theme() === 'dark' ? <SunIcon class="w-4 h-4 text-amber-400" /> : <MoonIcon class="w-4 h-4 text-slate-700" />}
    </button>
  );
}
