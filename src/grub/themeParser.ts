import type {
  GrubComponent,
  GrubComponentType,
  GrubThemeConfig,
  ParseDiagnostic,
  ParseThemeResult,
} from './types';

const VALID_COMPONENT_TYPES = new Set<GrubComponentType>([
  'boot_menu',
  'label',
  'progress_bar',
  'circular_progress',
  'image',
  'hbox',
  'vbox',
  'canvas',
]);

const GRUB_NAMED_COLORS: Record<string, string> = {
  black: '#000000',
  blue: '#0000AA',
  green: '#00AA00',
  cyan: '#00AAAA',
  red: '#AA0000',
  magenta: '#AA00AA',
  brown: '#AA5500',
  'light-gray': '#AAAAAA',
  'dark-gray': '#555555',
  'light-blue': '#5555FF',
  'light-green': '#55FF55',
  'light-cyan': '#55FFFF',
  'light-red': '#FF5555',
  'light-magenta': '#FF55FF',
  yellow: '#FFFF55',
  white: '#FFFFFF',
};

/**
 * Strips trailing comments starting with `#` outside of double quotes.
 */
function stripInlineComment(line: string): string {
  let inQuotes = false;
  let escaped = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === '#' && !inQuotes) {
      return line.slice(0, i);
    }
  }
  return line;
}

function unquoteValue(raw: string): string {
  const trimmed = raw.trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
  return trimmed;
}

function formatPropertyValue(value: string): string {
  // Numbers, booleans, and simple dimension expressions without spaces can remain unquoted or quoted cleanly
  if (/^(true|false|-?\d+)$/.test(value)) {
    return value;
  }
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function splitOutsideQuotesByBraces(line: string): string[] {
  const out: string[] = [];
  let buf = '';
  let quoteChar: '"' | "'" | null = null;
  let escaped = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (escaped) {
      buf += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\' && quoteChar) {
      buf += ch;
      escaped = true;
      continue;
    }
    if (ch === '"' || ch === "'") {
      if (quoteChar === ch) {
        quoteChar = null;
      } else if (!quoteChar) {
        quoteChar = ch;
      }
      buf += ch;
      continue;
    }

    if (!quoteChar && (ch === '{' || ch === '}')) {
      if (ch === '{') {
        out.push((buf + '{').trim());
        buf = '';
      } else {
        if (buf.trim()) out.push(buf.trim());
        out.push('}');
        buf = '';
      }
      continue;
    }

    buf += ch;
  }

  if (buf.trim()) out.push(buf.trim());
  return out;
}

function splitMultipleAssignmentsOutsideQuotes(line: string): string[] {
  // Only split if line is a property list (not a `+ comp {` header and not `}`)
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('+') || trimmed === '{' || trimmed === '}') {
    return [trimmed];
  }

  // Build mask of character indices that are outside quotes
  const outsideQuote = new Array<boolean>(trimmed.length).fill(true);
  let quoteChar: '"' | "'" | null = null;
  let escaped = false;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (escaped) {
      outsideQuote[i] = false;
      escaped = false;
      continue;
    }
    if (ch === '\\' && quoteChar) {
      outsideQuote[i] = false;
      escaped = true;
      continue;
    }
    if (ch === '"' || ch === "'") {
      outsideQuote[i] = false;
      if (quoteChar === ch) {
        quoteChar = null;
      } else if (!quoteChar) {
        quoteChar = ch;
      }
      continue;
    }
    if (quoteChar) {
      outsideQuote[i] = false;
    }
  }

  const starts: number[] = [];
  const regex = /(?:^|\s)([a-zA-Z_][a-zA-Z0-9_-]*)\s*=/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(trimmed)) !== null) {
    const keyOffset = match[0].indexOf(match[1]);
    const keyStart = match.index + keyOffset;
    if (outsideQuote[keyStart]) {
      starts.push(keyStart);
    }
  }

  if (starts.length <= 1) return [trimmed];

  const parts: string[] = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1] : trimmed.length;
    const slice = trimmed.slice(start, end).trim();
    if (slice) parts.push(slice);
  }
  return parts;
}

