import React, { useMemo, useRef, useState } from 'react';
import {
  FolderOpen,
  FileCode2,
  Image as ImageIcon,
  FolderTree,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import type { GrubPreset, OsIconClass } from '../grub/types';
import { OS_ICON_CLASSES } from '../grub/iconLibrary';

interface LeftSidebarProps {
  themeName: string;
  onThemeNameChange: (name: string) => void;
  presets: GrubPreset[];
  activePresetId: string;
  onSelectPreset: (preset: GrubPreset) => void;
  onOpenAllPresets: () => void;
  backgroundFileName: string;
  customIconsCount: number;
  usedIconClasses: OsIconClass[];
  onImportFiles: (files: FileList) => void;
  onOpenAssetStudio: () => void;
  onOpenCodeEditor: () => void;
  importStatus: string | null;
  className?: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  themeName,
  onThemeNameChange,
  presets,
  activePresetId,
  onSelectPreset,
  onOpenAllPresets,
  backgroundFileName,
  customIconsCount,
  onImportFiles,
  onOpenAssetStudio,
  onOpenCodeEditor,
  importStatus,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [presets, searchQuery]);

  return (
    <aside
      className={`w-full lg:w-[256px] min-h-0 shrink-0 border-b lg:border-b-0 lg:border-r border-[#1E2430] bg-[#101319] flex flex-col overflow-hidden ${className}`}
    >
      {/* Theme Project Identity */}
      <div className="p-3.5 border-b border-[#1E2430] shrink-0">
        <label
          htmlFor="theme-slug-input"
          className="block text-xs font-medium text-[#94A3B8] mb-1.5"
        >
          Theme Package Folder
        </label>
        <input
          id="theme-slug-input"
          type="text"
          value={themeName}
          onChange={(e) => onThemeNameChange(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '-'))}
          className="w-full px-3 py-1.5 text-xs font-mono bg-[#0B0D11] border border-[#1E2430] rounded-lg text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6]"
          placeholder="nordic-slate"
        />
      </div>

      {/* Quick Presets (scrollable list of 50+ presets with search) */}
      <div className="p-3.5 border-b border-[#1E2430] flex-1 min-h-[180px] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <h2 className="text-xs font-semibold text-[#94A3B8]">
            Presets ({presets.length})
          </h2>
          <button
            type="button"
            onClick={onOpenAllPresets}
            className="text-[11px] font-medium text-[#60A5FA] hover:text-[#93C5FD] inline-flex items-center gap-0.5 cursor-pointer"
          >
            Gallery
            <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>

        <div className="relative mb-2 shrink-0">
          <Search
            className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Filter presets"
            placeholder="Search 60+ presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#0B0D11] border border-[#1E2430] rounded-lg text-[#F1F5F9] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {filteredPresets.length === 0 ? (
            <p className="text-xs text-[#64748B] py-3 text-center">
              No matching presets
            </p>
          ) : (
            filteredPresets.map((preset) => {
              const active = preset.id === activePresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
                    active
                      ? 'bg-[#1B2230] text-[#F1F5F9] font-medium'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#161B24]'
                  }`}
                >
                  <span className="truncate">{preset.name}</span>
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 rounded-sm shrink-0 border border-white/15"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Theme File Tree */}
      <div className="p-3.5 border-b border-[#1E2430] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-[#94A3B8]">Package Contents</h2>
          <span className="text-[11px] font-mono text-[#64748B] tabular-nums">
            {3 + OS_ICON_CLASSES.length} files
          </span>
        </div>

        <div className="space-y-0.5 text-xs font-mono">
          <div className="flex items-center gap-2 px-2 py-1 text-[#CBD5E1]">
            <FolderTree className="w-3.5 h-3.5 text-[#64748B] shrink-0" aria-hidden="true" />
            <span className="truncate">{themeName || 'grub-theme'}/</span>
          </div>

          <button
            type="button"
            onClick={onOpenCodeEditor}
            className="w-full flex items-center gap-2 pl-6 pr-2 py-1 rounded text-[#CBD5E1] hover:bg-[#161B24] hover:text-white transition-colors cursor-pointer text-left"
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" aria-hidden="true" />
            <span className="truncate">theme.txt</span>
          </button>

          <button
            type="button"
            onClick={onOpenAssetStudio}
            className="w-full flex items-center gap-2 pl-6 pr-2 py-1 rounded text-[#CBD5E1] hover:bg-[#161B24] hover:text-white transition-colors cursor-pointer text-left"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#34D399] shrink-0" aria-hidden="true" />
            <span className="truncate">{backgroundFileName || 'background.png'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAssetStudio}
            className="w-full flex items-center justify-between gap-2 pl-6 pr-2 py-1 rounded text-[#94A3B8] hover:bg-[#161B24] hover:text-white transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-2 truncate">
              <FolderOpen className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" aria-hidden="true" />
              <span>icons/</span>
            </span>
            <span className="text-[11px] text-[#64748B] tabular-nums">
              {OS_ICON_CLASSES.length} png{customIconsCount > 0 ? ` · ${customIconsCount}` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Import Local Theme Files & Quiet Attribution */}
      <div className="p-3.5 shrink-0 space-y-2.5">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.png,.jpg,.jpeg,.webp,.svg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onImportFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-3 py-2 text-xs font-medium text-[#E2E8F0] bg-[#161B24] hover:bg-[#1E2430] border border-[#283142] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
        >
          <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
          Import theme.txt / PNGs
        </button>
        {importStatus && (
          <p className="text-[11px] text-[#94A3B8] leading-snug">{importStatus}</p>
        )}
        <p className="text-[11px] text-[#64748B] text-center pt-1">
          GrubCraft ·{' '}
          <a
            href="https://awaizazam0.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#60A5FA] transition-colors underline decoration-[#334155] underline-offset-2"
          >
            By Awaiz Azam
          </a>
        </p>
      </div>
    </aside>
  );
};
