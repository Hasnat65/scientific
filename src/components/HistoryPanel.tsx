import React, { useState, useMemo } from 'react';
import { CalculationRecord, HistoryTab } from '../types';
import { formatTimestamp, exportToCSV, exportToJSON, exportToText, downloadFile } from '../utils/storage';
import { formatDisplayNumber } from '../utils/calculator';
import {
  Bookmark,
  BookmarkCheck,
  Search,
  Trash2,
  Download,
  Copy,
  Check,
  Edit3,
  ArrowUpRight,
  RotateCcw,
  X,
  FileSpreadsheet,
  FileCode,
  FileText
} from 'lucide-react';

interface HistoryPanelProps {
  history: CalculationRecord[];
  onUseResult: (result: string) => void;
  onLoadExpression: (expr: string) => void;
  onToggleSave: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: (keepSaved: boolean) => void;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onUseResult,
  onLoadExpression,
  onToggleSave,
  onUpdateLabel,
  onDeleteRecord,
  onClearHistory,
  onClose,
  isMobileDrawer = false
}) => {
  const [activeTab, setActiveTab] = useState<HistoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabelText, setEditingLabelText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Filtered list
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // Tab filter
      if (activeTab === 'saved' && !item.isSaved) return false;
      if (activeTab === 'notes' && (!item.label || !item.label.trim())) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchExpr = item.expression.toLowerCase().includes(q);
        const matchResult = item.result.toLowerCase().includes(q);
        const matchLabel = (item.label || '').toLowerCase().includes(q);
        return matchExpr || matchResult || matchLabel;
      }
      return true;
    });
  }, [history, activeTab, searchQuery]);

  const savedCount = useMemo(() => history.filter(h => h.isSaved).length, [history]);
  const notesCount = useMemo(() => history.filter(h => h.label && h.label.trim()).length, [history]);

  const handleCopyRecord = async (item: CalculationRecord) => {
    try {
      const text = `${item.expression} = ${item.result}${item.label ? ` (${item.label})` : ''}`;
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const handleStartEditLabel = (item: CalculationRecord) => {
    setEditingId(item.id);
    setEditingLabelText(item.label || '');
  };

  const handleSaveLabel = (id: string) => {
    onUpdateLabel(id, editingLabelText.trim());
    setEditingId(null);
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(history);
    downloadFile(csv, `omni-calc-history-${Date.now()}.csv`, 'text/csv');
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const json = exportToJSON(history);
    downloadFile(json, `omni-calc-history-${Date.now()}.json`, 'application/json');
    setShowExportMenu(false);
  };

  const handleCopyTranscript = async () => {
    const text = exportToText(history);
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setShowExportMenu(false);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Panel Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Calculation History
            </h2>
            <span className="text-xs text-neutral-500 font-mono">
              ({history.length})
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Export Menu Toggle */}
            {history.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  title="Export history"
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <Download size={16} />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-500" />
                      <span>Export as CSV</span>
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
                    >
                      <FileCode size={14} className="text-indigo-500" />
                      <span>Export as JSON</span>
                    </button>
                    <button
                      onClick={handleCopyTranscript}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
                    >
                      <FileText size={14} className="text-amber-500" />
                      <span>{copiedAll ? 'Copied Transcript!' : 'Copy as Plain Text'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Clear History Trigger */}
            {history.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                title="Clear calculation history"
                className="p-1.5 text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* Close button on mobile / collapsible */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                title="Close history panel"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl mb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all text-center ${
              activeTab === 'all'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Bookmark size={13} className={savedCount > 0 ? "text-amber-500 fill-amber-500" : ""} />
            <span>Saved ({savedCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
              activeTab === 'notes'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Edit3 size={12} />
            <span>Notes ({notesCount})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history, formulas, or labels..."
            className="w-full pl-9 pr-7 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Banner */}
      {showClearConfirm && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 text-xs">
          <p className="font-semibold text-rose-900 dark:text-rose-200 mb-2">
            Clear calculation history?
          </p>
          <div className="flex flex-wrap gap-2">
            {savedCount > 0 && (
              <button
                onClick={() => {
                  onClearHistory(true);
                  setShowClearConfirm(false);
                }}
                className="px-2.5 py-1 bg-white dark:bg-neutral-800 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-md font-medium hover:bg-rose-100 transition-colors"
              >
                Keep Saved ({savedCount})
              </button>
            )}
            <button
              onClick={() => {
                onClearHistory(false);
                setShowClearConfirm(false);
              }}
              className="px-2.5 py-1 bg-rose-600 text-white rounded-md font-medium hover:bg-rose-500 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-2.5 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md font-medium hover:bg-neutral-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Calculation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
              <RotateCcw size={22} />
            </div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {searchQuery
                ? 'No matching calculations'
                : activeTab === 'saved'
                ? 'No saved calculations yet'
                : activeTab === 'notes'
                ? 'No annotated calculations'
                : 'No calculation history'}
            </p>
            <p className="text-xs text-neutral-500 max-w-[220px]">
              {searchQuery
                ? 'Try a different search term or clear the filter.'
                : activeTab === 'saved'
                ? 'Click the bookmark icon on any calculation to pin it here.'
                : activeTab === 'notes'
                ? 'Add labels or notes to keep track of receipts, taxes, or formulas.'
                : 'Perform calculations to see your history log and recall past results.'}
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-xl border p-3 transition-all ${
                item.isSaved
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
                  : 'bg-neutral-50/60 dark:bg-neutral-850/60 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {/* Top Item Meta: Timestamp & Saved status */}
              <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono">{formatTimestamp(item.timestamp)}</span>
                  {item.isSaved && (
                    <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                      <BookmarkCheck size={12} />
                      <span>Saved</span>
                    </span>
                  )}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleSave(item.id)}
                    title={item.isSaved ? 'Remove from saved' : 'Save calculation'}
                    className={`p-1 rounded-md transition-colors ${
                      item.isSaved
                        ? 'text-amber-500 hover:text-amber-600 bg-amber-100/60 dark:bg-amber-900/40'
                        : 'text-neutral-400 hover:text-amber-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Bookmark size={13} className={item.isSaved ? "fill-amber-500" : ""} />
                  </button>

                  <button
                    onClick={() => handleCopyRecord(item)}
                    title="Copy calculation"
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check size={13} className="text-emerald-500" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteRecord(item.id)}
                    title="Delete item"
                    className="p-1 text-neutral-400 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Label / Note Editor */}
              {editingId === item.id ? (
                <div className="my-1.5 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editingLabelText}
                    onChange={(e) => setEditingLabelText(e.target.value)}
                    placeholder="Enter label (e.g., Grocery Budget)..."
                    className="flex-1 px-2 py-1 text-xs bg-white dark:bg-neutral-800 border border-indigo-400 dark:border-indigo-600 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveLabel(item.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                  <button
                    onClick={() => handleSaveLabel(item.id)}
                    className="px-2 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-500"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                item.label && (
                  <div
                    onClick={() => handleStartEditLabel(item)}
                    className="my-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                    title="Click to edit label"
                  >
                    <span>{item.label}</span>
                    <Edit3 size={11} className="text-neutral-400 opacity-60" />
                  </div>
                )
              )}

              {/* Expression */}
              <div
                onClick={() => onLoadExpression(item.rawExpression)}
                className="text-xs text-neutral-500 font-mono tracking-wide truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                title="Click to load formula into calculator"
              >
                {item.expression}
              </div>

              {/* Result Value */}
              <div className="mt-1 flex items-baseline justify-between">
                <span
                  onClick={() => onUseResult(item.result)}
                  className="text-base sm:text-lg font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Click to use this result in calculation"
                >
                  = {formatDisplayNumber(item.result)}
                </span>

                {/* Card Quick Action Pills */}
                <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {!item.label && editingId !== item.id && (
                    <button
                      onClick={() => handleStartEditLabel(item)}
                      className="px-2 py-0.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-750 rounded-md transition-colors"
                    >
                      + Note
                    </button>
                  )}

                  <button
                    onClick={() => onLoadExpression(item.rawExpression)}
                    className="px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-200/70 dark:bg-neutral-750 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-md transition-colors flex items-center gap-1"
                    title="Load formula back to calculator"
                  >
                    <RotateCcw size={11} />
                    <span>Formula</span>
                  </button>

                  <button
                    onClick={() => onUseResult(item.result)}
                    className="px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-md transition-colors flex items-center gap-1"
                    title="Insert result into calculator"
                  >
                    <ArrowUpRight size={11} />
                    <span>Use</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
