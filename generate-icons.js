// Script para generar íconos PNG de RifaFlash
// Ejecutar con: node generate-icons.js

const fs = require('fs');
const path = require('path');

// SVG base del ícono
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#4c1d95"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#bg)"/>
  <text x="50" y="65" font-size="45" text-anchor="middle" fill="#fbbf24" filter="url(#glow)">🏆</text>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, 'public');

console.log('Generando íconos para RifaFlash...\n');

sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✓ ${filename} generado (${size}x${size})`);
});

console.log('\n📁 Íconos SVG guardados en /public/');
console.log('\n⚠️  Para convertir a PNG, usa:');
console.log('   - Online: https://convertio.co/es/svg-png/');
console.log('   - O instala: npm install -g svgexport');
console.log('   - Y ejecuta: svgexport public/icon-192x192.svg public/icon-192x192.png');
