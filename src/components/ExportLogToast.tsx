import React, {useState} from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Terminal,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

export interface ExportLogEntry {
  time: string;
  level: 'info' | 'success' | 'error';
  message: string;
}

export interface ExportStatusState {
  status: 'idle' | 'building' | 'success' | 'error';
  archiveName: string;
  summary: string;
  logs: ExportLogEntry[];
}

interface ExportLogToastProps {
  exportState: ExportStatusState;
  onDismiss: () => void;
}

export const ExportLogToast: React.FC<ExportLogToastProps> = ({
  exportState,
  onDismiss,
}) => {
  const [expanded, setExpanded] = useState(true);
  const logContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (expanded && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [exportState.logs.length, expanded]);

  if (exportState.status === 'idle') return null;

  const isSuccess = exportState.status === 'success';
  const isError = exportState.status === 'error';
  const isBuilding = exportState.status === 'building';

  return (
    <aside
      role="status"
      aria-live="polite"
      data-testid="export-log-console"
      className="fixed bottom-4 right-4 z-50 w-[min(380px,calc(100vw-2rem))] rounded-xl bg-[#101319] border border-[#283142] shadow-2xl overflow-hidden"
    >
      <div
        className={`px-3.5 py-2.5 flex items-center justify-between gap-2 border-b border-[#1E2430] ${
          isError ? 'bg-[#2A1215]' : isSuccess ? 'bg-[#0F1E18]' : 'bg-[#0F1522]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isBuilding && (
            <Loader2
              className="w-4 h-4 text-[#60A5FA] animate-spin shrink-0"
              aria-hidden="true"
            />
          )}
          {isSuccess && (
            <CheckCircle2
              className="w-4 h-4 text-[#4ADE80] shrink-0"
              aria-hidden="true"
            />
          )}
          {isError && (
            <AlertTriangle
              className="w-4 h-4 text-[#F87171] shrink-0"
              aria-hidden="true"
            />
          )}
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#F1F5F9] truncate">
              {isBuilding
                ? `Building ${exportState.archiveName}...`
                : isSuccess
                  ? `Built ${exportState.archiveName}`
                  : 'ZIP Export Failed'}
            </div>
            <div className="text-[11px] text-[#94A3B8] truncate">
              {exportState.summary}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? 'Collapse export log console' : 'Expand export log console'}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#1E2430] cursor-pointer"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close export log console"
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#1E2430] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {expanded && (
        <div
          ref={logContainerRef}
          className="max-h-40 overflow-y-auto bg-[#0B0D11] p-3 font-mono text-[11px] space-y-1"
        >
          <div className="flex items-center gap-1.5 text-[#64748B] pb-1 mb-1 border-b border-[#1E2430]">
            <Terminal className="w-3 h-3" aria-hidden="true" />
            <span>ZIP Build Console (Alt+S)</span>
          </div>
          {exportState.logs.map((entry, idx) => (
            <div
              key={idx}
              className={`leading-relaxed break-words ${
                entry.level === 'error'
                  ? 'text-[#FCA5A5]'
                  : entry.level === 'success'
                    ? 'text-[#4ADE80]'
                    : 'text-[#CBD5E1]'
              }`}
            >
              <span className="text-[#64748B] mr-1.5">[{entry.time}]</span>
              <span>{entry.message}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};
