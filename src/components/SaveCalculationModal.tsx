import React, { useState } from 'react';
import { formatDisplayNumber, formatExpressionForDisplay } from '../utils/calculator';
import { Bookmark, X, Check } from 'lucide-react';

interface SaveCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  expression: string;
  result: string;
  onSave: (label: string) => void;
}

export const SaveCalculationModal: React.FC<SaveCalculationModalProps> = ({
  isOpen,
  onClose,
  expression,
  result,
  onSave
}) => {
  const [label, setLabel] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(label.trim());
    setLabel('');
    onClose();
  };

  const quickLabels = ['Monthly Budget', 'Tax Deduction', 'Trip Expense', 'Invoice Total', 'Conversion', 'Measurement'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-5 text-neutral-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Bookmark size={18} className="fill-amber-500" />
            </div>
            <h3 className="font-bold text-base tracking-tight">Save Calculation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Calculation Summary Preview */}
        <div className="my-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 font-mono text-sm">
          <div className="text-neutral-500 text-xs truncate mb-1">
            {formatExpressionForDisplay(expression) || '0'}
          </div>
          <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            = {formatDisplayNumber(result)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Add a label or title (optional):
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Monthly groceries, Server cost..."
              autoFocus
              className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Quick Label suggestions */}
          <div>
            <span className="block text-[11px] text-neutral-400 mb-1.5 font-medium">Quick suggestions:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickLabels.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => setLabel(suggestion)}
                  className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md text-neutral-600 dark:text-neutral-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check size={14} />
              <span>Save to History</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