/**
 * Parses a GRUB2 `theme.txt` source string into a structured AST and diagnostics list.
 */
export function parseThemeTxt(source: string): ParseThemeResult {
  const globals: Record<string, string> = {};
  const components: GrubComponent[] = [];
  const diagnostics: ParseDiagnostic[] = [];

  const stack: GrubComponent[] = [];
  let componentCounter = 0;

  const rawLines = source.split(/\r?\n/);
  const lines: string[] = [];
  for (const rawLine of rawLines) {
    const noComment = stripInlineComment(rawLine).trim();
    if (!noComment) {
      lines.push('');
      continue;
    }
    const braceSplit = splitOutsideQuotesByBraces(noComment);
    for (const seg of braceSplit) {
      lines.push(...splitMultipleAssignmentsOutsideQuotes(seg));
    }
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const lineNum = idx + 1;
    const cleaned = lines[idx].trim();
    if (!cleaned) continue;

    // Closing brace for component block
    if (cleaned === '}') {
      if (stack.length === 0) {
        diagnostics.push({
          line: lineNum,
          severity: 'error',
          message: 'Unexpected closing brace "}" without matching component block.',
        });
      } else {
        stack.pop();
      }
      continue;
    }

    // Opening component block: `+ boot_menu {` or `+ label {`
    const blockMatch = cleaned.match(/^\+\s*([a-zA-Z0-9_]+)\s*\{?$/);
    if (blockMatch) {
      const rawType = blockMatch[1] as GrubComponentType;
      const hasOpenBrace = cleaned.endsWith('{');

      if (!VALID_COMPONENT_TYPES.has(rawType)) {
        diagnostics.push({
          line: lineNum,
          severity: 'warning',
          message: `Unknown GRUB component type "+ ${rawType}".`,
        });
      }

      if (!hasOpenBrace) {
        // Look ahead to see if next non-empty line is `{`
        let foundBrace = false;
        for (let look = idx + 1; look < lines.length; look++) {
          const nextClean = stripInlineComment(lines[look]).trim();
          if (!nextClean) continue;
          if (nextClean === '{') {
            foundBrace = true;
            idx = look;
          }
          break;
        }
        if (!foundBrace) {
          diagnostics.push({
            line: lineNum,
            severity: 'error',
            message: `Component "+ ${rawType}" is missing an opening "{".`,
          });
          continue;
        }
      }

      componentCounter += 1;
      const comp: GrubComponent = {
        id: `${rawType}_${componentCounter}`,
        type: VALID_COMPONENT_TYPES.has(rawType) ? rawType : 'label',
        properties: {},
        ...(rawType === 'hbox' || rawType === 'vbox' || rawType === 'canvas'
          ? { children: [] }
          : {}),
      };

      if (stack.length > 0) {
        const parent = stack[stack.length - 1];
        parent.children = parent.children ?? [];
        parent.children.push(comp);
      } else {
        components.push(comp);
      }

      stack.push(comp);
      continue;
    }

    // Stray opening brace
    if (cleaned === '{') {
      diagnostics.push({
        line: lineNum,
        severity: 'warning',
        message: 'Unexpected "{" outside component header.',
      });
      continue;
    }

    // Property assignment inside a component (`key = value`) or global (`key: value`)
    const currentComp = stack[stack.length - 1];
    if (currentComp) {
      const eqMatch = cleaned.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.+)$/);
      const colonMatch = !eqMatch ? cleaned.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.+)$/) : null;
      const match = eqMatch || colonMatch;

      if (!match) {
        diagnostics.push({
          line: lineNum,
          severity: 'warning',
          message: `Could not parse component property: "${cleaned}". Expected "key = value".`,
        });
        continue;
      }

      const key = match[1].trim();
      const val = unquoteValue(match[2]);
      currentComp.properties[key] = val;
    } else {
      const colonMatch = cleaned.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.+)$/);
      const eqMatch = !colonMatch ? cleaned.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.+)$/) : null;
      const match = colonMatch || eqMatch;

      if (!match) {
        diagnostics.push({
          line: lineNum,
          severity: 'warning',
          message: `Could not parse global property: "${cleaned}". Expected "key: value".`,
        });
        continue;
      }

      const key = match[1].trim();
      const val = unquoteValue(match[2]);
      globals[key] = val;
    }
  }

  if (stack.length > 0) {
    diagnostics.push({
      line: lines.length,
      severity: 'error',
      message: `Unclosed component block "+ ${stack[stack.length - 1].type}" missing "}".`,
    });
  }

  return {
    config: { globals, components },
    diagnostics,
  };
}

