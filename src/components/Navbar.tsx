import React from 'react';
import { CheckCircle2, Timer, BarChart3, Sun, Moon, Keyboard } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  pendingCount: number;
  onOpenShortcuts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  pendingCount,
  onOpenShortcuts,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 sm:pt-4 pb-2 transition-all">
      <div className="max-w-5xl mx-auto">
        {/* 2026 Floating Glass Dynamic Island Navigation */}
        <div className="nav-island rounded-3xl px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-all">
          {/* Brand Identity with Next-Gen Icon */}
          <div className="flex items-center space-x-3 select-none">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('tasks')}>
              {/* Pulsing Aura */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center p-1.5 shadow-inner border border-white/10">
                <svg viewBox="0 0 512 512" className="w-full h-full">
                  <defs>
                    <linearGradient id="navBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#38BDF8" />
                      <stop offset="50%" stop-color="#818CF8" />
                      <stop offset="100%" stop-color="#C084FC" />
                    </linearGradient>
                    <linearGradient id="navSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#FDE047" />
                      <stop offset="100%" stop-color="#F59E0B" />
                    </linearGradient>
                  </defs>
                  <circle cx="256" cy="256" r="200" fill="none" stroke="url(#navBrandGrad)" stroke-width="42" stroke-dasharray="1256" stroke-dashoffset="314" stroke-linecap="round" />
                  <path d="M180 260 L230 310 L330 190" fill="none" stroke="#FFFFFF" stroke-width="38" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M350 140 Q364 160 384 168 Q364 176 350 196 Q336 176 316 168 Q336 160 350 140 Z" fill="url(#navSparkGrad)" />
                </svg>
              </div>
            </div>

            <div className="hidden min-[420px]:block">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 dark:from-indigo-300 dark:via-purple-200 dark:to-cyan-300 bg-clip-text text-transparent">
                  Task & Focus
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
                Ultra-responsive Flow State Engine
              </p>
            </div>
          </div>

          {/* Liquid Segmented Control Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-200/50 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-300/40 dark:border-white/5 shadow-inner">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`relative flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === 'tasks'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md shadow-indigo-500/10 dark:shadow-indigo-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tasks</span>
              {pendingCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 text-[10px] font-extrabold rounded-full transition-colors ${
                  activeTab === 'tasks'
                    ? 'bg-indigo-100 dark:bg-white/20 text-indigo-700 dark:text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('focus')}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === 'focus'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md shadow-indigo-500/10 dark:shadow-indigo-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>Focus</span>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === 'insights'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md shadow-indigo-500/10 dark:shadow-indigo-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Insights</span>
            </button>
          </nav>

          {/* Quick Utility Actions */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={onOpenShortcuts}
              className="p-2 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all hidden sm:flex border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (Press ?)"
            >
              <Keyboard className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
              aria-label="Toggle theme"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-in spin-in-90 duration-300" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
