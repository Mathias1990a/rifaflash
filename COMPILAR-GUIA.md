# 🚀 COMPILAR RIFAFASH - GUÍA RÁPIDA

## MÉTODO 1: Script Automático (Recomendado)

### Windows:
1. **Abre CMD** como Administrador
2. Navega a la carpeta del proyecto:
   ```cmd
   cd C:\Users\mathi\OneDrive\Escritorio\RifaFlash
   ```
3. **Ejecuta el script:**
   ```cmd
   COMPILAR-AHORA.bat
   ```

El script hará todo automáticamente:
- ✅ Verificar Node.js
- ✅ Instalar dependencias
- ✅ Compilar la app
- ✅ Generar carpeta `dist/`

---

## MÉTODO 2: Comandos Manuales

### Paso 1: Instalar Node.js
Si no lo tenés, descargalo de:
👉 https://nodejs.org (versión LTS)

Verificar instalación:
```bash
node --version   # Debe mostrar v18+ o v20+
npm --version    # Debe mostrar 9+
```

### Paso 2: Instalar dependencias
```bash
cd RifaFlash
npm install
```

### Paso 3: Compilar
```bash
npm run build
```

### Paso 4: Previsualizar
```bash
npm run preview
```
La app se abrirá en: **http://localhost:4173**

---

## 📁 RESULTADO

Después de compilar, tendrás:

```
RifaFlash/
├── dist/                    ← ESTA ES LA APP COMPILADA
│   ├── index.html          ← Página principal
│   ├── assets/
│   │   ├── index-xxx.js    ← Código JavaScript
│   │   ├── index-xxx.css   ← Estilos CSS
│   │   └── ...
│   └── ...
├── node_modules/           ← Dependencias
├── src/                    ← Código fuente
└── ...
```

---

## 🌐 PUBLICAR ONLINE

### Opción A: Vercel (Gratis - Más fácil)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd dist
vercel
```

### Opción B: Netlify (Gratis)
1. Andá a https://netlify.com
2. Arrastrá la carpeta `dist` a la página
3. ¡Listo! Te dan una URL

### Opción C: GitHub Pages
1. Subí el código a GitHub
2. Activá GitHub Pages en Settings
3. Seleccioná la carpeta `dist`

---

## 📱 GENERAR APK DE ANDROID

### Requisitos:
- Android Studio instalado
- Java JDK 17+

### Pasos:
```bash
# 1. Instalar Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Build web
npm run build

# 3. Inicializar Capacitor
npx cap init RifaFlash com.rifaflash.app --web-dir dist

# 4. Agregar plataforma Android
npx cap add android

# 5. Sincronizar
npx cap sync android

# 6. Abrir en Android Studio
npx cap open android

# 7. En Android Studio:
#    Build → Generate Signed Bundle/APK → APK
```

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### Error "Cannot find module"
```bash
# Borrar todo y reinstalar
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Error de TypeScript
```bash
# Verificar tipos
npx tsc --noEmit
```

### Error de memoria
```bash
# Aumentar memoria de Node
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

### Limpiar caché
```bash
npm cache clean --force
```

---

## 🎨 GENERAR ICONOS

Los iconos se generan automáticamente. Para crearlos:

1. Abrir la app compilada en navegador
2. F12 → Consola
3. Ejecutar:
```javascript
import { generateAllIcons } from './utils/icons';
generateAllIcons();
```

O usar el generador online:
👉 https://favicon.io/favicon-converter/

---

## ✅ CHECKLIST PRE-COMPILACIÓN

- [ ] Node.js instalado (v18+)
- [ ] Todos los archivos en `src/`
- [ ] `package.json` presente
- [ ] Token de Telegram configurado en `src/services/telegram.ts`
- [ ] Espacio en disco (mínimo 500MB)

---

## 🆘 AYUDA

Si tenés problemas:

1. **Leer error completo**: Copiá el mensaje de error
2. **Verificar Node**: `node --version`
3. **Limpiar e intentar de nuevo**: Borrar `node_modules` y `npm install`
4. **Consultar documentación**: https://vitejs.dev/guide/

---

**¡LISTO PARA COMPILAR!** 🚀

Ejecutá `COMPILAR-AHORA.bat` y seguí las instrucciones.