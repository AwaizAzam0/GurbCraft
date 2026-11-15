import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TopBar, type WorkspaceView } from './components/TopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { GrubViewport, type GrubSimulationMode } from './components/GrubViewport';
import { RightInspector, type InspectorTab } from './components/RightInspector';
import { AssetsPanel } from './components/AssetsPanel';
import { PresetsView } from './components/PresetsView';
import { InstallGuideView } from './components/InstallGuideView';
import { parseThemeTxt, serializeThemeTxt } from './grub/themeParser';
import { GRUB_PRESETS, RESOLUTION_PRESETS } from './grub/presets';
import { renderProceduralBackground } from './grub/backgroundGenerator';
import { OS_ICON_CLASSES } from './grub/iconLibrary';
import { iconToPngBytes, imageUrlToPngBytes } from './grub/pngExport';
import { buildZipArchive, type ZipEntryInput } from './grub/zipBuilder';
import { usePWAInstall, useOnlineStatus } from './hooks/usePWAInstall';
import { PWAInstallModal } from './components/PWAInstallModal';
import {
  ExportLogToast,
  type ExportLogEntry,
  type ExportStatusState,
} from './components/ExportLogToast';
import { WifiOff } from 'lucide-react';
import type { BootEntry, GrubPreset, OsIconClass } from './grub/types';

type MobileStudioPane = 'preview' | 'presets' | 'inspector';

function resolvePresetBackground(preset: GrubPreset): string {
  if (preset.backgroundUrl) return preset.backgroundUrl;
  if (preset.proceduralBg) {
    return renderProceduralBackground({
      ...preset.proceduralBg,
      width: 1280,
      height: 720,
    });
  }
  return '';
}

