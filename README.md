# RifaFlash - Plataforma de Concursos en Tiempo Real

Aplicación de rifas con el diseño oficial del logo: rayo dorado sobre fondo violeta/azul degradado, badge "100K".

![RifaFlash Logo](https://via.placeholder.com/200x200/7c3aed/ffffff?text=⚡100K)

## Diseño Visual

### Logo Oficial
- **Fondo**: Degradado violeta (#7c3aed) a azul (#3b82f6)
- **Rayo**: Dorado degradado (#fbbf24 a #d97706)
- **Badge**: "100K" en círculo blanco con borde dorado
- **Borde**: Dorado de 4px

### Paleta de Colores
```css
/* Primarios */
--violet-primary: #7c3aed;
--violet-light: #8b5cf6;
--blue-accent: #3b82f6;

/* Dorados */
--gold-primary: #fbbf24;
--gold-light: #fcd34d;
--gold-dark: #d97706;

/* Fondos */
--bg-dark: #0f0518;
--bg-gradient: linear-gradient(135deg, #0f0518 0%, #1a0a3e 50%, #0f0518 100%);
```

## Características

- ✅ Logo SVG animado con rayo dorado
- ✅ Splash screen con animación de entrada
- ✅ Integración completa con Telegram
- ✅ Alerta de sorteo cercano (5 números)
- ✅ Múltiples métodos de pago (Ualá/MP)
- ✅ Diseño 100% responsive
- ✅ PWA lista para instalar
- ✅ Preparada para APK de Android

## Configuración de Telegram

```
Bot Token: 8338989353:AAFVrhVX-8H2aCKCc1fDTVHYdmpk8ScQ3ic
Chat ID: 7850014359
```

## Instalación

```bash
npm install
npm run dev
```

## Generar APK

### Opción 1: PWA (Recomendada)
```bash
npm run build
# Desplegar en Vercel/Netlify
# Abrir en Chrome > Agregar a pantalla de inicio
```

### Opción 2: Capacitor (APK Nativa)
```bash
# 1. Instalar Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Inicializar
npx cap init RifaFlash com.rifaflash.app --web-dir dist

# 3. Build
npm run build

# 4. Sync
npx cap sync android

# 5. Abrir Android Studio
npx cap open android

# 6. Generar APK
# Build > Generate Signed Bundle/APK
```

## Generar Iconos

Los iconos se generan automáticamente desde el componente `Logo.tsx`. Para exportar:

```typescript
import { downloadPng, generateAllIcons } from './utils/icons';

// Generar un icono
downloadPng(512);

// Generar todos los tamaños PWA
generateAllIcons();
```

Tamaños necesarios:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

## Estructura

```
src/
├── components/
│   ├── Logo.tsx              # Logo SVG oficial
│   ├── SplashScreen.tsx      # Pantalla de carga
│   ├── NumberGrid.tsx
│   ├── PaymentModal.tsx
│   ├── NearRaffleAlert.tsx
│   └── WinnerAnimation.tsx
├── services/
│   └── telegram.ts           # Configuración lista
├── utils/
│   └── icons.ts              # Generador de iconos
└── App.tsx
```

## Flujo de Pago

1. Usuario selecciona número → Reservado
2. Paga por Ualá/MP → Notificación Telegram
3. Vos confirmás → Número Ocupado
4. Sorteo cercano (5 números) → Alerta + Notificación
5. Sorteo completo → Animación + Notificación ganador

## Mensajes Telegram

### Nueva compra:
```
🎫 NUEVA COMPRA - RIFAFLASH

👤 Cliente: [Nombre]
🆔 DNI: [DNI]
📱 Teléfono: [Teléfono]
💳 CVU/Alias: [Alias]
🔢 Número: #[XX]
💰 Monto: $3.000 ARS
💵 Método: [Ualá/MP]

Responder: CONFIRMAR [XX] o RECHAZAR [XX]
```

## Scripts Útiles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview
npm run preview

# Generar iconos (abrir consola del navegador y ejecutar)
generateAllIcons()
```

## Notas

- El logo se muestra en el header y splash screen
- La animación del rayo es opcional (prop `animated`)
- El badge "100K" está siempre visible
- Colores consistentes en toda la app

## Licencia

MIT