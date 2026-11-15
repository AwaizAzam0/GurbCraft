import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Terminal,
  FileEdit,
  Monitor,
  Grid,
  ArrowLeft,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  evalGrubDimension,
  normalizeGrubColor,
  parseGrubFontSize,
} from '../grub/themeParser';
import { OsIcon } from '../grub/iconLibrary';
import type {
  BootEntry,
  GrubComponent,
  GrubThemeConfig,
  OsIconClass,
  ResolutionPreset,
} from '../grub/types';

export type GrubSimulationMode = 'menu' | 'edit' | 'cli' | 'booting';

interface GrubViewportProps {
  config: GrubThemeConfig;
  backgroundUrl: string;
  customIcons: Partial<Record<OsIconClass, string>>;
  entries: BootEntry[];
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
  resolution: ResolutionPreset;
  resolutions: ResolutionPreset[];
  onChangeResolution: (res: ResolutionPreset) => void;
  timeoutTotal: number;
  timeoutRemaining: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  simMode: GrubSimulationMode;
  onChangeSimMode: (mode: GrubSimulationMode) => void;
  onUpdateEntryKernelLines: (entryId: string, lines: string[]) => void;
  rawThemeTxt: string;
  themeName: string;
}

function expandKeymapText(text: string): string {
  return text
    .replace(
      /@KEYMAP_LONG@/g,
      "Use the ↑ and ↓ keys to select which entry is highlighted. Press enter to boot the selected OS, 'e' to edit the commands before booting or 'c' for a command-line."
    )
    .replace(
      /@KEYMAP_MIDDLE@/g,
      "Press enter to boot the selected OS, 'e' to edit the commands or 'c' for a command-line."
    )
    .replace(/@KEYMAP_SHORT@/g, '↑↓ Select · Enter Boot · E Edit · C Console');
}

function mapFontFamily(grubFontSpec: string | undefined): string {
  const lower = (grubFontSpec ?? '').toLowerCase();
  if (lower.includes('mono') || lower.includes('unifont') || lower.includes('courier')) {
    return '"DejaVu Sans Mono", "JetBrains Mono", ui-monospace, monospace';
  }
  if (lower.includes('bricolage')) {
    return '"Bricolage Grotesque", "DejaVu Sans", sans-serif';
  }
  return '"DejaVu Sans", "DM Sans", sans-serif';
}

