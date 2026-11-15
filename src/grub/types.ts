export type GrubComponentType =
  | 'boot_menu'
  | 'label'
  | 'progress_bar'
  | 'circular_progress'
  | 'image'
  | 'hbox'
  | 'vbox'
  | 'canvas';

export interface GrubComponent {
  id: string;
  type: GrubComponentType;
  properties: Record<string, string>;
  children?: GrubComponent[];
}

export interface GrubThemeConfig {
  globals: Record<string, string>;
  components: GrubComponent[];
}

export interface ParseDiagnostic {
  line: number;
  severity: 'error' | 'warning';
  message: string;
}

export interface ParseThemeResult {
  config: GrubThemeConfig;
  diagnostics: ParseDiagnostic[];
}

export type OsIconClass =
  | 'ubuntu'
  | 'arch'
  | 'fedora'
  | 'debian'
  | 'manjaro'
  | 'endeavouros'
  | 'popos'
  | 'linuxmint'
  | 'opensuse'
  | 'nixos'
  | 'gentoo'
  | 'kali'
  | 'cachyos'
  | 'garuda'
  | 'alpine'
  | 'void'
  | 'nobara'
  | 'steamos'
  | 'zorin'
  | 'windows'
  | 'macos'
  | 'efi'
  | 'linux'
  | 'memtest';

export interface BootEntry {
  id: string;
  title: string;
  iconClass: OsIconClass;
  kernelLines: string[];
  isDefault?: boolean;
}

export interface ResolutionPreset {
  label: string;
  width: number;
  height: number;
}

export interface ThemeAssetsState {
  backgroundDataUrl: string;
  backgroundFileName: string;
  customIcons: Partial<Record<OsIconClass, string>>;
  extraFiles: Record<string, string>;
}

export type PresetCategory =
  | 'featured'
  | 'minimal-dark'
  | 'minimal-light'
  | 'glass-editorial'
  | 'aurora-gradient'
  | 'terminal-retro'
  | 'distro-inspired';

export interface PresetProceduralBg {
  style:
    | 'horizon'
    | 'topo'
    | 'grid'
    | 'phosphor'
    | 'aurora'
    | 'radial'
    | 'mesh'
    | 'starfield'
    | 'stripes'
    | 'waves';
  baseColor: string;
  accentColor: string;
  secondaryColor?: string;
  density: number;
  grain: number;
}

export type PresetLayoutKind =
  | 'centered-card'
  | 'left-dock'
  | 'right-split'
  | 'bottom-shelf'
  | 'floating'
  | 'wide-console'
  | 'circle-hud'
  | 'terminal-box';

export interface GrubPreset {
  id: string;
  name: string;
  subtitle: string;
  author: string;
  category: PresetCategory;
  layoutStyle: PresetLayoutKind;
  accentColor: string;
  baseColor: string;
  menuBgColor: string;
  selectedBgColor: string;
  selectedTextColor: string;
  itemTextColor: string;
  themeTxt: string;
  backgroundUrl: string;
  proceduralBg?: PresetProceduralBg;
  timeoutSeconds: number;
  entries: BootEntry[];
}
