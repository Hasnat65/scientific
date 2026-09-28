export interface CalculationRecord {
  id: string;
  expression: string;     // User-facing expression, e.g. "1,250 × 4.5 + 80"
  rawExpression: string;  // Evaluable expression, e.g. "1250 * 4.5 + 80"
  result: string;         // Eval result, e.g. "5705"
  timestamp: number;      // Epoch ms
  isSaved: boolean;       // Marked as saved / bookmarked
  label?: string;         // Optional user note or title (e.g., "Monthly Rent")
}

export type CalculatorMode = 'standard' | 'scientific';
export type AngleMode = 'deg' | 'rad';
export type ThemeMode = 'dark' | 'light' | 'emerald' | 'slate';
export type HistoryTab = 'all' | 'saved' | 'notes';
