import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 – 9', desc: 'Input digits' },
    { key: '+ , - , * , /', desc: 'Basic arithmetic operators' },
    { key: 'Enter or =', desc: 'Evaluate expression' },
    { key: 'Backspace', desc: 'Delete last character' },
    { key: 'Escape', desc: 'All Clear (AC)' },
    { key: 'C', desc: 'Clear entry (C)' },
    { key: '%', desc: 'Modulo / Percent' },
    { key: '^', desc: 'Exponentiation (Power)' },
    { key: '( and )', desc: 'Parentheses' },
    { key: 's / c / t', desc: 'sin, cos, tan functions' },
    { key: 'q', desc: 'Square root (sqrt)' },
    { key: 'l', desc: 'Natural logarithm (ln)' },
    { key: 'p', desc: 'Pi constant (π)' },
    { key: 'e', desc: 'Euler\'s number (e)' },
    { key: '!', desc: 'Factorial' },
    { key: 'h or H', desc: 'Toggle history panel' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-5 text-neutral-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Keyboard size={18} />
            </div>
            <h3 className="font-bold text-base tracking-tight">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {shortcuts.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/50"
              >
                <span className="text-neutral-600 dark:text-neutral-300 font-medium">
                  {s.desc}
                </span>
                <kbd className="px-2 py-0.5 font-mono text-[11px] font-semibold bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded text-neutral-900 dark:text-neutral-100 shadow-2xs">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-xs text-neutral-500">
            You can also type entire expressions directly from your keyboard anytime!
          </p>
        </div>
      </div>
    </div>
  );
};
