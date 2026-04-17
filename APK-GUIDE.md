# Guía para generar la APK de RifaFlash

## Opción 1: Progressive Web App (PWA) - Recomendada

La forma más sencilla es usar la app como PWA, que se puede "instalar" en Android/iOS.

### Pasos:

1. **Desplegar la app** en Vercel, Netlify o cualquier hosting
   ```bash
   npm run build
   # Subir la carpeta 'dist' a tu hosting
   ```

2. **En Android**:
   - Abrir Chrome y navegar a la URL de la app
   - Tocar el menú (⋮) > "Agregar a pantalla de inicio"
   - La app se instala como una app nativa

3. **En iOS**:
   - Abrir Safari y navegar a la URL
   - Tocar Compartir > "Agregar a inicio"

## Opción 2: Capacitor (APK real)

Para generar una APK nativa de Android:

### 1. Instalar Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### 2. Inicializar Capacitor

```bash
npx cap init RifaFlash com.rifaflash.app --web-dir dist
```

### 3. Construir y sincronizar

```bash
npm run build
npx cap sync android
```

### 4. Abrir en Android Studio

```bash
npx cap open android
```

### 5. Generar APK

En Android Studio:
- Build > Generate Signed Bundle / APK
- Seleccionar APK
- Crear o seleccionar keystore
- Build > release

## Opción 3: Cordova (Alternativa)

```bash
npm install -g cordova
cordova create rifaflash-apk com.rifaflash.app RifaFlash
cd rifaflash-apk
cordova platform add android
# Copiar archivos de build a www/
cordova build android --release
```

## Configuración de Iconos

Los iconos deben estar en `public/` con estos tamaños:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

## Permisos necesarios (Android)

En `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Notas importantes

1. **HTTPS obligatorio**: La app debe servirse sobre HTTPS para que funcione el Service Worker

2. **CORS**: Configurar CORS en el servidor para las llamadas a la API de Telegram

3. **LocalStorage**: En APK, el LocalStorage persiste entre sesiones

4. **Actualizaciones**: Para actualizar la APK, rebuild y reinstalar

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Sync con Capacitor
npx cap sync android

# Copy web assets
npx cap copy android
```

## Soporte

Para más información:
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio](https://developer.android.com/studio)