import { AngleMode } from '../types';

/**
 * Robust mathematical expression parser & evaluator.
 * Safe from eval/injection, handles operator precedence,
 * scientific functions, parentheses, and float precision.
 */

// Helper to compute factorials safely
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Factorial requires non-negative integer');
  if (n > 170) return Infinity; // JS Number overflow limit
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Clean floating point rounding errors (e.g. 0.1 + 0.2 -> 0.3)
export function sanitizeFloat(num: number, precision: number = 12): number {
  if (!Number.isFinite(num)) return num;
  const factor = Math.pow(10, precision);
  const rounded = Math.round(num * factor) / factor;
  return Number(rounded.toPrecision(12));
}

// Format numbers nicely with commas for display
export function formatDisplayNumber(val: number | string): string {
  if (val === '' || val === null || val === undefined) return '';
  const str = String(val);
  if (str === 'Error' || str === 'NaN' || str === 'Infinity' || str === '-Infinity') return str;

  // If scientific notation e.g. 1.23e+24
  if (str.includes('e') || str.includes('E')) {
    return str;
  }

  const parts = str.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  // Add commas to integer part
  const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return formattedInt + decimalPart;
}

// Format an entire expression for UI presentation
export function formatExpressionForDisplay(expr: string): string {
  return expr
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/(?<=\S)-(?=\S)/g, ' − ')
    .replace(/\^/g, ' ^ ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize mathematical expression
 */
type TokenType = 'NUMBER' | 'OP' | 'LPAREN' | 'RPAREN' | 'FUNC' | 'COMMA';

interface Token {
  type: TokenType;
  value: string;
}

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'sqrt', 'cbrt',
  'ln', 'log',
  'abs', 'fact'
]);

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.replace(/\s+/g, '');

  while (i < s.length) {
    const ch = s[i];

    // Numbers: digits, decimal point
    if (/\d/.test(ch) || (ch === '.' && i + 1 < s.length && /\d/.test(s[i + 1]))) {
      let numStr = ch;
      i++;
      while (i < s.length && (/[\d.]/.test(s[i]) || (s[i].toLowerCase() === 'e' && /[\d+-]/.test(s[i + 1] || '')))) {
        if (s[i].toLowerCase() === 'e') {
          numStr += s[i];
          i++;
          if (i < s.length && (s[i] === '+' || s[i] === '-')) {
            numStr += s[i];
            i++;
          }
        } else {
          numStr += s[i];
          i++;
        }
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Constants π and e
    if (ch === 'π' || ch === 'pi') {
      tokens.push({ type: 'NUMBER', value: String(Math.PI) });
      i++;
      continue;
    }

    // Single letter e (not part of a function like exp)
    if (ch === 'e' && (i + 1 >= s.length || !/[a-z]/i.test(s[i + 1])) && (i === 0 || !/[a-z0-9]/i.test(s[i - 1]))) {
      tokens.push({ type: 'NUMBER', value: String(Math.E) });
      i++;
      continue;
    }

    // Alphabetic function names (sin, cos, sqrt, etc.)
    if (/[a-zA-Z]/.test(ch)) {
      let name = '';
      while (i < s.length && /[a-zA-Z0-9]/.test(s[i])) {
        name += s[i];
        i++;
      }
      const lower = name.toLowerCase();
      if (lower === 'pi') {
        tokens.push({ type: 'NUMBER', value: String(Math.PI) });
      } else if (lower === 'e') {
        tokens.push({ type: 'NUMBER', value: String(Math.E) });
      } else if (FUNCTIONS.has(lower)) {
        tokens.push({ type: 'FUNC', value: lower });
      } else {
        throw new Error(`Unknown function or symbol: ${name}`);
      }
      continue;
    }

    // Parentheses
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Operators
    if (['+', '-', '*', '/', '×', '÷', '^', '%'].includes(ch)) {
      const op = ch === '×' ? '*' : ch === '÷' ? '/' : ch;

      // Check for unary minus vs binary minus
      const prev = tokens[tokens.length - 1];
      const isUnary = (op === '-' || op === '+') &&
        (!prev || prev.type === 'OP' || prev.type === 'LPAREN' || prev.type === 'COMMA');

      if (isUnary && op === '-') {
        // We can treat unary minus as multiplying by -1 or a unary token
        tokens.push({ type: 'OP', value: 'u-' });
      } else if (isUnary && op === '+') {
        // Unary plus does nothing
      } else {
        tokens.push({ type: 'OP', value: op });
      }
      i++;
      continue;
    }

    // Unknown char
    i++;
  }

  return tokens;
}

// Operator precedence
const PRECEDENCE: Record<string, { prec: number; assoc: 'L' | 'R' }> = {
  '+': { prec: 1, assoc: 'L' },
  '-': { prec: 1, assoc: 'L' },
  '*': { prec: 2, assoc: 'L' },
  '/': { prec: 2, assoc: 'L' },
  '%': { prec: 2, assoc: 'L' },
  'u-': { prec: 3, assoc: 'R' }, // Unary negation
  '^': { prec: 4, assoc: 'R' }   // Exponentiation
};

/**
 * Shunting Yard: Infix tokens to Postfix (RPN)
 */
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const opStack: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'NUMBER') {
      output.push(token);
      // Implicit multiplication: e.g. 5(2) or 5sin(30) or (2)(3)
      if (i + 1 < tokens.length) {
        const next = tokens[i + 1];
        if (next.type === 'LPAREN' || next.type === 'FUNC') {
          opStack.push({ type: 'OP', value: '*' });
        }
      }
    } else if (token.type === 'FUNC') {
      opStack.push(token);
    } else if (token.type === 'OP') {
      const o1 = token.value;
      const p1 = PRECEDENCE[o1];

      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.type === 'FUNC') {
          output.push(opStack.pop()!);
          continue;
        }
        if (top.type === 'OP') {
          const o2 = top.value;
          const p2 = PRECEDENCE[o2];
          if (!p1 || !p2) break;
          if ((p1.assoc === 'L' && p1.prec <= p2.prec) || (p1.assoc === 'R' && p1.prec < p2.prec)) {
            output.push(opStack.pop()!);
          } else {
            break;
          }
        } else {
          break;
        }
      }
      opStack.push(token);
    } else if (token.type === 'LPAREN') {
      opStack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundLparen = false;
      while (opStack.length > 0) {
        const top = opStack.pop()!;
        if (top.type === 'LPAREN') {
          foundLparen = true;
          break;
        }
        output.push(top);
      }
      if (!foundLparen) {
        throw new Error('Mismatched parentheses');
      }
      // If function is on top of opStack, pop it into output
      if (opStack.length > 0 && opStack[opStack.length - 1].type === 'FUNC') {
        output.push(opStack.pop()!);
      }
      // Implicit multiplication: e.g. (2)(3) or (2)5
      if (i + 1 < tokens.length) {
        const next = tokens[i + 1];
        if (next.type === 'NUMBER' || next.type === 'LPAREN' || next.type === 'FUNC') {
          opStack.push({ type: 'OP', value: '*' });
        }
      }
    }
  }

  while (opStack.length > 0) {
    const top = opStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('Mismatched parentheses');
    }
    output.push(top);
  }

  return output;
}

