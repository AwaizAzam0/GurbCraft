import React, { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { PRESET_CATEGORIES } from '../grub/presets';
import type { GrubPreset, PresetCategory } from '../grub/types';

interface PresetsViewProps {
  presets: GrubPreset[];
  activePresetId: string;
  onSelectPreset: (preset: GrubPreset) => void;
}

function getCardBackdropStyle(preset: GrubPreset): React.CSSProperties {
  if (preset.backgroundUrl) return {};
  const proc = preset.proceduralBg;
  if (!proc) return { backgroundColor: preset.baseColor };

  const sec = proc.secondaryColor || proc.accentColor;
  switch (proc.style) {
    case 'radial':
      return {
        background: `radial-gradient(circle at 50% 42%, ${proc.accentColor}4D 0%, ${sec}26 48%, ${proc.baseColor} 100%)`,
      };
    case 'aurora':
      return {
        background: `radial-gradient(circle at 20% 20%, ${proc.accentColor}59 0%, transparent 58%), radial-gradient(circle at 82% 80%, ${sec}4D 0%, transparent 55%), ${proc.baseColor}`,
      };
    case 'starfield':
      return {
        backgroundImage: `radial-gradient(1px 1px at 18% 25%, #fff 90%, transparent), radial-gradient(1.5px 1.5px at 78% 20%, ${proc.accentColor} 90%, transparent), radial-gradient(1px 1px at 62% 72%, #fff 85%, transparent), radial-gradient(1px 1px at 32% 68%, #fff 80%, transparent), radial-gradient(circle at 75% 24%, ${proc.accentColor}45 0%, ${sec}18 35%, transparent 65%)`,
        backgroundColor: proc.baseColor,
      };
    case 'waves':
      return {
        background: `linear-gradient(180deg, ${proc.baseColor} 0%, ${proc.baseColor} 45%, ${proc.accentColor}38 72%, ${sec}60 100%)`,
      };
    case 'stripes':
      return {
        backgroundImage: `repeating-linear-gradient(125deg, ${proc.accentColor}1A 0px, ${proc.accentColor}1A 18px, transparent 18px, transparent 42px)`,
        backgroundColor: proc.baseColor,
      };
    case 'mesh':
      return {
        background: `linear-gradient(135deg, ${proc.baseColor} 0%, ${proc.accentColor}44 50%, ${sec}3D 100%)`,
      };
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${proc.accentColor}22 1px, transparent 1px), linear-gradient(90deg, ${proc.accentColor}22 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        backgroundColor: proc.baseColor,
      };
    case 'topo':
      return {
        backgroundImage: `radial-gradient(circle at 75% 45%, transparent 24px, ${proc.accentColor}28 25px, transparent 26px, transparent 48px, ${proc.accentColor}22 49px, transparent 50px, transparent 72px, ${proc.accentColor}1A 73px, transparent 74px)`,
        backgroundColor: proc.baseColor,
      };
    case 'phosphor':
      return {
        backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.34) 0px, rgba(0,0,0,0.34) 1px, transparent 1px, transparent 4px), radial-gradient(circle at 50% 50%, ${proc.accentColor}30 0%, ${proc.baseColor} 80%)`,
        backgroundColor: proc.baseColor,
      };
    case 'horizon':
    default:
      return {
        background: `linear-gradient(145deg, ${proc.baseColor} 0%, ${proc.accentColor}36 55%, ${proc.baseColor} 100%)`,
      };
  }
}

const PresetThumbnailPreview: React.FC<{ preset: GrubPreset }> = ({ preset }) => {
  const isTransparent = preset.menuBgColor === 'transparent';
  const menuContainerStyle: React.CSSProperties = {
    backgroundColor: isTransparent ? 'transparent' : `${preset.menuBgColor}D9`,
    border: isTransparent ? 'none' : `1px solid ${preset.accentColor}45`,
  };
  const selectedRowStyle: React.CSSProperties = {
    backgroundColor: preset.selectedBgColor,
    color: preset.selectedTextColor,
    border: `1px solid ${preset.accentColor}`,
  };
  const itemRowStyle: React.CSSProperties = {
    color: preset.itemTextColor,
  };

  const rows = (
    <>
      <div
        className="h-4 rounded px-1.5 flex items-center text-[9px] font-medium truncate"
        style={selectedRowStyle}
      >
        Ubuntu 24.04 LTS
      </div>
      <div className="h-3.5 px-1.5 flex items-center text-[8px] truncate" style={itemRowStyle}>
        Arch Linux
      </div>
      <div className="h-3.5 px-1.5 flex items-center text-[8px] truncate" style={itemRowStyle}>
        Windows Boot
      </div>
    </>
  );

  if (preset.layoutStyle === 'left-dock') {
    return (
      <div className="absolute inset-0 p-3 flex items-center justify-start pointer-events-none">
        <div
          className="w-36 h-[78%] rounded-md p-2 flex flex-col justify-center gap-1 backdrop-blur-[2px]"
          style={menuContainerStyle}
        >
          {rows}
          <div className="mt-1 h-1 rounded-full overflow-hidden bg-black/30">
            <div className="h-full w-2/3" style={{ backgroundColor: preset.accentColor }} />
          </div>
        </div>
      </div>
    );
  }

  if (preset.layoutStyle === 'right-split') {
    return (
      <div className="absolute inset-0 p-3 flex items-center justify-between gap-2 pointer-events-none">
        <div className="w-[38%] pl-1 space-y-1">
          <div className="text-[9px] font-semibold leading-tight truncate" style={{ color: preset.accentColor }}>
            {preset.name}
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: preset.accentColor }} />
        </div>
        <div
          className="w-[56%] h-[76%] rounded-md p-2 flex flex-col justify-center gap-1 backdrop-blur-[2px]"
          style={menuContainerStyle}
        >
          {rows}
        </div>
      </div>
    );
  }

  if (preset.layoutStyle === 'bottom-shelf') {
    return (
      <div className="absolute inset-0 p-3 flex items-end justify-center pointer-events-none">
        <div className="w-full rounded-md px-2.5 py-2 space-y-0.5" style={menuContainerStyle}>
          {rows}
        </div>
      </div>
    );
  }

  if (preset.layoutStyle === 'circle-hud') {
    return (
      <div className="absolute inset-0 p-3 flex items-center justify-between gap-2 pointer-events-none">
        <div
          className="w-[58%] h-[74%] rounded-md p-2 flex flex-col justify-center gap-1"
          style={menuContainerStyle}
        >
          {rows}
        </div>
        <div className="w-11 h-11 rounded-full flex items-center justify-center mr-2 border-2" style={{ borderColor: preset.accentColor }}>
          <span className="text-[10px] font-mono font-bold" style={{ color: preset.accentColor }}>
            {preset.timeoutSeconds}
          </span>
        </div>
      </div>
    );
  }

  if (preset.layoutStyle === 'terminal-box') {
    return (
      <div className="absolute inset-0 p-3.5 flex items-center justify-center pointer-events-none">
        <div
          className="w-[82%] h-[78%] p-2 flex flex-col justify-between"
          style={{
            backgroundColor: `${preset.menuBgColor}EB`,
            border: `1px solid ${preset.accentColor}`,
          }}
        >
          <div className="space-y-1">{rows}</div>
          <div className="h-1 w-full bg-black/40">
            <div className="h-full w-3/4" style={{ backgroundColor: preset.accentColor }} />
          </div>
        </div>
      </div>
    );
  }

  if (preset.layoutStyle === 'wide-console') {
    return (
      <div className="absolute inset-0 p-3 flex items-center justify-center pointer-events-none">
        <div
          className="w-[88%] rounded-lg p-2.5 space-y-1 backdrop-blur-[2px]"
          style={menuContainerStyle}
        >
          {rows}
        </div>
      </div>
    );
  }

  // floating or centered-card
  return (
    <div className="absolute inset-0 p-4 flex items-center justify-center pointer-events-none">
      <div
        className="w-48 rounded-lg p-2 space-y-1 backdrop-blur-[2px]"
        style={menuContainerStyle}
      >
        {rows}
      </div>
    </div>
  );
};

export const PresetsView: React.FC<PresetsViewProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
}) => {
  const [category, setCategory] = useState<PresetCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return presets.filter((p) => {
      const catOk = category === 'all' || p.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.layoutStyle.toLowerCase().includes(q)
      );
    });
  }, [presets, category, query]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#1E2430]">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#F1F5F9]">
            GRUB2 Theme Presets ({presets.length})
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Distinct layouts (centered, left-dock, right-split, bottom-shelf, floating, circular HUD, terminal frame) with DejaVu Sans defaults.
          </p>
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search
            className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search preset gallery"
            placeholder="Search presets or layouts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#101319] border border-[#1E2430] rounded-lg text-[#F1F5F9] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {PRESET_CATEGORIES.map((cat) => {
          const isActive = category === cat.id;
          const count =
            cat.id === 'all'
              ? presets.length
              : presets.filter((p) => p.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#2563EB] border-[#2563EB] text-white'
                  : 'bg-[#101319] border-[#1E2430] text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-[#1E2430] rounded-xl bg-[#101319] space-y-3">
          <p className="text-sm text-[#CBD5E1]">No presets matched &quot;{query}&quot;.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-[#2563EB] rounded-lg cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((preset) => {
            const isCurrent = preset.id === activePresetId;

            return (
              <article
                key={preset.id}
                className={`rounded-xl overflow-hidden border transition-colors bg-[#101319] flex flex-col ${
                  isCurrent ? 'border-[#3B82F6]' : 'border-[#1E2430] hover:border-[#334155]'
                }`}
              >
                <div
                  className="aspect-video w-full overflow-hidden bg-[#0B0D11] relative"
                  style={getCardBackdropStyle(preset)}
                >
                  {preset.backgroundUrl && (
                    <img
                      src={preset.backgroundUrl}
                      alt={`${preset.name} theme backdrop`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <PresetThumbnailPreview preset={preset} />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-semibold text-[#F1F5F9]">
                      {preset.name}
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">
                      {preset.subtitle}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-[#64748B]">
                      <span className="truncate">{preset.author}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono shrink-0">{preset.layoutStyle}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono shrink-0">{preset.accentColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#1E2430]">
                    <span className="text-xs text-[#94A3B8]">
                      {isCurrent ? 'Active in Studio' : 'DejaVu Sans'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectPreset(preset)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      Load Theme
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <footer className="pt-4 pb-2 border-t border-[#1E2430] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
        <span>GrubCraft · Live GRUB2 Theme Studio</span>
        <a
          href="https://awaizazam0.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#60A5FA] transition-colors underline decoration-[#334155] underline-offset-2"
        >
          By Awaiz Azam
        </a>
      </footer>
    </div>
  );
};