function serializeComponent(comp: GrubComponent, indentLevel: number): string[] {
  const indent = '  '.repeat(indentLevel);
  const innerIndent = '  '.repeat(indentLevel + 1);
  const lines: string[] = [`${indent}+ ${comp.type} {`];

  for (const [key, val] of Object.entries(comp.properties)) {
    lines.push(`${innerIndent}${key} = ${formatPropertyValue(val)}`);
  }

  if (comp.children && comp.children.length > 0) {
    for (const child of comp.children) {
      lines.push('');
      lines.push(...serializeComponent(child, indentLevel + 1));
    }
  }

  lines.push(`${indent}}`);
  return lines;
}

/**
 * Serializes a structured GrubThemeConfig back into valid GRUB2 `theme.txt` text.
 */
export function serializeThemeTxt(config: GrubThemeConfig): string {
  const lines: string[] = ['# GRUB2 Theme Configuration', '# Generated by GrubCraft', ''];

  for (const [key, val] of Object.entries(config.globals)) {
    lines.push(`${key}: ${formatPropertyValue(val)}`);
  }

  for (const comp of config.components) {
    lines.push('');
    lines.push(...serializeComponent(comp, 0));
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Evaluates a GRUB2 coordinate/dimension string such as `"50%-250"`, `"18%+10"`, `"80%"`, or `"400"`.
 */
export function evalGrubDimension(
  expr: string | number | undefined,
  containerSize: number,
  fallback = 0
): number {
  if (expr === undefined || expr === null || expr === '') return fallback;
  if (typeof expr === 'number') return Number.isFinite(expr) ? expr : fallback;

  const cleaned = expr.replace(/\s+/g, '');
  if (!cleaned) return fallback;

  // Match optional signed percentage followed by optional signed pixel offset, or pure pixels
  const match = cleaned.match(/^([+-]?\d+(?:\.\d+)?)%([+-]\d+(?:\.\d+)?)?$/);
  if (match) {
    const pct = parseFloat(match[1]);
    const px = match[2] ? parseFloat(match[2]) : 0;
    return Math.round((pct / 100) * containerSize + px);
  }

  // Pure pixel value (or simple sum like `100+20`)
  const pxOnly = cleaned.match(/^([+-]?\d+(?:\.\d+)?)$/);
  if (pxOnly) {
    return Math.round(parseFloat(pxOnly[1]));
  }

  return fallback;
}

/**
 * Resolves GRUB color strings (`#fff`, `#1e293b`, `white`, `light-gray`) to valid CSS hex.
 */
export function normalizeGrubColor(color: string | undefined, fallback = '#FFFFFF'): string {
  if (!color) return fallback;
  const trimmed = color.trim().toLowerCase();
  if (GRUB_NAMED_COLORS[trimmed]) {
    return GRUB_NAMED_COLORS[trimmed];
  }
  if (/^#[0-9a-f]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed.split('');
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  if (/^#[0-9a-f]{6}$/.test(trimmed) || /^#[0-9a-f]{8}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return fallback;
}

/**
 * Extracts font size in px from GRUB font specifications like `"DejaVu Sans Regular 18"` or `"JetBrains Mono 22"`.
 */
export function parseGrubFontSize(fontSpec: string | undefined, fallback = 16): number {
  if (!fontSpec) return fallback;
  const match = fontSpec.trim().match(/(\d{1,3})$/);
  if (match) {
    const size = parseInt(match[1], 10);
    if (size >= 8 && size <= 96) return size;
  }
  return fallback;
}
