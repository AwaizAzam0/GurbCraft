export type ProceduralStyle =
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

export interface ProceduralBackgroundOptions {
  style: ProceduralStyle;
  baseColor: string;
  accentColor: string;
  secondaryColor?: string;
  density: number; // 1 to 10
  grain: number; // 0 to 100
  width?: number;
  height?: number;
}

/**
 * Renders a procedural GRUB2 `background.png` directly onto an HTML5 canvas and returns a PNG data URL.
 */
export function renderProceduralBackground(opts: ProceduralBackgroundOptions): string {
  const width = opts.width ?? 1280;
  const height = opts.height ?? 720;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const secondary = opts.secondaryColor || opts.accentColor;

  // Base fill
  ctx.fillStyle = opts.baseColor;
  ctx.fillRect(0, 0, width, height);

  if (opts.style === 'horizon') {
    const grad = ctx.createLinearGradient(0, 0, width * 0.85, height);
    grad.addColorStop(0, opts.baseColor);
    grad.addColorStop(0.55, opts.accentColor + '33');
    grad.addColorStop(1, opts.baseColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const bands = Math.max(3, opts.density);
    for (let i = 0; i < bands; i++) {
      const y = height * (0.28 + (i / bands) * 0.65);
      ctx.strokeStyle = i % 2 === 0 ? opts.accentColor : secondary;
      ctx.globalAlpha = 0.1 + (i / bands) * 0.16;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        width * 0.3,
        y - 45 - i * 8,
        width * 0.7,
        y + 45 + i * 8,
        width,
        y - 12
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (opts.style === 'aurora') {
    const g1 = ctx.createRadialGradient(
      width * 0.25,
      height * 0.2,
      20,
      width * 0.25,
      height * 0.2,
      width * 0.65
    );
    g1.addColorStop(0, opts.accentColor + '66');
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const g2 = ctx.createRadialGradient(
      width * 0.78,
      height * 0.75,
      20,
      width * 0.78,
      height * 0.75,
      width * 0.6
    );
    g2.addColorStop(0, secondary + '55');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);

    const count = Math.max(2, Math.round(opts.density / 2));
    for (let i = 0; i < count; i++) {
      ctx.strokeStyle = i % 2 === 0 ? opts.accentColor : secondary;
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-40, height * (0.7 - i * 0.12));
      ctx.quadraticCurveTo(
        width * 0.45,
        height * (0.2 + i * 0.08),
        width + 40,
        height * (0.12 + i * 0.15)
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (opts.style === 'radial') {
    const rad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.42,
      width * 0.04,
      width * 0.5,
      height * 0.5,
      width * 0.78
    );
    rad.addColorStop(0, opts.accentColor + '4C');
    rad.addColorStop(0.45, secondary + '28');
    rad.addColorStop(1, opts.baseColor);
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, width, height);

    const rings = Math.max(2, Math.min(6, Math.round(opts.density / 2)));
    for (let i = 1; i <= rings; i++) {
      ctx.strokeStyle = opts.accentColor;
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, i * (height * 0.18), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (opts.style === 'mesh') {
    const g1 = ctx.createLinearGradient(0, 0, width, height);
    g1.addColorStop(0, opts.baseColor);
    g1.addColorStop(0.5, opts.accentColor + '44');
    g1.addColorStop(1, secondary + '44');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    // Architectural angular planes
    ctx.fillStyle = opts.accentColor;
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.moveTo(width * 0.55, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height * 0.72);
    ctx.lineTo(width * 0.35, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = secondary;
    ctx.globalAlpha = 0.09;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.35);
    ctx.lineTo(width * 0.65, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (opts.style === 'starfield') {
    // Deep nebula glow + comet trail + deterministic stars
    const neb = ctx.createRadialGradient(
      width * 0.72,
      height * 0.28,
      20,
      width * 0.72,
      height * 0.28,
      width * 0.65
    );
    neb.addColorStop(0, opts.accentColor + '50');
    neb.addColorStop(0.5, secondary + '22');
    neb.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, width, height);

    let seed = 4242;
    const starCount = 90 + opts.density * 18;
    for (let i = 0; i < starCount; i++) {
      seed = (seed * 16807) % 2147483647;
      const sx = (seed / 2147483647) * width;
      seed = (seed * 16807) % 2147483647;
      const sy = (seed / 2147483647) * height;
      seed = (seed * 16807) % 2147483647;
      const r = 0.6 + (seed / 2147483647) * 1.6;
      ctx.fillStyle = i % 7 === 0 ? opts.accentColor : '#FFFFFF';
      ctx.globalAlpha = 0.2 + (i % 5) * 0.14;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Comet streak
    ctx.globalAlpha = 0.7;
    const streakGrad = ctx.createLinearGradient(width * 0.65, height * 0.18, width * 0.88, height * 0.05);
    streakGrad.addColorStop(0, '#FFFFFF');
    streakGrad.addColorStop(0.3, opts.accentColor);
    streakGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.strokeStyle = streakGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.65, height * 0.18);
    ctx.lineTo(width * 0.88, height * 0.05);
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (opts.style === 'stripes') {
    const count = 4 + opts.density;
    const bandW = width / count;
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = i % 2 === 0 ? opts.accentColor : secondary;
      ctx.globalAlpha = 0.04 + (i % 3) * 0.03;
      ctx.beginPath();
      const x = i * bandW;
      ctx.moveTo(x, 0);
      ctx.lineTo(x + bandW * 0.65, 0);
      ctx.lineTo(x + bandW * 0.25, height);
      ctx.lineTo(x - bandW * 0.4, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (opts.style === 'waves') {
    const layers = 4 + Math.min(4, Math.round(opts.density / 2));
    for (let l = 0; l < layers; l++) {
      const baseY = height * (0.48 + (l / layers) * 0.42);
      ctx.fillStyle = l % 2 === 0 ? opts.accentColor : secondary;
      ctx.globalAlpha = 0.09 + l * 0.04;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY);
      for (let x = 0; x <= width; x += 40) {
        const y =
          baseY +
          Math.sin((x / width) * Math.PI * 3 + l * 1.3) * 28 +
          Math.cos((x / width) * Math.PI * 5 - l) * 14;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (opts.style === 'topo') {
    const rings = 5 + opts.density * 2;
    const cx = width * 0.72;
    const cy = height * 0.45;
    for (let i = 1; i <= rings; i++) {
      const r = i * (Math.min(width, height) * 0.045);
      ctx.strokeStyle = opts.accentColor;
      ctx.globalAlpha = Math.max(0.06, 0.3 - i * 0.01);
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.08) {
        const wobble = Math.sin(a * 3 + i * 0.5) * 14 + Math.cos(a * 5 - i * 0.3) * 8;
        const px = cx + Math.cos(a) * (r + wobble);
        const py = cy + Math.sin(a) * (r * 0.78 + wobble);
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (opts.style === 'grid') {
    const step = Math.max(24, Math.round(96 - opts.density * 6));
    ctx.strokeStyle = opts.accentColor;
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    const rad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      width * 0.1,
      width * 0.5,
      height * 0.5,
      width * 0.72
    );
    rad.addColorStop(0, 'rgba(0,0,0,0)');
    rad.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, width, height);
  } else if (opts.style === 'phosphor') {
    const rad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      20,
      width * 0.5,
      height * 0.5,
      width * 0.6
    );
    rad.addColorStop(0, opts.accentColor + '28');
    rad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, width, height);

    const lineGap = Math.max(3, 12 - opts.density);
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.25;
    for (let y = 0; y < height; y += lineGap) {
      ctx.fillRect(0, y, width, 1);
    }
    ctx.globalAlpha = 1;
  }

  // Subtle deterministic film grain
  if (opts.grain > 0) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const strength = (opts.grain / 100) * 24;
    let seed = 1337;
    for (let i = 0; i < data.length; i += 4) {
      seed = (seed * 16807) % 2147483647;
      const noise = (seed / 2147483647 - 0.5) * strength;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return canvas.toDataURL('image/png');
}
