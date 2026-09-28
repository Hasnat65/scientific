import React, { useState } from 'react';
import { AngleMode } from '../types';
import { formatDisplayNumber, formatExpressionForDisplay } from '../utils/calculator';
import { Bookmark, BookmarkCheck, Copy, Check, Delete } from 'lucide-react';

interface DisplayProps {
  expression: string;
  displayValue: string;
  previewResult: string | null;
  angleMode: AngleMode;
  memoryValue: number;
  errorMessage?: string | null;
  onSaveCurrent: () => void;
  onBackspace: () => void;
  isSaved?: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  displayValue,
  previewResult,
  angleMode,
  memoryValue,
  errorMessage,
  onSaveCurrent,
  onBackspace,
  isSaved = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const textToCopy = displayValue || '0';
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Fallback
    }
  };

  // Dynamic font sizing for long numbers
  const getFontSize = (text: string) => {
    const len = text.length;
    if (len > 18) return 'text-2xl sm:text-3xl';
    if (len > 13) return 'text-3xl sm:text-4xl';
    if (len > 9) return 'text-4xl sm:text-5xl';
    return 'text-5xl sm:text-6xl';
  };

  const formattedDisplay = formatDisplayNumber(displayValue || '0');
  const formattedExpr = formatExpressionForDisplay(expression);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800/80 p-4 sm:p-5 shadow-inner text-neutral-100 flex flex-col justify-between min-h-[170px] sm:min-h-[190px] transition-all">
      {/* Top Status Bar & Quick Actions */}
      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono select-none border-b border-neutral-800/40 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-neutral-800/90 text-neutral-300 font-semibold tracking-wider text-[11px]">
            {angleMode.toUpperCase()}
          </span>

          {memoryValue !== 0 && (
            <span
              title={`Memory active: ${memoryValue}`}
              className="px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-semibold text-[11px]"
            >
              M ({formatDisplayNumber(memoryValue)})
            </span>
          )}

          {previewResult !== null && !errorMessage && (
            <span className="text-emerald-400/90 font-medium tracking-wide flex items-center gap-1 animate-pulse">
              <span>≈</span>
              <span>{formatDisplayNumber(previewResult)}</span>
            </span>
          )}
        </div>

        {/* Display action controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSaveCurrent}
            title={isSaved ? "Saved to history" : "Save this calculation"}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs ${
              isSaved
                ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                : 'text-neutral-400 hover:text-amber-300 hover:bg-neutral-800'
            }`}
          >
            {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            <span className="hidden sm:inline text-[11px] font-sans">
              {isSaved ? 'Saved' : 'Save'}
            </span>
          </button>

          <button
            onClick={handleCopy}
            title="Copy value"
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            <span className="hidden sm:inline text-[11px] font-sans">
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>

          <button
            onClick={onBackspace}
            title="Backspace (Delete)"
            className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Delete size={15} />
          </button>
        </div>
      </div>

      {/* Middle: Expression trail */}
      <div className="flex-1 flex flex-col justify-end text-right overflow-hidden py-1">
        <div
          className="text-neutral-400 text-sm sm:text-base font-mono tracking-wide truncate max-w-full overflow-x-auto select-all"
          title={expression}
        >
          {formattedExpr || '\u00A0'}
        </div>

        {/* Primary Value Display */}
        <div className="mt-1 flex items-baseline justify-end gap-1">
          {errorMessage ? (
            <span className="text-rose-400 font-mono text-xl sm:text-2xl font-medium tracking-tight">
              {errorMessage}
            </span>
          ) : (
            <span
              className={`font-mono font-semibold tracking-tight text-white select-all tabular-nums leading-none ${getFontSize(
                formattedDisplay
              )}`}
            >
              {formattedDisplay}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
