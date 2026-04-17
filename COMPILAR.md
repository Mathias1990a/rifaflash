# 🚀 COMPILAR RIFAFASH AHORA

## Opción 1: Script Automático (Recomendada)

### Windows (CMD):
```cmd
build.bat
```

### Windows (PowerShell):
```powershell
.\build.ps1
```

---

## Opción 2: Comandos Manuales

### 1. Instalar dependencias (primera vez):
```bash
npm install
```

### 2. Compilar:
```bash
npm run build
```

### 3. Previsualizar:
```bash
npm run preview
```

La app se abrirá en: **http://localhost:4173**

---

## 📁 Estructura después de compilar

```
rifaflash/
├── dist/                    ← Archivos compilados (listos para deploy)
│   ├── index.html
│   ├── assets/
│   │   ├── index-xxx.js
│   │   ├── index-xxx.css
│   │   └── ...
│   └── ...
├── node_modules/            ← Dependencias
├── src/
├── package.json
└── ...
```

---

## 🌐 Para publicar online:

### Opción A: Vercel (Gratis)
1. Crear cuenta en https://vercel.com
2. Instalar Vercel CLI: `npm i -g vercel`
3. Ejecutar: `vercel`

### Opción B: Netlify (Gratis)
1. Crear cuenta en https://netlify.com
2. Arrastrar carpeta `dist` a Netlify

### Opción C: GitHub Pages
1. Subir código a GitHub
2. Activar GitHub Pages en settings

---

## 📱 Para generar APK:

Ver guía completa en: **APK-GUIDE.md**

Resumen rápido:
```bash
# 1. Instalar Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Build
npm run build

# 3. Inicializar Capacitor
npx cap init RifaFlash com.rifaflash.app --web-dir dist

# 4. Agregar Android
npx cap add android

# 5. Sync
npx cap sync android

# 6. Abrir Android Studio
npx cap open android

# 7. En Android Studio: Build → Generate Signed Bundle/APK
```

---

## ⚠️ Solución de problemas

### Error "Cannot find module":
```bash
rm -rf node_modules
npm install
```

### Error de TypeScript:
```bash
npx tsc --noEmit
```

### Limpiar caché:
```bash
npm cache clean --force
```

---

## ✅ Checklist antes de compilar

- [ ] Node.js instalado (v18+)
- [ ] Todos los archivos en `src/`
- [ ] `package.json` correcto
- [ ] Token de Telegram configurado

---

## 🎨 Generar iconos

Abrir la app en navegador → F12 → Console:
```javascript
import { generateAllIcons } from './utils/icons';
generateAllIcons();
```

---

**¡Listo para compilar!** 🎉