/**
 * Evaluate Postfix (RPN) tokens
 */
function evaluateRPN(rpn: Token[], angleMode: AngleMode): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'NUMBER') {
      const val = parseFloat(token.value);
      if (isNaN(val)) throw new Error('Invalid number');
      stack.push(val);
    } else if (token.type === 'OP') {
      if (token.value === 'u-') {
        if (stack.length < 1) throw new Error('Invalid expression syntax');
        const a = stack.pop()!;
        stack.push(-a);
        continue;
      }

      if (stack.length < 2) throw new Error('Invalid expression syntax');
      const b = stack.pop()!;
      const a = stack.pop()!;

      switch (token.value) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          if (b === 0) throw new Error('Cannot divide by zero');
          stack.push(a / b);
          break;
        case '%':
          stack.push(a % b);
          break;
        case '^':
          stack.push(Math.pow(a, b));
          break;
        default:
          throw new Error(`Unknown operator: ${token.value}`);
      }
    } else if (token.type === 'FUNC') {
      if (stack.length < 1) throw new Error('Missing function parameter');
      const arg = stack.pop()!;

      // Convert angles if in DEG mode
      const toRad = (radOrDeg: number) => angleMode === 'deg' ? (radOrDeg * Math.PI) / 180 : radOrDeg;
      const fromRad = (rad: number) => angleMode === 'deg' ? (rad * 180) / Math.PI : rad;

      switch (token.value) {
        case 'sin':
          stack.push(Math.sin(toRad(arg)));
          break;
        case 'cos':
          stack.push(Math.cos(toRad(arg)));
          break;
        case 'tan': {
          const cosVal = Math.cos(toRad(arg));
          if (Math.abs(cosVal) < 1e-15) throw new Error('Tan undefined for this angle');
          stack.push(Math.tan(toRad(arg)));
          break;
        }
        case 'asin':
          if (arg < -1 || arg > 1) throw new Error('Domain error for asin [-1, 1]');
          stack.push(fromRad(Math.asin(arg)));
          break;
        case 'acos':
          if (arg < -1 || arg > 1) throw new Error('Domain error for acos [-1, 1]');
          stack.push(fromRad(Math.acos(arg)));
          break;
        case 'atan':
          stack.push(fromRad(Math.atan(arg)));
          break;
        case 'sqrt':
          if (arg < 0) throw new Error('Square root of negative number');
          stack.push(Math.sqrt(arg));
          break;
        case 'cbrt':
          stack.push(Math.cbrt(arg));
          break;
        case 'ln':
          if (arg <= 0) throw new Error('ln requires positive number');
          stack.push(Math.log(arg));
          break;
        case 'log':
          if (arg <= 0) throw new Error('log10 requires positive number');
          stack.push(Math.log10(arg));
          break;
        case 'abs':
          stack.push(Math.abs(arg));
          break;
        case 'fact':
          stack.push(factorial(arg));
          break;
        default:
          throw new Error(`Unknown function: ${token.value}`);
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid calculation');
  }

  return stack[0];
}

