import React, { useState } from 'react';
import { Copy, Check, Plus, Trash2, AlertTriangle, Code2 } from 'lucide-react';
import { OS_ICON_CLASSES, OsIcon } from '../grub/iconLibrary';
import { serializeThemeTxt } from '../grub/themeParser';
import type {
  BootEntry,
  GrubComponent,
  GrubThemeConfig,
  OsIconClass,
  ParseDiagnostic,
} from '../grub/types';

export type InspectorTab = 'visual' | 'code' | 'entries';

interface RightInspectorProps {
  activeTab: InspectorTab;
  onSelectTab: (tab: InspectorTab) => void;
  config: GrubThemeConfig;
  rawThemeTxt: string;
  diagnostics: ParseDiagnostic[];
  onRawThemeTxtChange: (nextTxt: string) => void;
  onUpdateGlobal: (key: string, value: string) => void;
  onUpdateComponentProp: (compId: string, key: string, value: string) => void;
  entries: BootEntry[];
  customIcons?: Partial<Record<OsIconClass, string>>;
  onAddEntry: (entry: BootEntry) => void;
  onUpdateEntry: (entryId: string, patch: Partial<BootEntry>) => void;
  onDeleteEntry: (entryId: string) => void;
  onOpenAssetStudio: () => void;
  className?: string;
}

