// Iconos SVG para la PWA/APK
// Estos se pueden convertir a PNG usando herramientas online o Canvas

export const AppIconSVG = ({ size = 512 }: { size?: number }) => `
<svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <linearGradient id="bolt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
      <stop offset="70%" stop-color="transparent" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.3)" />
    </radialGradient>
  </defs>
  
  <rect width="200" height="200" rx="40" fill="url(#bg)" />
  <rect width="200" height="200" rx="40" fill="url(#shadow)" />
  <rect x="4" y="4" width="192" height="192" rx="36" fill="none" stroke="url(#bolt)" stroke-width="4" />
  
  <path d="M115 35 L75 95 L95 95 L85 145 L125 85 L105 85 L115 35 Z" fill="url(#bolt)" stroke="#f59e0b" stroke-width="2" />
  
  <g transform="translate(125, 115)">
    <circle cx="0" cy="0" r="28" fill="#ffffff" stroke="#fbbf24" stroke-width="3" />
    <circle cx="0" cy="0" r="25" fill="none" stroke="url(#bolt)" stroke-width="2" />
    <text x="0" y="5" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="16" fill="#1e1b4b">100K</text>
  </g>
</svg>
`;

// Función para descargar el icono como SVG
export function downloadIcon(size = 512) {
  const svg = AppIconSVG({ size });
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rifaflash-icon-${size}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Función para convertir SVG a Canvas (para PNG)
export function svgToCanvas(svgString: string, size: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svg);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, size, size);
        resolve(canvas);
      } else {
        reject(new Error('No se pudo obtener contexto 2D'));
      }
      URL.revokeObjectURL(url);
    };
    
    img.onerror = () => {
      reject(new Error('Error cargando imagen'));
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  });
}

// Función para descargar como PNG
export async function downloadPng(size = 512) {
  try {
    const svg = AppIconSVG({ size });
    const canvas = await svgToCanvas(svg, size);
    const link = document.createElement('a');
    link.download = `rifaflash-icon-${size}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generando PNG:', error);
  }
}

// Tamaños necesarios para PWA
export const PWA_ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Generar todos los iconos
export async function generateAllIcons() {
  for (const size of PWA_ICON_SIZES) {
    await downloadPng(size);
  }
}