/**
 * Main evaluation entry point
 */
export function calculateExpression(expression: string, angleMode: AngleMode = 'deg'): { result: string; numericResult: number; error?: string } {
  try {
    if (!expression || !expression.trim()) {
      return { result: '0', numericResult: 0 };
    }

    const tokens = tokenize(expression);
    if (tokens.length === 0) return { result: '0', numericResult: 0 };

    const rpn = toRPN(tokens);
    const rawVal = evaluateRPN(rpn, angleMode);

    if (isNaN(rawVal)) {
      return { result: 'Error', numericResult: NaN, error: 'Result is undefined' };
    }

    const sanitized = sanitizeFloat(rawVal);
    let strVal = String(sanitized);

    // If scientific notation is cleaner
    if (Math.abs(sanitized) > 1e14 || (Math.abs(sanitized) < 1e-7 && sanitized !== 0)) {
      strVal = sanitized.toExponential(8).replace(/\.?0+e/, 'e');
    }

    return {
      result: strVal,
      numericResult: sanitized
    };
  } catch (err: any) {
    return {
      result: 'Error',
      numericResult: NaN,
      error: err.message || 'Calculation error'
    };
  }
}

/**
 * Live preview calculation (returns null if expression is partial or invalid)
 */
export function tryPreviewCalculation(expression: string, angleMode: AngleMode = 'deg'): string | null {
  if (!expression || expression.trim().length === 0) return null;

  // Don't preview if it ends with an unclosed operator
  const trimmed = expression.trim();
  if (/[+\-*/^%]$/.test(trimmed)) return null;

  // Auto-close missing right parentheses for preview
  let openParenCount = 0;
  for (const char of trimmed) {
    if (char === '(') openParenCount++;
    if (char === ')') openParenCount--;
  }

  let testExpr = trimmed;
  if (openParenCount > 0) {
    testExpr += ')'.repeat(openParenCount);
  }

  const { result, error } = calculateExpression(testExpr, angleMode);
  if (error || result === 'Error' || result === trimmed) {
    return null;
  }

  return result;
}