export default function App() {
  const initialPreset = GRUB_PRESETS[0];

  const [activeView, setActiveView] = useState<WorkspaceView>('studio');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('visual');
  const [mobilePane, setMobilePane] = useState<MobileStudioPane>('preview');

  const [activePresetId, setActivePresetId] = useState<string>(initialPreset.id);
  const [themeName, setThemeName] = useState<string>(initialPreset.id);
  const [rawThemeTxt, setRawThemeTxt] = useState<string>(initialPreset.themeTxt);

  const [backgroundUrl, setBackgroundUrl] = useState<string>(() =>
    resolvePresetBackground(initialPreset)
  );
  const [backgroundFileName, setBackgroundFileName] = useState<string>('background.png');
  const [customIcons, setCustomIcons] = useState<Partial<Record<OsIconClass, string>>>({});

  const [entries, setEntries] = useState<BootEntry[]>(initialPreset.entries);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [resolution, setResolution] = useState(RESOLUTION_PRESETS[0]);
  const [timeoutTotal, setTimeoutTotal] = useState<number>(initialPreset.timeoutSeconds);
  const [timeoutRemaining, setTimeoutRemaining] = useState<number>(
    initialPreset.timeoutSeconds
  );
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [simMode, setSimMode] = useState<GrubSimulationMode>('menu');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [exportState, setExportState] = useState<ExportStatusState>({
    status: 'idle',
    archiveName: '',
    summary: '',
    logs: [],
  });

  const {
    canPromptNatively,
    isInstalled,
    clientOS,
    offlineReady,
    triggerNativeInstall,
  } = usePWAInstall();
  const isOnline = useOnlineStatus();

  const parsed = useMemo(() => parseThemeTxt(rawThemeTxt), [rawThemeTxt]);

  useEffect(() => {
    if (!isTimerRunning || simMode !== 'menu' || activeView !== 'studio') {
      return;
    }
    const timer = window.setInterval(() => {
      setTimeoutRemaining((prev) => {
        if (prev <= 1) {
          setSimMode('booting');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isTimerRunning, simMode, activeView]);

  const handleSelectPreset = (preset: GrubPreset) => {
    setActivePresetId(preset.id);
    setThemeName(preset.id);
    setRawThemeTxt(preset.themeTxt);
    setBackgroundUrl(resolvePresetBackground(preset));
    setBackgroundFileName('background.png');
    setEntries(preset.entries);
    setSelectedIndex(0);
    setTimeoutTotal(preset.timeoutSeconds);
    setTimeoutRemaining(preset.timeoutSeconds);
    setSimMode('menu');
    setActiveView('studio');
    setMobilePane('preview');
    setImportStatus(null);
  };



  const handleUpdateGlobal = (key: string, value: string) => {
    const nextConfig = {
      ...parsed.config,
      globals: {
        ...parsed.config.globals,
        [key]: value,
      },
    };
    setRawThemeTxt(serializeThemeTxt(nextConfig));
  };

  const handleUpdateComponentProp = (compId: string, key: string, value: string) => {
    const nextComponents = parsed.config.components.map((comp) =>
      comp.id === compId
        ? {
            ...comp,
            properties: {
              ...comp.properties,
              [key]: value,
            },
          }
        : comp
    );
    setRawThemeTxt(
      serializeThemeTxt({
        ...parsed.config,
        components: nextComponents,
      })
    );
  };

  const handleAddEntry = (entry: BootEntry) => {
    setEntries((prev) => {
      const next = [...prev, entry];
      setSelectedIndex(next.length - 1);
      return next;
    });
    setIsTimerRunning(false);
    setSimMode('menu');
  };

  const handleUpdateEntry = (entryId: string, patch: Partial<BootEntry>) => {
    setEntries((prev) =>
      prev.map((item) => (item.id === entryId ? { ...item, ...patch } : item))
    );
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries((prev) => {
      const next = prev.filter((item) => item.id !== entryId);
      if (selectedIndex >= next.length) {
        setSelectedIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleUpdateEntryKernelLines = (entryId: string, lines: string[]) => {
    handleUpdateEntry(entryId, { kernelLines: lines });
  };

  const handleApplyBackground = (dataUrl: string, fileName: string) => {
    setBackgroundUrl(dataUrl);
    setBackgroundFileName(fileName);
    handleUpdateGlobal('desktop-image', fileName);
  };

  const handleImportFiles = (fileList: FileList) => {
    const files = Array.from(fileList);
    let loadedCount = 0;

    files.forEach((file) => {
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setRawThemeTxt(reader.result);
            setImportStatus(`Loaded ${file.name}`);
          }
        };
        reader.readAsText(file);
        loadedCount += 1;
      } else if (
        lower.endsWith('.png') ||
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.webp') ||
        lower.endsWith('.svg')
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== 'string') return;
          const baseName = lower.replace(/\.[^.]+$/, '') as OsIconClass;
          const isKnownIcon = OS_ICON_CLASSES.some((c) => c.id === baseName);

          if (isKnownIcon) {
            setCustomIcons((prev) => ({
              ...prev,
              [baseName]: reader.result as string,
            }));
          } else {
            setBackgroundUrl(reader.result);
            setBackgroundFileName(file.name);
            handleUpdateGlobal('desktop-image', file.name);
          }
          setImportStatus(`Imported ${files.length} asset(s)`);
        };
        reader.readAsDataURL(file);
        loadedCount += 1;
      }
    });

    if (loadedCount === 0) {
      setImportStatus('No supported theme.txt or image files found.');
    }
  };

  const handleExportZip = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    const folder = themeName.trim() || 'grub-theme';
    const archiveName = `${folder}.zip`;
    const nowTime = () =>
      new Date().toLocaleTimeString([], {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

    const appendLog = (
      level: ExportLogEntry['level'],
      message: string,
      summary?: string
    ) => {
      setExportState((prev) => ({
        ...prev,
        summary: summary ?? prev.summary,
        logs: [...prev.logs, { time: nowTime(), level, message }],
      }));
    };

    setExportState({
      status: 'building',
      archiveName,
      summary: 'Preparing GRUB2 theme bundle...',
      logs: [
        {
          time: nowTime(),
          level: 'info',
          message: `Starting export for "${folder}" (${resolution.width}x${resolution.height})`,
        },
      ],
    });

    try {
      const zipEntries: ZipEntryInput[] = [];

      const bgTargetName = backgroundFileName.endsWith('.png')
        ? backgroundFileName
        : 'background.png';
      const exportConfig = {
        ...parsed.config,
        globals: {
          ...parsed.config.globals,
          ...(backgroundUrl ? { 'desktop-image': bgTargetName } : {}),
        },
      };
      zipEntries.push({
        name: `${folder}/theme.txt`,
        data: serializeThemeTxt(exportConfig),
      });
      appendLog('info', `Serialized ${folder}/theme.txt`);

      if (backgroundUrl) {
        appendLog(
          'info',
          `Rasterizing ${bgTargetName} (${resolution.width}x${resolution.height})...`
        );
        const bgBytes = await imageUrlToPngBytes(
          backgroundUrl,
          resolution.width,
          resolution.height
        );
        zipEntries.push({
          name: `${folder}/${bgTargetName}`,
          data: bgBytes,
        });
        appendLog(
          'info',
          `Encoded ${bgTargetName} (${(bgBytes.byteLength / 1024).toFixed(1)} KB)`
        );
      } else {
        appendLog('info', 'Skipping background image (solid desktop-color active)');
      }

      appendLog('info', `Rasterizing ${OS_ICON_CLASSES.length} OS class icons (32x32 PNG)...`);
      for (const cls of OS_ICON_CLASSES) {
        const iconBytes = await iconToPngBytes(cls.id, customIcons[cls.id], 32);
        zipEntries.push({
          name: `${folder}/icons/${cls.id}.png`,
          data: iconBytes,
        });
      }

      zipEntries.push({
        name: `${folder}/INSTALL.txt`,
        data: [
          `GrubCraft Theme Bundle: ${folder} (By Awaiz Azam)`,
          `Target Resolution: ${resolution.width}x${resolution.height}`,
          '',
          '1. Copy this folder to /boot/grub/themes/ (or /boot/grub2/themes/ on Fedora/RHEL/openSUSE):',
          `   sudo cp -r ${folder} /boot/grub/themes/`,
          '',
          '2. Edit /etc/default/grub:',
          `   GRUB_GFXMODE=${resolution.width}x${resolution.height}`,
          `   GRUB_THEME="/boot/grub/themes/${folder}/theme.txt"`,
          '',
          '3. Update GRUB config:',
          '   Debian/Ubuntu: sudo update-grub',
          '   Arch/Alpine:   sudo grub-mkconfig -o /boot/grub/grub.cfg',
          '   Fedora/RPM:    sudo grub2-mkconfig -o /boot/grub2/grub.cfg',
          '',
        ].join('\n'),
      });
      appendLog('info', `Bundled ${folder}/INSTALL.txt`);

      const archiveBytes = buildZipArchive(zipEntries);
      const sizeKb = (archiveBytes.byteLength / 1024).toFixed(1);
      const blob = new Blob([archiveBytes.slice().buffer], {
        type: 'application/zip',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = archiveName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const finalSummary = `${zipEntries.length} files · ${sizeKb} KB ready`;
      setExportState((prev) => ({
        status: 'success',
        archiveName,
        summary: finalSummary,
        logs: [
          ...prev.logs,
          {
            time: nowTime(),
            level: 'success',
            message: `ZIP package built successfully: ${archiveName} (${finalSummary})`,
          },
        ],
      }));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown ZIP packaging error.';
      setExportState((prev) => ({
        status: 'error',
        archiveName,
        summary: errMsg,
        logs: [
          ...prev.logs,
          {
            time: nowTime(),
            level: 'error',
            message: `Export error: ${errMsg}`,
          },
        ],
      }));
    } finally {
      setIsExporting(false);
    }
  }, [
    isExporting,
    themeName,
    resolution.width,
    resolution.height,
    backgroundFileName,
    parsed.config,
    backgroundUrl,
    customIcons,
  ]);

  const exportFnRef = useRef(handleExportZip);
  useEffect(() => {
    exportFnRef.current = handleExportZip;
  }, [handleExportZip]);

  // Global Studio Keyboard Shortcuts:
  // - Alt+S: Trigger theme ZIP export (without Ctrl, Meta/Win, or Shift)
  // - ArrowUp / ArrowDown: Navigate boot entries in the simulator from anywhere in Studio
  useEffect(() => {
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void exportFnRef.current();
        return;
      }

      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (activeView !== 'studio' || simMode !== 'menu' || entries.length === 0) return;

      const activeEl = document.activeElement as HTMLElement | null;
      const tag = activeEl?.tagName;
      const isEditingInput =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        Boolean(activeEl?.isContentEditable);
      if (isEditingInput) return;

      // Avoid double-stepping if the preview screen itself received the event directly
      if (activeEl?.getAttribute('data-testid') === 'grub-screen-canvas') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % entries.length);
        setIsTimerRunning(false);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + entries.length) % entries.length);
        setIsTimerRunning(false);
      }
    };

    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, [activeView, simMode, entries.length]);

  const usedIconClasses = useMemo(
    () => Array.from(new Set(entries.map((e) => e.iconClass))),
    [entries]
  );

  return (
    <div
      className={`${
        activeView === 'studio' ? 'h-[100dvh] overflow-hidden' : 'min-h-screen lg:h-screen lg:overflow-hidden'
      } w-full flex flex-col bg-[#0B0D11] text-[#F1F5F9]`}
    >
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        onExportZip={handleExportZip}
        isExporting={isExporting}
        showInstallButton={!isInstalled}
        onInstallApp={async () => {
          if (canPromptNatively) {
            const accepted = await triggerNativeInstall();
            if (accepted) return;
          }
          setShowInstallModal(true);
        }}
      />

      {activeView === 'studio' && (
        <>
          {/* Mobile Studio Pane Switcher (< lg) */}
          <div className="lg:hidden px-3 py-2 border-b border-[#1E2430] bg-[#0F1218] flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobilePane('preview')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mobilePane === 'preview'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#161B24] text-[#94A3B8] hover:text-white'
              }`}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => {
                setMobilePane('presets');
              }}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mobilePane === 'presets'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#161B24] text-[#94A3B8] hover:text-white'
              }`}
            >
              Presets
            </button>
            <button
              type="button"
              onClick={() => setMobilePane('inspector')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mobilePane === 'inspector'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#161B24] text-[#94A3B8] hover:text-white'
              }`}
            >
              Edit
            </button>
          </div>

          <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <LeftSidebar
              className={mobilePane === 'presets' ? 'flex flex-1 lg:flex-initial' : 'hidden lg:flex'}
              themeName={themeName}
              onThemeNameChange={setThemeName}
              presets={GRUB_PRESETS}
              activePresetId={activePresetId}
              onSelectPreset={handleSelectPreset}
              onOpenAllPresets={() => setActiveView('presets')}
              backgroundFileName={backgroundFileName}
              customIconsCount={Object.keys(customIcons).length}
              usedIconClasses={usedIconClasses}
              onImportFiles={handleImportFiles}
              onOpenAssetStudio={() => setActiveView('assets')}
              onOpenCodeEditor={() => {
                setInspectorTab('code');
                setMobilePane('inspector');
              }}
              importStatus={importStatus}
            />

            <div
              className={
                mobilePane === 'preview'
                  ? 'flex-1 flex flex-col min-w-0 overflow-hidden'
                  : 'hidden lg:flex lg:flex-1 lg:flex-col lg:min-w-0 lg:overflow-hidden'
              }
            >
              <GrubViewport
                config={parsed.config}
                backgroundUrl={backgroundUrl}
                customIcons={customIcons}
                entries={entries}
                selectedIndex={selectedIndex}
                onSelectIndex={(idx) => {
                  setSelectedIndex(idx);
                  setIsTimerRunning(false);
                }}
                resolution={resolution}
                resolutions={RESOLUTION_PRESETS}
                onChangeResolution={setResolution}
                timeoutTotal={timeoutTotal}
                timeoutRemaining={timeoutRemaining}
                isTimerRunning={isTimerRunning}
                onToggleTimer={() => setIsTimerRunning((r) => !r)}
                onResetTimer={() => {
                  setTimeoutRemaining(timeoutTotal);
                  setIsTimerRunning(true);
                }}
                simMode={simMode}
                onChangeSimMode={setSimMode}
                onUpdateEntryKernelLines={handleUpdateEntryKernelLines}
                rawThemeTxt={rawThemeTxt}
                themeName={themeName}
              />
            </div>

            <RightInspector
              className={mobilePane === 'inspector' ? 'flex flex-1 lg:flex-initial' : 'hidden lg:flex'}
              activeTab={inspectorTab}
              onSelectTab={setInspectorTab}
              config={parsed.config}
              rawThemeTxt={rawThemeTxt}
              diagnostics={parsed.diagnostics}
              onRawThemeTxtChange={setRawThemeTxt}
              onUpdateGlobal={handleUpdateGlobal}
              onUpdateComponentProp={handleUpdateComponentProp}
              entries={entries}
              customIcons={customIcons}
              onAddEntry={handleAddEntry}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
              onOpenAssetStudio={() => setActiveView('assets')}
            />
          </main>
        </>
      )}

      {activeView === 'presets' && (
        <main className="flex-1 flex overflow-hidden">
          <PresetsView
            presets={GRUB_PRESETS}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
          />
        </main>
      )}

      {activeView === 'assets' && (
        <main className="flex-1 flex overflow-hidden">
          <AssetsPanel
            backgroundUrl={backgroundUrl}
            backgroundFileName={backgroundFileName}
            onApplyBackground={handleApplyBackground}
            customIcons={customIcons}
            onUploadIcon={(cls, dataUrl) =>
              setCustomIcons((prev) => ({ ...prev, [cls]: dataUrl }))
            }
            onResetIcon={(cls) =>
              setCustomIcons((prev) => {
                const next = { ...prev };
                delete next[cls];
                return next;
              })
            }
            onBackToStudio={() => setActiveView('studio')}
          />
        </main>
      )}

      {activeView === 'install' && (
        <main className="flex-1 flex overflow-hidden">
          <InstallGuideView
            themeName={themeName}
            resolution={resolution}
            onExportZip={handleExportZip}
            onBackToStudio={() => setActiveView('studio')}
          />
        </main>
      )}

      {showInstallModal && (
        <PWAInstallModal
          initialOS={clientOS}
          offlineReady={offlineReady}
          canPromptNatively={canPromptNatively}
          onTriggerNativeInstall={triggerNativeInstall}
          onClose={() => setShowInstallModal(false)}
        />
      )}

      {!isOnline && (
        <div
          role="status"
          className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg bg-[#161B24] border border-[#334155] px-3 py-1.5 text-xs font-medium text-[#E2E8F0] shadow-lg"
        >
          <WifiOff className="w-3.5 h-3.5 text-[#4ADE80]" aria-hidden="true" />
          Offline Mode — Running locally from cache
        </div>
      )}

      <ExportLogToast
        exportState={exportState}
        onDismiss={() =>
          setExportState((prev) => ({ ...prev, status: 'idle' }))
        }
      />
    </div>
  );
}
