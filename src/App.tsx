import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalculationRecord, CalculatorMode, AngleMode, ThemeMode } from './types';
import {
  calculateExpression,
  tryPreviewCalculation,
  sanitizeFloat
} from './utils/calculator';
import {
  loadHistoryFromStorage,
  saveHistoryToStorage,
  loadMemoryFromStorage,
  saveMemoryToStorage,
  loadSoundPreference,
  saveSoundPreference
} from './utils/storage';
import { playKeySound } from './utils/audio';
import { Header } from './components/Header';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { HistoryPanel } from './components/HistoryPanel';
import { SaveCalculationModal } from './components/SaveCalculationModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { InstallModal } from './components/InstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('omni_calc_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
    }
    return 'dark';
  });

  // Calculator modes & preferences
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => loadSoundPreference());

  // Calculation state
  const [expression, setExpression] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [justEvaluated, setJustEvaluated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [memoryValue, setMemoryValue] = useState<number>(() => loadMemoryFromStorage());

  // History state
  const [history, setHistory] = useState<CalculationRecord[]>(() => loadHistoryFromStorage());
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(() => {
    // Default open on wide screens
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Modals state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme class to document body
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('omni_calc_theme', theme);
  }, [theme]);

  // Sync history and memory changes
  useEffect(() => {
    saveHistoryToStorage(history);
  }, [history]);

  useEffect(() => {
    saveMemoryToStorage(memoryValue);
  }, [memoryValue]);

  useEffect(() => {
    saveSoundPreference(soundEnabled);
  }, [soundEnabled]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2200);
  };

  // Live calculation preview
  const previewResult = useMemo(() => {
    if (justEvaluated || errorMessage) return null;
    return tryPreviewCalculation(expression, angleMode);
  }, [expression, angleMode, justEvaluated, errorMessage]);

  // Check if current expression or result is already marked as saved in history
  const isCurrentSaved = useMemo(() => {
    if (!expression && displayValue === '0') return false;
    return history.some(h => (h.expression === expression || h.result === displayValue) && h.isSaved);
  }, [history, expression, displayValue]);

  /**
   * Action Handlers
   */
  const handleNumber = useCallback((num: string) => {
    playKeySound('number', soundEnabled);
    setErrorMessage(null);

    if (justEvaluated) {
      // Start fresh
      setExpression(num);
      setDisplayValue(num);
      setJustEvaluated(false);
      return;
    }

    if (num === '.') {
      // Find current active number in expression
      const parts = expression.split(/([+\-*/^%()])/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) {
        return; // Prevent multiple decimal points
      }
      if (!lastPart || lastPart === '') {
        const newExpr = expression + '0.';
        setExpression(newExpr);
        setDisplayValue('0.');
        return;
      }
    }

    const newExpr = (expression === '0' && num !== '.') ? num : expression + num;
    setExpression(newExpr);

    // Extract current number for display
    const tokens = newExpr.split(/([+\-*/^%()])/);
    const currNum = tokens[tokens.length - 1] || num;
    setDisplayValue(currNum);
  }, [expression, justEvaluated, soundEnabled]);

  const handleOperator = useCallback((op: string) => {
    playKeySound('operator', soundEnabled);
    setErrorMessage(null);

    let baseExpr = expression;
    if (justEvaluated) {
      baseExpr = displayValue;
      setJustEvaluated(false);
    }

    if (!baseExpr) {
      if (op === '-') {
        setExpression('-');
        setDisplayValue('-');
        return;
      }
      baseExpr = '0';
    }

    // If expression ends with an operator, replace it
    if (/[+\-*/^%]$/.test(baseExpr.trim())) {
      const replaced = baseExpr.trim().replace(/[+\-*/^%]+$/, op);
      setExpression(replaced);
    } else {
      setExpression(baseExpr + op);
    }
  }, [expression, displayValue, justEvaluated, soundEnabled]);

  const handleFunction = useCallback((fn: string) => {
    playKeySound('operator', soundEnabled);
    setErrorMessage(null);

    if (justEvaluated) {
      const base = displayValue;
      setJustEvaluated(false);
      if (fn === 'sqr') setExpression(`(${base})^2`);
      else if (fn === 'cube') setExpression(`(${base})^3`);
      else if (fn === 'recip') setExpression(`1/(${base})`);
      else if (fn === 'fact') setExpression(`fact(${base})`);
      else if (fn === 'abs') setExpression(`abs(${base})`);
      else if (fn === 'π') setExpression('π');
      else if (fn === 'e') setExpression('e');
      else setExpression(`${fn}(${base})`);
      return;
    }

    if (fn === 'π') {
      handleNumber('π');
      return;
    }
    if (fn === 'e') {
      handleNumber('e');
      return;
    }

    if (fn === 'sqr') {
      setExpression((prev) => (prev ? `(${prev})^2` : '0^2'));
      return;
    }
    if (fn === 'cube') {
      setExpression((prev) => (prev ? `(${prev})^3` : '0^3'));
      return;
    }
    if (fn === 'recip') {
      setExpression((prev) => (prev ? `1/(${prev})` : '1/('));
      return;
    }
    if (fn === 'fact') {
      setExpression((prev) => (prev ? `fact(${prev})` : 'fact('));
      return;
    }
    if (fn === 'abs') {
      setExpression((prev) => (prev ? `abs(${prev})` : 'abs('));
      return;
    }

    // Functions like sin, cos, tan, sqrt, ln, log
    setExpression((prev) => (prev ? `${prev}${fn}(` : `${fn}(`));
  }, [expression, displayValue, justEvaluated, handleNumber, soundEnabled]);

  const handleParenthesis = useCallback((p: '(' | ')') => {
    playKeySound('action', soundEnabled);
    setErrorMessage(null);
    if (justEvaluated) {
      setExpression(p);
      setJustEvaluated(false);
      return;
    }
    setExpression((prev) => prev + p);
  }, [justEvaluated, soundEnabled]);

  const handlePlusMinus = useCallback(() => {
    playKeySound('action', soundEnabled);
    if (justEvaluated || !expression) {
      const num = parseFloat(displayValue);
      if (!isNaN(num)) {
        const negated = String(sanitizeFloat(-num));
        setDisplayValue(negated);
        setExpression(negated);
      }
      return;
    }

    // Toggle negation on last number in expression
    const match = expression.match(/(-?\d+(\.\d+)?)$/);
    if (match) {
      const lastNumStr = match[0];
      const startIdx = match.index!;
      let toggled = '';
      if (lastNumStr.startsWith('-')) {
        toggled = lastNumStr.substring(1);
      } else {
        toggled = '-' + lastNumStr;
      }
      const newExpr = expression.substring(0, startIdx) + toggled;
      setExpression(newExpr);
      setDisplayValue(toggled);
    } else {
      setExpression((prev) => prev + '-');
    }
  }, [displayValue, expression, justEvaluated, soundEnabled]);

  const handleBackspace = useCallback(() => {
    playKeySound('action', soundEnabled);
    setErrorMessage(null);

    if (justEvaluated) {
      setJustEvaluated(false);
      return;
    }

    if (expression.length > 0) {
      const updated = expression.slice(0, -1);
      setExpression(updated);

      if (updated.length === 0) {
        setDisplayValue('0');
      } else {
        const parts = updated.split(/([+\-*/^%()])/);
        const lastPart = parts[parts.length - 1];
        setDisplayValue(lastPart || '0');
      }
    }
  }, [expression, justEvaluated, soundEnabled]);

  const handleClear = useCallback(() => {
    playKeySound('clear', soundEnabled);
    setErrorMessage(null);

    if (justEvaluated) {
      setExpression('');
      setDisplayValue('0');
      setJustEvaluated(false);
      return;
    }

    // Remove last number/token
    const match = expression.match(/(\d+(\.\d+)?|[a-z]+|\([a-z0-9.]*|[+\-*/^%()])$/i);
    if (match) {
      const updated = expression.substring(0, match.index);
      setExpression(updated);
      setDisplayValue('0');
    } else {
      setExpression('');
      setDisplayValue('0');
    }
  }, [expression, justEvaluated, soundEnabled]);

  const handleAllClear = useCallback(() => {
    playKeySound('clear', soundEnabled);
    setExpression('');
    setDisplayValue('0');
    setErrorMessage(null);
    setJustEvaluated(false);
  }, [soundEnabled]);

  // Main evaluation handler
  const handleEquals = useCallback(() => {
    if (!expression || expression.trim().length === 0) return;

    playKeySound('equals', soundEnabled);

    // Auto-balance unclosed parentheses
    let openParens = 0;
    for (const ch of expression) {
      if (ch === '(') openParens++;
      if (ch === ')') openParens--;
    }
    let fullExpr = expression;
    if (openParens > 0) {
      fullExpr += ')'.repeat(openParens);
    }

    const { result, error } = calculateExpression(fullExpr, angleMode);

    if (error || result === 'Error') {
      setErrorMessage(error || 'Invalid calculation');
      return;
    }

    setDisplayValue(result);
    setJustEvaluated(true);
    setErrorMessage(null);

    // Add to history records
    const newRecord: CalculationRecord = {
      id: `calc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      expression: fullExpr,
      rawExpression: fullExpr,
      result: result,
      timestamp: Date.now(),
      isSaved: false
    };

    setHistory((prev) => [newRecord, ...prev]);
  }, [expression, angleMode, soundEnabled]);

  // Memory functions
  const handleMemory = useCallback((action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    playKeySound('memory', soundEnabled);
    const currNum = parseFloat(displayValue) || 0;

    switch (action) {
      case 'MC':
        setMemoryValue(0);
        showToast('Memory Cleared');
        break;
      case 'MR':
        if (memoryValue !== 0) {
          handleNumber(String(memoryValue));
          showToast(`Recalled: ${memoryValue}`);
        }
        break;
      case 'M+': {
        const added = sanitizeFloat(memoryValue + currNum);
        setMemoryValue(added);
        showToast(`Memory +: ${added}`);
        break;
      }
      case 'M-': {
        const subbed = sanitizeFloat(memoryValue - currNum);
        setMemoryValue(subbed);
        showToast(`Memory −: ${subbed}`);
        break;
      }
      case 'MS':
        setMemoryValue(currNum);
        showToast(`Memory Stored: ${currNum}`);
        break;
    }
  }, [displayValue, memoryValue, soundEnabled, handleNumber]);

  // History interactions
  const handleUseResult = useCallback((val: string) => {
    playKeySound('action', soundEnabled);
    handleNumber(val);
    showToast(`Inserted: ${val}`);
  }, [handleNumber, soundEnabled]);

  const handleLoadExpression = useCallback((expr: string) => {
    playKeySound('action', soundEnabled);
    setExpression(expr);
    setJustEvaluated(false);
    setErrorMessage(null);
    showToast('Loaded formula');
  }, [soundEnabled]);

  const handleToggleSave = useCallback((id: string) => {
    playKeySound('action', soundEnabled);
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSaved: !item.isSaved } : item
      )
    );
  }, [soundEnabled]);

  const handleUpdateLabel = useCallback((id: string, label: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, label, isSaved: true } : item
      )
    );
    showToast('Note saved');
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearHistory = useCallback((keepSaved: boolean) => {
    if (keepSaved) {
      setHistory((prev) => prev.filter((item) => item.isSaved));
      showToast('Cleared unsaved history');
    } else {
      setHistory([]);
      showToast('History completely cleared');
    }
  }, []);

  // Save active calculation
  const handleOpenSaveModal = () => {
    if (displayValue === '0' && !expression) {
      showToast('Nothing to save yet');
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = (label: string) => {
    const exprToSave = expression || displayValue;
    const resToSave = displayValue;

    // Check if matching record is already in history
    const existingIndex = history.findIndex(
      (h) => h.result === resToSave && h.expression === exprToSave
    );

    if (existingIndex >= 0) {
      setHistory((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, isSaved: true, label: label || item.label }
            : item
        )
      );
    } else {
      const newRec: CalculationRecord = {
        id: `calc-${Date.now()}`,
        expression: exprToSave,
        rawExpression: exprToSave,
        result: resToSave,
        timestamp: Date.now(),
        isSaved: true,
        label: label
      };
      setHistory((prev) => [newRec, ...prev]);
    }

    showToast('Calculation bookmarked!');
  };

  /**
   * Keyboard Listener
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // Modifier checks
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          handleOpenSaveModal();
          return;
        }
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleNumber(key);
      } else if (key === '.') {
        e.preventDefault();
        handleNumber('.');
      } else if (['+', '-', '*', '/', '%', '^'].includes(key)) {
        e.preventDefault();
        handleOperator(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        handleAllClear();
      } else if (key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        handleParenthesis(key as '(' | ')');
      } else if (key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
      } else if (key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (key.toLowerCase() === 's') {
        e.preventDefault();
        handleFunction('sin');
      } else if (key.toLowerCase() === 't') {
        e.preventDefault();
        handleFunction('tan');
      } else if (key.toLowerCase() === 'q') {
        e.preventDefault();
        handleFunction('sqrt');
      } else if (key.toLowerCase() === 'l') {
        e.preventDefault();
        handleFunction('ln');
      } else if (key.toLowerCase() === 'p') {
        e.preventDefault();
        handleFunction('π');
      } else if (key.toLowerCase() === 'e') {
        e.preventDefault();
        handleFunction('e');
      } else if (key === '!') {
        e.preventDefault();
        handleFunction('fact');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNumber,
    handleOperator,
    handleEquals,
    handleBackspace,
    handleAllClear,
    handleClear,
    handleParenthesis,
    handleFunction
  ]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      theme === 'dark' ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-100 text-neutral-900'
    }`}>
      {/* Top Header */}
      <Header
        mode={mode}
        onModeChange={setMode}
        angleMode={angleMode}
        onAngleModeToggle={() => setAngleMode((prev) => (prev === 'deg' ? 'rad' : 'deg'))}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled((prev) => !prev)}
        theme={theme}
        onThemeToggle={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isHistoryOpen={isHistoryOpen}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        historyCount={history.length}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex justify-center items-start p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="w-full flex flex-col lg:flex-row gap-6 items-stretch justify-center">
          
          {/* Calculator Chassis Card */}
          <div className={`w-full ${
            mode === 'scientific' ? 'max-w-xl' : 'max-w-md'
          } mx-auto lg:mx-0 flex flex-col rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-xl transition-all`}>
            
            {/* Top Sub-Bar with Quick Mode Tab on mobile */}
            <div className="flex sm:hidden items-center justify-between mb-3 text-xs">
              <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <button
                  onClick={() => setMode('standard')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    mode === 'standard'
                      ? 'bg-white dark:bg-neutral-700 font-semibold shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setMode('scientific')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    mode === 'scientific'
                      ? 'bg-white dark:bg-neutral-700 font-semibold shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  Scientific
                </button>
              </div>

              {mode === 'scientific' && (
                <button
                  onClick={() => setAngleMode((prev) => (prev === 'deg' ? 'rad' : 'deg'))}
                  className="px-2 py-1 font-mono uppercase bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-600 dark:text-neutral-300"
                >
                  {angleMode}
                </button>
              )}
            </div>

            {/* Display Component */}
            <Display
              expression={expression}
              displayValue={displayValue}
              previewResult={previewResult}
              angleMode={angleMode}
              memoryValue={memoryValue}
              errorMessage={errorMessage}
              onSaveCurrent={handleOpenSaveModal}
              onBackspace={handleBackspace}
              isSaved={isCurrentSaved}
            />

            {/* Spacer */}
            <div className="h-4 sm:h-5" />

            {/* Keypad Component */}
            <Keypad
              mode={mode}
              onNumber={handleNumber}
              onOperator={handleOperator}
              onFunction={handleFunction}
              onEquals={handleEquals}
              onClear={handleClear}
              onAllClear={handleAllClear}
              onPlusMinus={handlePlusMinus}
              onParenthesis={handleParenthesis}
              onMemory={handleMemory}
              memoryActive={memoryValue !== 0}
            />
          </div>

          {/* Dedicated History Panel (Side-by-side on desktop) */}
          <div
            className={`transition-all duration-300 ${
              isHistoryOpen
                ? 'w-full lg:w-96 xl:w-[420px] block'
                : 'hidden'
            }`}
          >
            <div className="h-[620px] rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xl">
              <HistoryPanel
                history={history}
                onUseResult={handleUseResult}
                onLoadExpression={handleLoadExpression}
                onToggleSave={handleToggleSave}
                onUpdateLabel={handleUpdateLabel}
                onDeleteRecord={handleDeleteRecord}
                onClearHistory={handleClearHistory}
                onClose={() => setIsHistoryOpen(false)}
              />
            </div>
          </div>

        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-900/95 dark:bg-neutral-100/95 text-white dark:text-neutral-900 text-xs font-semibold rounded-full shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* Save Calculation Modal */}
      <SaveCalculationModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        expression={expression || displayValue}
        result={displayValue}
        onSave={handleConfirmSave}
      />

      {/* Keyboard Shortcuts Reference Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Android APK & PWA Install Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        appUrl={typeof window !== 'undefined' ? window.location.href : ''}
      />

      {/* Offline Status Badge */}
      <OfflineIndicator />
    </div>
  );
}