const ColorField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
}> = ({ id, label, value, onChange }) => {
  const safeHex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#1E293B';
  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={id} className="text-xs text-[#CBD5E1] truncate">
        {label}
      </label>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="color"
          aria-label={`${label} color picker`}
          value={safeHex}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-7 h-7 rounded border border-[#283142] bg-[#0B0D11] cursor-pointer p-0.5"
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-xs font-mono bg-[#0B0D11] border border-[#1E2430] rounded text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6]"
        />
      </div>
    </div>
  );
};

const TextField: React.FC<{
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
}> = ({ id, label, value, placeholder, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-xs text-[#94A3B8] mb-1">
      {label}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#0B0D11] border border-[#1E2430] rounded text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6]"
    />
  </div>
);

export const RightInspector: React.FC<RightInspectorProps> = ({
  activeTab,
  onSelectTab,
  config,
  rawThemeTxt,
  diagnostics,
  onRawThemeTxtChange,
  onUpdateGlobal,
  onUpdateComponentProp,
  entries,
  customIcons,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onOpenAssetStudio,
  className = '',
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryIcon, setNewEntryIcon] = useState<OsIconClass>('linux');
  const [entryError, setEntryError] = useState<string | null>(null);

  const bootMenu: GrubComponent | undefined = config.components.find(
    (c) => c.type === 'boot_menu'
  );
  const progressBar: GrubComponent | undefined = config.components.find(
    (c) => c.type === 'progress_bar'
  );
  const circularProgress: GrubComponent | undefined = config.components.find(
    (c) => c.type === 'circular_progress'
  );
  const firstLabel: GrubComponent | undefined = config.components.find(
    (c) => c.type === 'label'
  );

  const handleCopyThemeTxt = async () => {
    try {
      await navigator.clipboard.writeText(rawThemeTxt);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleFormatThemeTxt = () => {
    onRawThemeTxtChange(serializeThemeTxt(config));
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newEntryTitle.trim();
    if (!title) {
      setEntryError('Enter a menu entry title before adding.');
      return;
    }
    setEntryError(null);
    onAddEntry({
      id: `entry_${Date.now()}`,
      title,
      iconClass: newEntryIcon,
      kernelLines: [
        'insmod part_gpt',
        'insmod ext2',
        'linux /boot/vmlinuz-linux root=/dev/nvme0n1p2 rw quiet',
        'initrd /boot/initramfs-linux.img',
      ],
    });
    setNewEntryTitle('');
  };

  const lines = rawThemeTxt.split(/\r?\n/);
  const lineCount = lines.length;

  return (
    <aside
      className={`w-full lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#1E2430] bg-[#101319] flex flex-col overflow-hidden ${className}`}
    >
      {/* Inspector Tab Bar */}
      <div className="p-2 border-b border-[#1E2430] flex items-center gap-1 bg-[#0D1016]">
        {(['visual', 'code', 'entries'] as InspectorTab[]).map((tab) => {
          const active = activeTab === tab;
          const label =
            tab === 'visual' ? 'Visual' : tab === 'code' ? 'theme.txt' : 'Entries';
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onSelectTab(tab)}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#1E2430] text-[#F1F5F9]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Visual Property Controls */}
      {activeTab === 'visual' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Global Properties */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#F1F5F9]">Global Properties</h2>
              <button
                type="button"
                onClick={onOpenAssetStudio}
                className="text-[11px] font-medium text-[#60A5FA] hover:text-[#93C5FD] cursor-pointer"
              >
                Edit background.png
              </button>
            </div>
            <div className="space-y-2.5">
              <TextField
                id="global-title-text"
                label="title-text"
                value={config.globals['title-text'] ?? ''}
                placeholder='"" (hidden when using custom label)'
                onChange={(v) => onUpdateGlobal('title-text', v)}
              />
              <ColorField
                id="global-desktop-color"
                label="desktop-color"
                value={config.globals['desktop-color'] ?? '#0B1120'}
                onChange={(v) => onUpdateGlobal('desktop-color', v)}
              />
              <TextField
                id="global-desktop-image"
                label="desktop-image"
                value={config.globals['desktop-image'] ?? 'background.png'}
                onChange={(v) => onUpdateGlobal('desktop-image', v)}
              />
              <TextField
                id="global-terminal-font"
                label="terminal-font"
                value={config.globals['terminal-font'] ?? 'DejaVu Sans Mono Regular 16'}
                onChange={(v) => onUpdateGlobal('terminal-font', v)}
              />
            </div>
          </section>

          {/* Header Label Section */}
          {firstLabel && (
            <section className="pt-4 border-t border-[#1E2430] space-y-3">
              <h2 className="text-xs font-semibold text-[#F1F5F9]">Header Label</h2>
              <TextField
                id="label-text"
                label="text"
                value={firstLabel.properties.text ?? ''}
                onChange={(v) => onUpdateComponentProp(firstLabel.id, 'text', v)}
              />
              <ColorField
                id="label-color"
                label="color"
                value={firstLabel.properties.color ?? '#E2E8F0'}
                onChange={(v) => onUpdateComponentProp(firstLabel.id, 'color', v)}
              />
              <div className="grid grid-cols-2 gap-2.5">
                <TextField
                  id="label-top"
                  label="top"
                  value={firstLabel.properties.top ?? '14%'}
                  onChange={(v) => onUpdateComponentProp(firstLabel.id, 'top', v)}
                />
                <TextField
                  id="label-font"
                  label="font"
                  value={firstLabel.properties.font ?? 'Bricolage Grotesque SemiBold 24'}
                  onChange={(v) => onUpdateComponentProp(firstLabel.id, 'font', v)}
                />
              </div>
            </section>
          )}

          {/* Boot Menu Box Geometry & Colors */}
          {bootMenu && (
            <section className="pt-4 border-t border-[#1E2430] space-y-3">
              <h2 className="text-xs font-semibold text-[#F1F5F9]">Boot Menu (+ boot_menu)</h2>
              <div className="grid grid-cols-2 gap-2.5">
                <TextField
                  id="menu-left"
                  label="left"
                  value={bootMenu.properties.left ?? '50%-300'}
                  onChange={(v) => onUpdateComponentProp(bootMenu.id, 'left', v)}
                />
                <TextField
                  id="menu-top"
                  label="top"
                  value={bootMenu.properties.top ?? '27%'}
                  onChange={(v) => onUpdateComponentProp(bootMenu.id, 'top', v)}
                />
                <TextField
                  id="menu-width"
                  label="width"
                  value={bootMenu.properties.width ?? '600'}
                  onChange={(v) => onUpdateComponentProp(bootMenu.id, 'width', v)}
                />
                <TextField
                  id="menu-height"
                  label="height"
                  value={bootMenu.properties.height ?? '46%'}
                  onChange={(v) => onUpdateComponentProp(bootMenu.id, 'height', v)}
                />
                <TextField
                  id="menu-item-height"
                  label="item_height"
                  value={bootMenu.properties.item_height ?? '46'}
                  onChange={(v) => onUpdateComponentProp(bootMenu.id, 'item_height', v)}
                />
                <TextField
                  id="menu-item-spacing"
                  label="item_spacing"
                  value={bootMenu.properties.item_spacing ?? '8'}
                  onChange={(v) => onUpdateComponentProp(bootMenu.id, 'item_spacing', v)}
                />
              </div>
              <div className="space-y-2.5 pt-1">
                <ColorField
                  id="menu-item-color"
                  label="item_color"
                  value={bootMenu.properties.item_color ?? '#94A3B8'}
                  onChange={(v) => onUpdateComponentProp(bootMenu.id, 'item_color', v)}
                />
                <ColorField
                  id="menu-sel-color"
                  label="selected_item_color"
                  value={bootMenu.properties.selected_item_color ?? '#FFFFFF'}
                  onChange={(v) =>
                    onUpdateComponentProp(bootMenu.id, 'selected_item_color', v)
                  }
                />
                <ColorField
                  id="menu-sel-bg"
                  label="selected_item_bg_color"
                  value={bootMenu.properties.selected_item_bg_color ?? '#1E293B'}
                  onChange={(v) =>
                    onUpdateComponentProp(bootMenu.id, 'selected_item_bg_color', v)
                  }
                />
                <ColorField
                  id="menu-sel-border"
                  label="selected_item_border_color"
                  value={bootMenu.properties.selected_item_border_color ?? '#38BDF8'}
                  onChange={(v) =>
                    onUpdateComponentProp(bootMenu.id, 'selected_item_border_color', v)
                  }
                />
                <ColorField
                  id="menu-bg-color"
                  label="menu_bg_color"
                  value={bootMenu.properties.menu_bg_color ?? '#0F172A'}
                  onChange={(v) => onUpdateComponentProp(bootMenu.id, 'menu_bg_color', v)}
                />
              </div>
            </section>
          )}

          {/* Progress Bar Section */}
          {progressBar && (
            <section className="pt-4 border-t border-[#1E2430] space-y-3">
              <h2 className="text-xs font-semibold text-[#F1F5F9]">
                Countdown Bar (+ progress_bar)
              </h2>
              <TextField
                id="pb-text"
                label="text (%d = seconds)"
                value={progressBar.properties.text ?? 'Booting in %ds'}
                onChange={(v) => onUpdateComponentProp(progressBar.id, 'text', v)}
              />
              <div className="grid grid-cols-2 gap-2.5">
                <TextField
                  id="pb-top"
                  label="top"
                  value={progressBar.properties.top ?? '79%'}
                  onChange={(v) => onUpdateComponentProp(progressBar.id, 'top', v)}
                />
                <TextField
                  id="pb-width"
                  label="width"
                  value={progressBar.properties.width ?? '440'}
                  onChange={(v) => onUpdateComponentProp(progressBar.id, 'width', v)}
                />
              </div>
              <ColorField
                id="pb-fg"
                label="fg_color"
                value={progressBar.properties.fg_color ?? '#38BDF8'}
                onChange={(v) => onUpdateComponentProp(progressBar.id, 'fg_color', v)}
              />
              <ColorField
                id="pb-bg"
                label="bg_color"
                value={progressBar.properties.bg_color ?? '#1E293B'}
                onChange={(v) => onUpdateComponentProp(progressBar.id, 'bg_color', v)}
              />
            </section>
          )}

          {/* Circular Progress Section */}
          {circularProgress && (
            <section className="pt-4 border-t border-[#1E2430] space-y-3">
              <h2 className="text-xs font-semibold text-[#F1F5F9]">
                Countdown Ring (+ circular_progress)
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                <TextField
                  id="cp-left"
                  label="left"
                  value={circularProgress.properties.left ?? '50%-90'}
                  onChange={(v) => onUpdateComponentProp(circularProgress.id, 'left', v)}
                />
                <TextField
                  id="cp-top"
                  label="top"
                  value={circularProgress.properties.top ?? '34%'}
                  onChange={(v) => onUpdateComponentProp(circularProgress.id, 'top', v)}
                />
                <TextField
                  id="cp-width"
                  label="width"
                  value={circularProgress.properties.width ?? '180'}
                  onChange={(v) => onUpdateComponentProp(circularProgress.id, 'width', v)}
                />
                <TextField
                  id="cp-ticks"
                  label="num_ticks"
                  value={circularProgress.properties.num_ticks ?? '24'}
                  onChange={(v) => onUpdateComponentProp(circularProgress.id, 'num_ticks', v)}
                />
              </div>
              <ColorField
                id="cp-fg"
                label="ticks_color"
                value={circularProgress.properties.ticks_color ?? '#38BDF8'}
                onChange={(v) => onUpdateComponentProp(circularProgress.id, 'ticks_color', v)}
              />
              <ColorField
                id="cp-bg"
                label="center_color"
                value={circularProgress.properties.center_color ?? '#0F172A'}
                onChange={(v) => onUpdateComponentProp(circularProgress.id, 'center_color', v)}
              />
            </section>
          )}
        </div>
      )}

      {/* Tab 2: Live theme.txt Code Editor */}
      {activeTab === 'code' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#1E2430] flex items-center justify-between gap-2 bg-[#0D1016]">
            <span className="text-xs font-mono text-[#94A3B8] tabular-nums">
              theme.txt · {lineCount} lines
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFormatThemeTxt}
                className="px-2.5 py-1 text-xs font-medium text-[#CBD5E1] bg-[#161B24] hover:bg-[#1E2430] border border-[#283142] rounded inline-flex items-center gap-1 cursor-pointer"
              >
                <Code2 className="w-3 h-3" aria-hidden="true" />
                Format
              </button>
              <button
                type="button"
                onClick={handleCopyThemeTxt}
                className="px-2.5 py-1 text-xs font-medium text-[#CBD5E1] bg-[#161B24] hover:bg-[#1E2430] border border-[#283142] rounded inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-[#4ADE80]" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" aria-hidden="true" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-auto bg-[#0B0D11]">
            <div
              aria-hidden="true"
              className="py-4 pl-3 pr-2 text-right text-[11px] font-mono leading-relaxed text-[#475569] select-none border-r border-[#1E2430]/70 shrink-0 tabular-nums"
            >
              {lines.map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>
            <textarea
              aria-label="theme.txt source code editor"
              data-testid="theme-txt-editor"
              value={rawThemeTxt}
              onChange={(e) => onRawThemeTxtChange(e.target.value)}
              spellCheck={false}
              rows={Math.max(24, lineCount + 2)}
              className="flex-1 min-w-0 p-4 text-xs font-mono leading-relaxed bg-[#0B0D11] text-[#E2E8F0] focus:outline-none resize-none whitespace-pre overflow-x-auto"
            />
          </div>

          {diagnostics.length > 0 && (
            <div className="max-h-32 overflow-y-auto border-t border-[#1E2430] bg-[#161311] p-3 space-y-1.5">
              {diagnostics.map((d, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-[11px] ${
                    d.severity === 'error' ? 'text-[#FCA5A5]' : 'text-[#FCD34D]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="font-mono shrink-0">L{d.line}:</span>
                  <span>{d.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Simulated Boot Entries Manager */}
      {activeTab === 'entries' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <form onSubmit={handleCreateEntry} className="space-y-2.5 pb-4 border-b border-[#1E2430]">
            <h2 className="text-xs font-semibold text-[#F1F5F9]">Add Boot Entry</h2>
            <div>
              <input
                type="text"
                aria-label="New boot entry title"
                placeholder="e.g. Debian GNU/Linux 12"
                value={newEntryTitle}
                onChange={(e) => {
                  setNewEntryTitle(e.target.value);
                  if (entryError) setEntryError(null);
                }}
                className="w-full px-3 py-2 text-xs bg-[#0B0D11] border border-[#1E2430] rounded-lg text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6]"
              />
              {entryError && (
                <p role="alert" className="mt-1 text-[11px] text-[#FCA5A5]">
                  {entryError}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <select
                aria-label="OS icon class"
                value={newEntryIcon}
                onChange={(e) => setNewEntryIcon(e.target.value as OsIconClass)}
                className="flex-1 min-w-0 px-2.5 py-2 text-xs bg-[#0B0D11] border border-[#1E2430] rounded-lg text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6]"
              >
                {OS_ICON_CLASSES.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.label} ({cls.id}.png)
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-3 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg inline-flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2.5">
            <h2 className="text-xs font-semibold text-[#94A3B8]">
              Menu Entries ({entries.length})
            </h2>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg bg-[#0D1016] border border-[#1E2430] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <OsIcon
                      iconClass={entry.iconClass}
                      customUrl={customIcons?.[entry.iconClass]}
                      size={18}
                    />
                    <input
                      type="text"
                      aria-label={`Edit title for ${entry.title}`}
                      value={entry.title}
                      onChange={(e) =>
                        onUpdateEntry(entry.id, { title: e.target.value })
                      }
                      className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[#F1F5F9] focus:outline-none border-b border-transparent focus:border-[#3B82F6]"
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${entry.title}`}
                    disabled={entries.length <= 1}
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-1 text-[#64748B] hover:text-[#F87171] disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-[#64748B]">
                    --class {entry.iconClass}
                  </span>
                  <select
                    aria-label={`Icon class for ${entry.title}`}
                    value={entry.iconClass}
                    onChange={(e) =>
                      onUpdateEntry(entry.id, {
                        iconClass: e.target.value as OsIconClass,
                      })
                    }
                    className="px-2 py-1 text-[11px] bg-[#0B0D11] border border-[#1E2430] rounded text-[#CBD5E1]"
                  >
                    {OS_ICON_CLASSES.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
