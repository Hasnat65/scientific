import React from 'react';
import { CalculatorMode } from '../types';

interface KeypadProps {
  mode: CalculatorMode;
  onNumber: (num: string) => void;
  onOperator: (op: string) => void;
  onFunction: (fn: string) => void;
  onEquals: () => void;
  onClear: () => void;
  onAllClear: () => void;
  onPlusMinus: () => void;
  onParenthesis: (p: '(' | ')') => void;
  onMemory: (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => void;
  memoryActive: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  mode,
  onNumber,
  onOperator,
  onFunction,
  onEquals,
  onClear,
  onAllClear,
  onPlusMinus,
  onParenthesis,
  onMemory,
  memoryActive
}) => {
  // Styles for different button classes
  const baseBtn = "relative flex items-center justify-center font-medium rounded-xl select-none transition-all duration-100 active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500";
  
  const numBtn = `${baseBtn} h-12 sm:h-14 text-lg sm:text-xl font-mono bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-700/60 hover:bg-neutral-100 dark:hover:bg-neutral-750 shadow-xs`;
  
  const opBtn = `${baseBtn} h-12 sm:h-14 text-lg sm:text-xl font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 shadow-xs`;
  
  const actionBtn = `${baseBtn} h-12 sm:h-14 text-sm sm:text-base font-semibold bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700`;
  
  const sciBtn = `${baseBtn} h-10 sm:h-11 text-xs sm:text-sm font-mono bg-neutral-100/80 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-750 hover:bg-neutral-200 dark:hover:bg-neutral-750`;
  
  const equalsBtn = `${baseBtn} h-12 sm:h-14 text-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:bg-indigo-700`;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Memory Row */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        <button
          onClick={() => onMemory('MC')}
          disabled={!memoryActive}
          className={`h-8 sm:h-9 text-xs font-mono font-medium rounded-lg transition-colors ${
            memoryActive
              ? 'text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              : 'text-neutral-400/50 dark:text-neutral-600 bg-transparent cursor-not-allowed'
          }`}
          title="Clear Memory"
        >
          MC
        </button>
        <button
          onClick={() => onMemory('MR')}
          disabled={!memoryActive}
          className={`h-8 sm:h-9 text-xs font-mono font-medium rounded-lg transition-colors ${
            memoryActive
              ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
              : 'text-neutral-400/50 dark:text-neutral-600 bg-transparent cursor-not-allowed'
          }`}
          title="Recall Memory"
        >
          MR
        </button>
        <button
          onClick={() => onMemory('M+')}
          className="h-8 sm:h-9 text-xs font-mono font-medium rounded-lg text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          title="Add to Memory"
        >
          M+
        </button>
        <button
          onClick={() => onMemory('M-')}
          className="h-8 sm:h-9 text-xs font-mono font-medium rounded-lg text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          title="Subtract from Memory"
        >
          M-
        </button>
        <button
          onClick={() => onMemory('MS')}
          className="h-8 sm:h-9 text-xs font-mono font-medium rounded-lg text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          title="Store in Memory"
        >
          MS
        </button>
      </div>

      {/* Scientific Functions Grid (Visible if mode is scientific) */}
      {mode === 'scientific' && (
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 p-2 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/80 dark:border-neutral-800 animate-in fade-in duration-150">
          <button onClick={() => onFunction('sin')} className={sciBtn}>sin</button>
          <button onClick={() => onFunction('cos')} className={sciBtn}>cos</button>
          <button onClick={() => onFunction('tan')} className={sciBtn}>tan</button>
          <button onClick={() => onFunction('π')} className={sciBtn}>π</button>
          <button onClick={() => onFunction('e')} className={sciBtn}>e</button>

          <button onClick={() => onFunction('asin')} className={sciBtn}>asin</button>
          <button onClick={() => onFunction('acos')} className={sciBtn}>acos</button>
          <button onClick={() => onFunction('atan')} className={sciBtn}>atan</button>
          <button onClick={() => onFunction('sqr')} className={sciBtn}>x²</button>
          <button onClick={() => onFunction('cube')} className={sciBtn}>x³</button>

          <button onClick={() => onFunction('ln')} className={sciBtn}>ln</button>
          <button onClick={() => onFunction('log')} className={sciBtn}>log</button>
          <button onClick={() => onOperator('^')} className={sciBtn}>xʸ</button>
          <button onClick={() => onFunction('sqrt')} className={sciBtn}>√x</button>
          <button onClick={() => onFunction('cbrt')} className={sciBtn}>³√x</button>

          <button onClick={() => onFunction('fact')} className={sciBtn}>x!</button>
          <button onClick={() => onFunction('abs')} className={sciBtn}>|x|</button>
          <button onClick={() => onFunction('recip')} className={sciBtn}>1/x</button>
          <button onClick={() => onParenthesis('(')} className={sciBtn}>(</button>
          <button onClick={() => onParenthesis(')')} className={sciBtn}>)</button>
        </div>
      )}

      {/* Main Standard Keypad Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {/* Row 1 */}
        <button
          onClick={onAllClear}
          className={`${actionBtn} text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/40`}
          title="All Clear (Esc)"
        >
          AC
        </button>
        <button
          onClick={onClear}
          className={actionBtn}
          title="Clear Entry (C)"
        >
          C
        </button>
        <button
          onClick={() => onOperator('%')}
          className={actionBtn}
          title="Percent (%)"
        >
          %
        </button>
        <button
          onClick={() => onOperator('/')}
          className={opBtn}
          title="Divide (/)"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button onClick={() => onNumber('7')} className={numBtn}>7</button>
        <button onClick={() => onNumber('8')} className={numBtn}>8</button>
        <button onClick={() => onNumber('9')} className={numBtn}>9</button>
        <button
          onClick={() => onOperator('*')}
          className={opBtn}
          title="Multiply (*)"
        >
          ×
        </button>

        {/* Row 3 */}
        <button onClick={() => onNumber('4')} className={numBtn}>4</button>
        <button onClick={() => onNumber('5')} className={numBtn}>5</button>
        <button onClick={() => onNumber('6')} className={numBtn}>6</button>
        <button
          onClick={() => onOperator('-')}
          className={opBtn}
          title="Subtract (-)"
        >
          −
        </button>

        {/* Row 4 */}
        <button onClick={() => onNumber('1')} className={numBtn}>1</button>
        <button onClick={() => onNumber('2')} className={numBtn}>2</button>
        <button onClick={() => onNumber('3')} className={numBtn}>3</button>
        <button
          onClick={() => onOperator('+')}
          className={opBtn}
          title="Add (+)"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={onPlusMinus}
          className={actionBtn}
          title="Negate (±)"
        >
          ±
        </button>
        <button onClick={() => onNumber('0')} className={numBtn}>0</button>
        <button
          onClick={() => onNumber('.')}
          className={numBtn}
          title="Decimal point"
        >
          .
        </button>
        <button
          onClick={onEquals}
          className={equalsBtn}
          title="Calculate (= or Enter)"
        >
          =
        </button>
      </div>
    </div>
  );
};
