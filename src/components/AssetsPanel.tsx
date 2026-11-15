import React, { useMemo, useRef, useState } from 'react';
import { Upload, Wand2, Download, RotateCcw, ArrowLeft } from 'lucide-react';
import {
  renderProceduralBackground,
  type ProceduralStyle,
} from '../grub/backgroundGenerator';
import { OS_ICON_CLASSES, OsIcon } from '../grub/iconLibrary';
import { CURATED_WALLPAPERS } from '../grub/presets';
import type { OsIconClass } from '../grub/types';

interface AssetsPanelProps {
  backgroundUrl: string;
  backgroundFileName: string;
  onApplyBackground: (dataUrl: string, fileName: string) => void;
  customIcons: Partial<Record<OsIconClass, string>>;
  onUploadIcon: (iconClass: OsIconClass, dataUrl: string) => void;
  onResetIcon: (iconClass: OsIconClass) => void;
  onBackToStudio: () => void;
}

const PROCEDURAL_STYLES: { id: ProceduralStyle; label: string }[] = [
  { id: 'horizon', label: 'Horizon Waves' },
  { id: 'aurora', label: 'Aurora Ribbons' },
  { id: 'radial', label: 'Radial Glow' },
  { id: 'mesh', label: 'Soft Mesh' },
  { id: 'starfield', label: 'Starfield Comet' },
  { id: 'waves', label: 'Layered Waves' },
  { id: 'stripes', label: 'Diagonal Stripes' },
  { id: 'topo', label: 'Topographic' },
  { id: 'grid', label: 'Engineering Grid' },
  { id: 'phosphor', label: 'Phosphor CRT' },
];

