import { CalculationRecord } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'omni_calc_history_v1',
  MEMORY: 'omni_calc_memory_v1',
  SOUND_ENABLED: 'omni_calc_sound_v1',
  ANGLE_MODE: 'omni_calc_angle_mode_v1',
  THEME: 'omni_calc_theme_v1',
};

// Realistic initial sample records so the user immediately experiences the history panel & saving features
const INITIAL_RECORDS: CalculationRecord[] = [
  {
    id: 'sample-1',
    expression: '4,500 × 12 - 3,200',
    rawExpression: '4500 * 12 - 3200',
    result: '50800',
    timestamp: Date.now() - 1000 * 60 * 42,
    isSaved: true,
    label: 'Annual Net Savings Projection'
  },
  {
    id: 'sample-2',
    expression: '128 × 1.15',
    rawExpression: '128 * 1.15',
    result: '147.2',
    timestamp: Date.now() - 1000 * 60 * 18,
    isSaved: true,
    label: 'Dinner & 15% Gratuity'
  },
  {
    id: 'sample-3',
    expression: 'sqrt(144) + 25^2',
    rawExpression: 'sqrt(144) + 25^2',
    result: '637',
    timestamp: Date.now() - 1000 * 60 * 5,
    isSaved: false,
    label: ''
  }
];

export function loadHistoryFromStorage(): CalculationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      // Seed with initial records
      saveHistoryToStorage(INITIAL_RECORDS);
      return INITIAL_RECORDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return INITIAL_RECORDS;
  }
}

export function saveHistoryToStorage(records: CalculationRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(records));
  } catch {
    // quota exceeded or private mode
  }
}

export function loadMemoryFromStorage(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.MEMORY);
    return val ? parseFloat(val) : 0;
  } catch {
    return 0;
  }
}

export function saveMemoryToStorage(val: number) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORY, String(val));
  } catch {}
}

export function loadSoundPreference(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return val !== null ? val === 'true' : true;
  } catch {
    return true;
  }
}

export function saveSoundPreference(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
  } catch {}
}

/**
 * Format relative timestamp
 */
export function formatTimestamp(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const date = new Date(ts);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Export helpers
 */
export function exportToCSV(records: CalculationRecord[]): string {
  const headers = ['Timestamp', 'Formula', 'Result', 'Saved', 'Label'];
  const rows = records.map(r => [
    `"${new Date(r.timestamp).toISOString()}"`,
    `"${r.expression.replace(/"/g, '""')}"`,
    `"${r.result}"`,
    r.isSaved ? 'Yes' : 'No',
    `"${(r.label || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function exportToJSON(records: CalculationRecord[]): string {
  return JSON.stringify(records, null, 2);
}

export function exportToText(records: CalculationRecord[]): string {
  return records
    .map(r => {
      const time = new Date(r.timestamp).toLocaleString();
      const label = r.label ? ` [${r.label}]` : '';
      return `${time}${label}\n  ${r.expression} = ${r.result}\n`;
    })
    .join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