export const GrubViewport: React.FC<GrubViewportProps> = ({
  config,
  backgroundUrl,
  customIcons,
  entries,
  selectedIndex,
  onSelectIndex,
  resolution,
  resolutions,
  onChangeResolution,
  timeoutTotal,
  timeoutRemaining,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  simMode,
  onChangeSimMode,
  onUpdateEntryKernelLines,
  rawThemeTxt,
  themeName,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const fullscreenStageRef = useRef<HTMLDivElement>(null);
  const menuListRef = useRef<HTMLDivElement>(null);
  const selectedBtnRef = useRef<HTMLButtonElement>(null);
  const [scale, setScale] = useState(0.5);
  const [showBounds, setShowBounds] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (simMode !== 'menu') return;
    const container = menuListRef.current;
    const item = selectedBtnRef.current;
    if (!container || !item) return;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    if (itemTop < container.scrollTop) {
      container.scrollTop = itemTop;
    } else if (itemBottom > container.scrollTop + container.clientHeight) {
      container.scrollTop = itemBottom - container.clientHeight;
    }
  }, [selectedIndex, entries.length, simMode]);

  // CLI state
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState<string[]>([
    'GNU GRUB  version 2.12',
    '',
    '   Minimal BASH-like line editing is supported. Type "help" for available commands.',
    '   Type "normal" or press Esc to return to the boot menu.',
    '',
  ]);

  // Edit entry state
  const activeEntry = entries[selectedIndex] ?? entries[0];
  const [editDraft, setEditDraft] = useState('');

  useEffect(() => {
    if (simMode === 'edit' && activeEntry) {
      setEditDraft(activeEntry.kernelLines.join('\n'));
    }
  }, [simMode, activeEntry]);

  // Compute responsive scale from container bounds
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateScale = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const sx = rect.width / resolution.width;
      const sy = rect.height / resolution.height;
      setScale(Math.min(sx, sy));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [resolution.width, resolution.height, isFullscreen]);

  // Sync browser native fullscreen exits (e.g. pressing Esc)
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const enterPreviewFullscreen = async () => {
    setIsFullscreen(true);
    const target = fullscreenStageRef.current;
    if (target?.requestFullscreen) {
      try {
        await target.requestFullscreen();
      } catch {
        // Fallback to fixed viewport-filling preview overlay when native fullscreen is blocked
      }
    }
  };

  const exitPreviewFullscreen = async () => {
    setIsFullscreen(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore
      }
    }
  };

  // Global keyboard handler while preview-only fullscreen is active
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';

      if (e.key === 'Escape') {
        e.preventDefault();
        if (simMode !== 'menu') {
          onChangeSimMode('menu');
        } else {
          void exitPreviewFullscreen();
        }
        return;
      }

      if (isTyping || simMode !== 'menu') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (entries.length > 0) onSelectIndex((selectedIndex + 1) % entries.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (entries.length > 0) {
          onSelectIndex((selectedIndex - 1 + entries.length) % entries.length);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onChangeSimMode('booting');
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        onChangeSimMode('edit');
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        onChangeSimMode('cli');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen, simMode, entries.length, selectedIndex, onSelectIndex, onChangeSimMode]);

  // Keyboard interaction when focused inside the GRUB screen
  const handleScreenKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (simMode === 'edit' || simMode === 'cli') {
      if (e.key === 'Escape') {
        e.preventDefault();
        onChangeSimMode('menu');
      }
      return;
    }

    if (simMode === 'booting') {
      if (e.key === 'Escape') {
        e.preventDefault();
        onChangeSimMode('menu');
      }
      return;
    }

    if (e.key === 'Escape' && isFullscreen) {
      e.preventDefault();
      void exitPreviewFullscreen();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (entries.length > 0) {
        onSelectIndex((selectedIndex + 1) % entries.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (entries.length > 0) {
        onSelectIndex((selectedIndex - 1 + entries.length) % entries.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onChangeSimMode('booting');
    } else if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      onChangeSimMode('edit');
    } else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      onChangeSimMode('cli');
    }
  };

  const handleRunCliCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.trim();
    const nextLines = [...cliHistory, `grub> ${cmd}`];

    if (!cmd) {
      setCliHistory(nextLines);
      setCliInput('');
      return;
    }

    const lower = cmd.toLowerCase();
    if (lower === 'help') {
      nextLines.push(
        'Available commands: ls, videoinfo, cat theme.txt, set, clear, normal, reboot'
      );
    } else if (lower === 'ls') {
      nextLines.push('(hd0) (hd0,gpt1) (hd0,gpt2) (hd1,gpt1)');
    } else if (lower === 'videoinfo') {
      nextLines.push(
        `Active mode: ${resolution.width}x${resolution.height}x32 (direct color)  Theme: ${themeName}`
      );
    } else if (lower === 'set') {
      nextLines.push(
        `gfxmode=${resolution.width}x${resolution.height}`,
        `theme=/boot/grub/themes/${themeName}/theme.txt`,
        `timeout=${timeoutTotal}`
      );
    } else if (lower.startsWith('cat')) {
      const previewLines = rawThemeTxt.split('\n').slice(0, 12);
      nextLines.push(...previewLines, '... (truncated)');
    } else if (lower === 'clear') {
      setCliHistory([]);
      setCliInput('');
      return;
    } else if (lower === 'normal' || lower === 'exit') {
      setCliInput('');
      onChangeSimMode('menu');
      return;
    } else if (lower === 'reboot') {
      setCliInput('');
      onResetTimer();
      onChangeSimMode('menu');
      return;
    } else {
      nextLines.push(`error: can't find command '${cmd}'. Type "help" for commands.`);
    }

    setCliHistory(nextLines);
    setCliInput('');
  };

  const desktopColor = normalizeGrubColor(config.globals['desktop-color'], '#0B1120');
  const titleText = config.globals['title-text'] ?? '';
  const titleColor = normalizeGrubColor(config.globals['title-color'], '#F8FAFC');
  const terminalFont = mapFontFamily(config.globals['terminal-font']);
  const terminalFontSize = parseGrubFontSize(config.globals['terminal-font'], 16);

  const renderComponent = (comp: GrubComponent) => {
    const p = comp.properties;
    const left = evalGrubDimension(p.left, resolution.width, 0);
    const top = evalGrubDimension(p.top, resolution.height, 0);
    const width = evalGrubDimension(p.width, resolution.width, 400);
    const height = evalGrubDimension(p.height, resolution.height, 200);

    const boundsOutline = showBounds
      ? 'outline-1 outline-dashed outline-[#38BDF8]/80'
      : '';

    if (comp.type === 'label') {
      const rawText = p.text ?? '';
      let text = expandKeymapText(rawText);
      if (comp.id === '__timeout__' || p.id === '__timeout__' || text.includes('%d')) {
        text = text.replace(/%d/g, String(timeoutRemaining));
      }
      const color = normalizeGrubColor(p.color, '#E2E8F0');
      const fontSize = parseGrubFontSize(p.font, 16);
      const align = (p.align as 'left' | 'center' | 'right') || 'left';

      return (
        <div
          key={comp.id}
          style={{
            position: 'absolute',
            left,
            top,
            width: p.width ? width : resolution.width - left,
            color,
            fontSize,
            fontFamily: mapFontFamily(p.font),
            textAlign: align,
            lineHeight: 1.35,
          }}
          className={`pointer-events-none select-none ${boundsOutline}`}
        >
          {text}
        </div>
      );
    }

    if (comp.type === 'boot_menu') {
      const itemColor = normalizeGrubColor(p.item_color, '#94A3B8');
      const selectedItemColor = normalizeGrubColor(p.selected_item_color, '#FFFFFF');
      const selectedBgRaw = p.selected_item_bg_color;
      const selectedBg =
        selectedBgRaw === 'transparent'
          ? 'transparent'
          : normalizeGrubColor(selectedBgRaw, '#1E293B');
      const selectedBorderRaw = p.selected_item_border_color;
      const selectedBorder =
        selectedBorderRaw === 'transparent'
          ? 'transparent'
          : normalizeGrubColor(selectedBorderRaw, '#38BDF8');

      const menuBgRaw = p.menu_bg_color;
      const menuBg =
        !menuBgRaw || menuBgRaw === 'transparent'
          ? null
          : normalizeGrubColor(menuBgRaw, '#0F172A');
      const menuBorderRaw = p.menu_border_color;
      const menuBorder =
        !menuBorderRaw || menuBorderRaw === 'transparent'
          ? null
          : normalizeGrubColor(menuBorderRaw, '#1E293B');

      const itemHeight = parseInt(p.item_height ?? '44', 10) || 44;
      const itemPadding = parseInt(p.item_padding ?? '14', 10) || 14;
      const itemSpacing = parseInt(p.item_spacing ?? '6', 10) || 6;
      const iconWidth = parseInt(p.icon_width ?? '26', 10) || 26;
      const itemIconSpace = parseInt(p.item_icon_space ?? '14', 10) || 14;
      const itemFontSize = parseGrubFontSize(p.item_font, 18);
      const itemFont = mapFontFamily(p.item_font);
      const selectedFont = mapFontFamily(p.selected_item_font || p.item_font);
      const showScrollbar = p.scrollbar !== 'false';

      const menuBgCss = menuBg
        ? menuBg.length === 9
          ? menuBg
          : `${menuBg}CC`
        : 'transparent';

      return (
        <div
          ref={menuListRef}
          key={comp.id}
          data-testid="grub-boot-menu"
          style={{
            position: 'absolute',
            left,
            top,
            width,
            height,
            backgroundColor: menuBgCss,
            border: menuBorder ? `1px solid ${menuBorder}` : 'none',
            borderRadius: p.menu_radius ? parseInt(p.menu_radius, 10) : 10,
            padding: itemPadding,
            backdropFilter: menuBg ? 'blur(10px)' : undefined,
          }}
          className={`overflow-y-auto overflow-x-hidden ${boundsOutline}`}
        >
          <div className="flex flex-col" style={{ gap: itemSpacing }}>
            {entries.map((entry, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={entry.id}
                  ref={isSelected ? selectedBtnRef : undefined}
                  type="button"
                  data-selected={isSelected ? 'true' : 'false'}
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => onSelectIndex(idx)}
                  onDoubleClick={() => onChangeSimMode('booting')}
                  style={{
                    height: itemHeight,
                    paddingLeft: itemPadding,
                    paddingRight: itemPadding,
                    color: isSelected ? selectedItemColor : itemColor,
                    backgroundColor: isSelected ? `${selectedBg}E6` : 'transparent',
                    border: isSelected
                      ? `1px solid ${selectedBorder}`
                      : '1px solid transparent',
                    borderRadius: 6,
                    fontFamily: isSelected ? selectedFont : itemFont,
                    fontSize: itemFontSize,
                    fontWeight: isSelected ? 600 : 400,
                    gap: itemIconSpace,
                  }}
                  className="w-full shrink-0 flex items-center text-left transition-colors cursor-pointer focus-visible:outline-none"
                >
                  <OsIcon
                    iconClass={entry.iconClass}
                    customUrl={customIcons[entry.iconClass]}
                    size={iconWidth}
                  />
                  <span className="truncate">{entry.title}</span>
                </button>
              );
            })}
          </div>
          {showScrollbar && entries.length > 5 && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: 6,
                top: 14,
                bottom: 14,
                width: parseInt(p.scrollbar_width ?? '4', 10) || 4,
                backgroundColor: `${itemColor}26`,
                borderRadius: 99,
              }}
            />
          )}
        </div>
      );
    }

    if (comp.type === 'progress_bar') {
      const fgColor = normalizeGrubColor(p.fg_color, '#38BDF8');
      const bgColor = normalizeGrubColor(p.bg_color, '#1E293B');
      const borderColor = normalizeGrubColor(p.border_color, '#334155');
      const textColor = normalizeGrubColor(p.text_color, '#F8FAFC');
      const fontSize = parseGrubFontSize(p.font, 13);
      const rawText = p.text ?? '%d seconds remaining';
      const labelText = rawText.replace(/%d/g, String(timeoutRemaining));
      const pct =
        timeoutTotal > 0 ? Math.max(0, Math.min(100, (timeoutRemaining / timeoutTotal) * 100)) : 0;

      return (
        <div
          key={comp.id}
          data-testid="grub-progress-bar"
          style={{
            position: 'absolute',
            left,
            top,
            width,
            height: Math.max(height, 22),
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: 6,
            overflow: 'hidden',
          }}
          className={`flex items-center justify-center ${boundsOutline}`}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct}%`,
              backgroundColor: fgColor,
              transition: 'width 350ms linear',
            }}
          />
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              color: textColor,
              fontSize,
              fontFamily: mapFontFamily(p.font),
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.45)',
            }}
            className="font-medium tabular-nums select-none px-2 truncate"
          >
            {labelText}
          </span>
        </div>
      );
    }

    if (comp.type === 'circular_progress') {
      const centerColor = normalizeGrubColor(p.center_color, '#1E293B');
      const tickColor = normalizeGrubColor(p.tick_color, '#38BDF8');
      const size = Math.min(width, height) || 96;
      const pct = timeoutTotal > 0 ? timeoutRemaining / timeoutTotal : 0;
      const radius = size * 0.4;
      const circ = 2 * Math.PI * radius;

      return (
        <div
          key={comp.id}
          style={{ position: 'absolute', left, top, width: size, height: size }}
          className={`flex items-center justify-center ${boundsOutline}`}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={centerColor}
              strokeWidth={6}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={tickColor}
              strokeWidth={6}
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </svg>
          <span className="absolute text-sm font-mono font-semibold text-white tabular-nums">
            {timeoutRemaining}
          </span>
        </div>
      );
    }

    if (comp.type === 'image') {
      return (
        <div
          key={comp.id}
          style={{
            position: 'absolute',
            left,
            top,
            width,
            height,
            border: '1px dashed rgba(148,163,184,0.4)',
          }}
          className={`flex items-center justify-center text-xs font-mono text-[#94A3B8] ${boundsOutline}`}
        >
          {p.file || 'image.png'}
        </div>
      );
    }

    return null;
  };

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-[#0B0D11]">
      {/* Viewport Toolbar */}
      <div className="px-3 sm:px-5 py-3 border-b border-[#1E2430] bg-[#0F1218] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Monitor className="w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
          <label htmlFor="resolution-select" className="sr-only">
            Target Display Resolution
          </label>
          <select
            id="resolution-select"
            value={`${resolution.width}x${resolution.height}`}
            onChange={(e) => {
              const found = resolutions.find(
                (r) => `${r.width}x${r.height}` === e.target.value
              );
              if (found) onChangeResolution(found);
            }}
            className="px-2.5 py-1.5 text-xs font-mono bg-[#161B24] border border-[#283142] rounded-md text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] cursor-pointer"
          >
            {resolutions.map((res) => (
              <option key={res.label} value={`${res.width}x${res.height}`}>
                {res.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowBounds((b) => !b)}
            aria-pressed={showBounds}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              showBounds
                ? 'bg-[#1D4ED8]/20 border-[#3B82F6] text-[#93C5FD]'
                : 'bg-[#161B24] border-[#283142] text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" aria-hidden="true" />
            Bounds
          </button>

          <button
            type="button"
            onClick={() => {
              if (isFullscreen) {
                void exitPreviewFullscreen();
              } else {
                void enterPreviewFullscreen();
              }
            }}
            aria-label="Open boot menu preview in fullscreen"
            title="Open boot menu preview in fullscreen (Esc to exit)"
            data-testid="preview-fullscreen-btn"
            className="px-2.5 py-1.5 text-xs font-medium rounded-md border bg-[#161B24] border-[#283142] text-[#CBD5E1] hover:text-white hover:border-[#3B82F6] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            Fullscreen
          </button>
        </div>

        {/* Simulation Mode & Timer Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center bg-[#161B24] border border-[#283142] rounded-md p-0.5">
            <button
              type="button"
              onClick={() => onChangeSimMode('menu')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                simMode === 'menu'
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              Boot Menu
            </button>
            <button
              type="button"
              onClick={() => onChangeSimMode('edit')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                simMode === 'edit'
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <FileEdit className="w-3 h-3" aria-hidden="true" />
              Edit (e)
            </button>
            <button
              type="button"
              onClick={() => onChangeSimMode('cli')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                simMode === 'cli'
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <Terminal className="w-3 h-3" aria-hidden="true" />
              Console (c)
            </button>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-[#1E2430]">
            <button
              type="button"
              onClick={onToggleTimer}
              aria-label={isTimerRunning ? 'Pause countdown timer' : 'Resume countdown timer'}
              className="p-1.5 rounded-md bg-[#161B24] border border-[#283142] text-[#CBD5E1] hover:text-white cursor-pointer"
            >
              {isTimerRunning ? (
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={onResetTimer}
              aria-label="Reset countdown timer"
              className="p-1.5 rounded-md bg-[#161B24] border border-[#283142] text-[#CBD5E1] hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <span className="text-xs font-mono text-[#94A3B8] tabular-nums min-w-[36px] text-right">
              {timeoutRemaining}s
            </span>
          </div>
        </div>
      </div>

      {/* Live Scaled GRUB2 Monitor Frame (Preview-only Fullscreen Container) */}
      <div className="flex-1 p-3 sm:p-5 flex flex-col items-center justify-start lg:justify-center overflow-hidden min-h-[240px] lg:min-h-[380px]">
        <div
          ref={fullscreenStageRef}
          data-testid="grub-preview-stage-wrapper"
          className={
            isFullscreen
              ? 'fixed inset-0 z-50 bg-[#05070B] p-2 sm:p-4 flex flex-col items-center justify-center'
              : 'w-full lg:h-full aspect-video lg:aspect-auto flex items-center justify-center relative'
          }
        >
          {isFullscreen && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <span className="hidden sm:inline px-2.5 py-1 rounded-md bg-black/70 border border-white/15 text-[11px] font-mono text-[#CBD5E1] backdrop-blur-sm">
                ↑/↓ Select · Enter Boot · E Edit · C Console · Esc Exit
              </span>
              <button
                type="button"
                onClick={() => void exitPreviewFullscreen()}
                aria-label="Exit fullscreen preview"
                data-testid="exit-preview-fullscreen-btn"
                className="px-3 py-1.5 rounded-lg bg-[#101319]/90 hover:bg-[#1E2430] border border-[#334155] text-xs font-medium text-white inline-flex items-center gap-1.5 shadow-lg backdrop-blur-sm cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                Exit Fullscreen
              </button>
            </div>
          )}

          <div
            ref={stageRef}
            className="w-full h-full flex items-center justify-center relative"
          >
            <div
              tabIndex={0}
              role="application"
              aria-label="Interactive GRUB2 Bootloader Preview"
              onKeyDown={handleScreenKeyDown}
              data-testid="grub-screen-canvas"
              style={{
                width: resolution.width * scale,
                height: resolution.height * scale,
              }}
              className={`relative overflow-hidden shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${
                isFullscreen ? 'rounded border border-[#1E2430]' : 'rounded-lg border border-[#283142]'
              }`}
            >
            {/* Unscaled Native-Resolution GRUB Coordinate Surface */}
            <div
              style={{
                width: resolution.width,
                height: resolution.height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                backgroundColor: desktopColor,
              }}
              className="relative overflow-hidden"
            >
              {/* Background Image (`desktop-image`) */}
              {backgroundUrl && config.globals['desktop-image'] !== '' && (
                <img
                  src={backgroundUrl}
                  alt="GRUB background wallpaper"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                />
              )}

              {/* Global Title Text if defined */}
              {simMode === 'menu' && titleText && (
                <div
                  style={{
                    position: 'absolute',
                    top: 44,
                    left: 0,
                    right: 0,
                    color: titleColor,
                    fontSize: parseGrubFontSize(config.globals['title-font'], 26),
                    fontFamily: mapFontFamily(config.globals['title-font']),
                  }}
                  className="text-center font-semibold select-none pointer-events-none"
                >
                  {titleText}
                </div>
              )}

              {/* Mode 1: Boot Menu Components */}
              {simMode === 'menu' && config.components.map((comp) => renderComponent(comp))}

              {/* Mode 2: Edit Entry (`e`) */}
              {simMode === 'edit' && activeEntry && (
                <div
                  style={{
                    backgroundColor: 'rgba(6, 9, 15, 0.92)',
                    fontFamily: terminalFont,
                    fontSize: terminalFontSize + 2,
                  }}
                  className="absolute inset-0 p-16 flex flex-col text-[#E2E8F0]"
                >
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#334155]">
                    <span>GNU GRUB  version 2.12 — Editing: {activeEntry.title}</span>
                    <span className="text-[#94A3B8]">Esc: Return to Menu</span>
                  </div>
                  <textarea
                    value={editDraft}
                    onChange={(e) => {
                      setEditDraft(e.target.value);
                      onUpdateEntryKernelLines(activeEntry.id, e.target.value.split('\n'));
                    }}
                    spellCheck={false}
                    className="flex-1 w-full bg-[#0B0F17] border border-[#334155] rounded-lg p-6 text-[#A7F3D0] font-mono focus:outline-none focus:border-[#38BDF8] resize-none leading-relaxed"
                  />
                  <div className="mt-6 flex items-center justify-between text-[#94A3B8]">
                    <span>Modify kernel boot parameters above (changes persist in session)</span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => onChangeSimMode('menu')}
                        className="px-5 py-2.5 rounded bg-[#1E293B] text-white hover:bg-[#334155] cursor-pointer"
                      >
                        Cancel (Esc)
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeSimMode('booting')}
                        className="px-5 py-2.5 rounded bg-[#2563EB] text-white hover:bg-[#1D4ED8] cursor-pointer"
                      >
                        Boot Edited Entry (F10)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 3: GRUB CLI Console (`c`) */}
              {simMode === 'cli' && (
                <div
                  style={{
                    backgroundColor: 'rgba(5, 8, 13, 0.94)',
                    fontFamily: terminalFont,
                    fontSize: terminalFontSize + 2,
                  }}
                  className="absolute inset-0 p-16 flex flex-col text-[#E2E8F0]"
                >
                  <div className="flex-1 overflow-y-auto space-y-1.5 font-mono leading-relaxed">
                    {cliHistory.map((line, i) => (
                      <div key={i} className="whitespace-pre-wrap">
                        {line}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleRunCliCommand} className="mt-4 flex items-center gap-3">
                    <span className="text-[#38BDF8] font-mono shrink-0">grub&gt;</span>
                    <input
                      type="text"
                      value={cliInput}
                      onChange={(e) => setCliInput(e.target.value)}
                      autoFocus
                      placeholder="Try: help, ls, videoinfo, set, cat theme.txt, normal"
                      className="flex-1 bg-transparent border-b border-[#334155] py-2 text-white font-mono focus:outline-none focus:border-[#38BDF8]"
                    />
                  </form>
                </div>
              )}

              {/* Mode 4: Simulated Booting Screen */}
              {simMode === 'booting' && activeEntry && (
                <div
                  style={{
                    backgroundColor: '#05080D',
                    fontFamily: terminalFont,
                    fontSize: terminalFontSize + 2,
                  }}
                  className="absolute inset-0 p-20 flex flex-col justify-between text-[#CBD5E1]"
                >
                  <div className="space-y-4">
                    <div className="text-[#38BDF8] font-semibold">
                      Booting `{activeEntry.title}&apos;
                    </div>
                    <div className="space-y-1.5 text-[#94A3B8]">
                      {activeEntry.kernelLines.slice(0, 5).map((ln, idx) => (
                        <div key={idx}>{ln}</div>
                      ))}
                      <div className="text-[#4ADE80] pt-4">
                        [  OK  ] Loading initial ramdisk...
                      </div>
                      <div className="text-[#4ADE80]">
                        [  OK  ] Handing off control to kernel image.
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        onResetTimer();
                        onChangeSimMode('menu');
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#1E293B] text-white hover:bg-[#334155] cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      Return to GRUB Menu
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Quiet Keybind Hint Line */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 w-full max-w-3xl text-xs text-[#64748B]">
          <span className="min-w-0">
            ↑ / ↓ navigate entries · Enter boot · E edit · C console · Alt+S export ZIP
          </span>
          <span className="font-mono tabular-nums shrink-0">
            {resolution.width}×{resolution.height} · {Math.round(scale * 100)}%
          </span>
        </div>
      </div>
    </section>
  );
};