export const AssetsPanel: React.FC<AssetsPanelProps> = ({
  backgroundUrl,
  backgroundFileName,
  onApplyBackground,
  customIcons,
  onUploadIcon,
  onResetIcon,
  onBackToStudio,
}) => {
  const bgUploadRef = useRef<HTMLInputElement>(null);
  const [style, setStyle] = useState<ProceduralStyle>('horizon');
  const [baseColor, setBaseColor] = useState('#0B1120');
  const [accentColor, setAccentColor] = useState('#38BDF8');
  const [density, setDensity] = useState(6);
  const [grain, setGrain] = useState(25);

  const generatedPreviewUrl = useMemo(
    () =>
      renderProceduralBackground({
        style,
        baseColor,
        accentColor,
        density,
        grain,
        width: 960,
        height: 540,
      }),
    [style, baseColor, accentColor, density, grain]
  );

  const handleUploadBgFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onApplyBackground(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAndApply = () => {
    const fullRes = renderProceduralBackground({
      style,
      baseColor,
      accentColor,
      density,
      grain,
      width: 1920,
      height: 1080,
    });
    onApplyBackground(fullRes, 'background.png');
  };

  const handleDownloadGeneratedPng = () => {
    const fullRes = renderProceduralBackground({
      style,
      baseColor,
      accentColor,
      density,
      grain,
      width: 1920,
      height: 1080,
    });
    const a = document.createElement('a');
    a.href = fullRes;
    a.download = 'background.png';
    a.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#1E2430]">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#F1F5F9]">
            Theme Assets & background.png Studio
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Upload custom wallpapers, synthesize procedural 1920×1080 background.png files, or customize OS icons.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToStudio}
          className="px-4 py-2 text-xs font-medium text-[#E2E8F0] bg-[#161B24] hover:bg-[#1E2430] border border-[#283142] rounded-lg inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Back to Live Studio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Background Studio */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F1F5F9]">
              Active Wallpaper ({backgroundFileName})
            </h2>
            <div>
              <input
                ref={bgUploadRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadBgFile(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => bgUploadRef.current?.click()}
                className="px-3.5 py-2 text-xs font-medium text-white bg-[#1E2430] hover:bg-[#283142] rounded-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                Upload Image
              </button>
            </div>
          </div>

          <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#283142] bg-[#0F1218]">
            {backgroundUrl ? (
              <img
                src={backgroundUrl}
                alt="Active GRUB theme background"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#64748B]">
                No desktop-image active (using solid desktop-color)
              </div>
            )}
          </div>

          {/* Curated Wallpapers */}
          <div>
            <h3 className="text-xs font-semibold text-[#94A3B8] mb-3">
              Curated Studio Wallpapers
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {CURATED_WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => onApplyBackground(wp.url, 'background.png')}
                  className="group text-left rounded-lg overflow-hidden border border-[#1E2430] hover:border-[#3B82F6] transition-colors cursor-pointer bg-[#101319]"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={wp.url}
                      alt={wp.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="px-2.5 py-1.5 text-xs text-[#CBD5E1] truncate">
                    {wp.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Procedural background.png Maker */}
          <div className="p-5 rounded-xl bg-[#101319] border border-[#1E2430] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#F1F5F9]">
                Procedural background.png Maker
              </h3>
              <span className="text-xs font-mono text-[#64748B]">1920×1080 PNG</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div className="aspect-video rounded-lg overflow-hidden border border-[#283142]">
                <img
                  src={generatedPreviewUrl}
                  alt="Procedural background preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-1.5">
                  {PROCEDURAL_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStyle(st.id)}
                      className={`px-2.5 py-1.5 text-xs rounded-md border text-left transition-colors cursor-pointer ${
                        style === st.id
                          ? 'bg-[#2563EB]/20 border-[#3B82F6] text-white'
                          : 'bg-[#0B0D11] border-[#1E2430] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-[#CBD5E1]">
                    <span>Base</span>
                    <input
                      type="color"
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="w-7 h-7 rounded bg-transparent border border-[#283142] cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#CBD5E1]">
                    <span>Accent</span>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-7 h-7 rounded bg-transparent border border-[#283142] cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span>Pattern Density ({density})</span>
                    <input
                      type="range"
                      min={2}
                      max={10}
                      value={density}
                      onChange={(e) => setDensity(Number(e.target.value))}
                      className="w-28 accent-[#3B82F6]"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span>Film Grain ({grain}%)</span>
                    <input
                      type="range"
                      min={0}
                      max={80}
                      value={grain}
                      onChange={(e) => setGrain(Number(e.target.value))}
                      className="w-28 accent-[#3B82F6]"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleGenerateAndApply}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />
                Apply as background.png
              </button>
              <button
                type="button"
                onClick={handleDownloadGeneratedPng}
                className="px-4 py-2 text-xs font-medium text-[#E2E8F0] bg-[#161B24] hover:bg-[#1E2430] border border-[#283142] rounded-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                Download PNG
              </button>
            </div>
          </div>
        </section>

        {/* OS Icon Pack Inspector */}
        <section className="lg:col-span-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[#F1F5F9]">
              OS Class Icons (icons/*.png)
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Every icon is rasterized to 32×32 PNG in the exported theme ZIP. Upload custom PNGs to override any OS class.
            </p>
          </div>

          <div className="divide-y divide-[#1E2430] border border-[#1E2430] rounded-xl bg-[#101319]">
            {OS_ICON_CLASSES.map((cls) => {
              const customUrl = customIcons[cls.id];
              return (
                <div
                  key={cls.id}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#0B0D11] border border-[#1E2430] flex items-center justify-center shrink-0">
                      <OsIcon iconClass={cls.id} customUrl={customUrl} size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#F1F5F9] truncate">
                        {cls.label}
                      </div>
                      <div className="text-[11px] font-mono text-[#64748B] truncate">
                        icons/{cls.id}.png
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="px-2.5 py-1 text-[11px] font-medium text-[#CBD5E1] bg-[#161B24] hover:bg-[#1E2430] border border-[#283142] rounded cursor-pointer">
                      Replace
                      <input
                        type="file"
                        accept="image/png,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              onUploadIcon(cls.id, reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    {customUrl && (
                      <button
                        type="button"
                        aria-label={`Reset ${cls.label} icon`}
                        onClick={() => onResetIcon(cls.id)}
                        className="p-1.5 text-[#94A3B8] hover:text-white bg-[#161B24] border border-[#283142] rounded cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

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
