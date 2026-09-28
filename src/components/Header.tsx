import React from 'react';
import { CalculatorMode, AngleMode, ThemeMode } from '../types';
import { Volume2, VolumeX, Keyboard, Moon, Sun, History, Download, Smartphone } from 'lucide-react';

interface HeaderProps {
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
  angleMode: AngleMode;
  onAngleModeToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  onOpenShortcuts: () => void;
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  historyCount: number;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  angleMode,
  onAngleModeToggle,
  soundEnabled,
  onSoundToggle,
  theme,
  onThemeToggle,
  onOpenShortcuts,
  isHistoryOpen,
  onToggleHistory,
  historyCount,
  onOpenInstallModal
}) => {
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 border-b transition-colors border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Single element brand wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 hover:opacity-90 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs font-mono text-sm font-semibold">
            fx
          </div>
          <span>OmniCalc Pro</span>
        </a>

        {/* Mode selector switch */}
        <div className="hidden sm:flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-medium border border-neutral-200/70 dark:border-neutral-700/60 ml-2">
          <button
            onClick={() => onModeChange('standard')}
            className={`px-3 py-1 rounded-md transition-all ${
              mode === 'standard'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => onModeChange('scientific')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
              mode === 'scientific'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <span>Scientific</span>
          </button>
        </div>
      </div>

      {/* Zone 2: Contextual quick controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {mode === 'scientific' && (
          <button
            onClick={onAngleModeToggle}
            title={`Switch to ${angleMode === 'deg' ? 'Radians' : 'Degrees'}`}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors uppercase"
          >
            {angleMode}
          </button>
        )}

        <button
          onClick={onSoundToggle}
          title={soundEnabled ? 'Mute click sounds' : 'Enable click sounds'}
          className="p-1.5 sm:p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} className="text-neutral-400" />}
        </button>

        <button
          onClick={onOpenShortcuts}
          title="Keyboard shortcuts (Press ?)"
          className="hidden md:flex p-1.5 sm:p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="Keyboard Shortcuts"
        >
          <Keyboard size={17} />
        </button>

        <button
          onClick={onThemeToggle}
          title="Toggle color theme"
          className="p-1.5 sm:p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Install / APK button */}
        <button
          onClick={onOpenInstallModal}
          title="Install on Android (APK / WebAPK) or Desktop"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-2xs"
          aria-label="Install App / APK"
        >
          <Smartphone size={15} className="text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Install APK</span>
          <span className="sm:hidden">APK</span>
        </button>

        {/* History Toggle Button */}
        <button
          onClick={onToggleHistory}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isHistoryOpen
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
          aria-label="Toggle History Panel"
        >
          <History size={15} />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              isHistoryOpen ? 'bg-indigo-700 text-indigo-100' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}>
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
