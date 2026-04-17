# 🚀 COMPILAR APK DE ANDROID - RIFAFASH

## PASO 1: Instalar Capacitor

En PowerShell (como Administrador):

```powershell
cd "C:\Users\mathi\OneDrive\Escritorio\RapiPremio"
npm install @capacitor/core @capacitor/cli @capacitor/android
```

## PASO 2: Build de la app web

```powershell
npm run build
```

## PASO 3: Inicializar Capacitor

```powershell
npx cap init RifaFlash com.rifaflash.app --web-dir dist
```

## PASO 4: Agregar Android

```powershell
npx cap add android
```

## PASO 5: Sincronizar cambios

```powershell
npx cap sync android
```

## PASO 6: Abrir Android Studio

```powershell
npx cap open android
```

## PASO 7: Generar APK

En Android Studio:
1. Espera que cargue el proyecto
2. Menú: **Build** → **Generate Signed Bundle / APK**
3. Seleccioná: **APK**
4. Creá o seleccioná tu **keystore** (para firmar la app)
5. Seleccioná: **release**
6. Click en **Finish**

El APK estará en:
```
android/app/release/app-release.apk
```

---

## 📱 INSTALAR EN EL CELULAR

### Opción 1: Cable USB
1. Conectá el celular por USB
2. Activá "Depuración USB" en el celular
3. En Android Studio, click en "Run" (▶️)

### Opción 2: Transferir APK
1. Copiá el archivo `app-release.apk` al celular
2. En el celular, permití "Instalar apps de fuentes desconocidas"
3. Instalá el APK

---

## 💾 DATOS LOCALES (Funciona sin internet)

La app usa:
- **LocalStorage** para guardar datos del usuario
- **SQLite** (opcional) para más persistencia

Los datos se guardan en el celular y persisten incluso si cerrás la app.

---

## ⚙️ CONFIGURACIÓN ADICIONAL

### Permisos en Android

En `android/app/src/main/AndroidManifest.xml`, agregar:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### Iconos para Android

Los iconos deben estar en:
```
android/app/src/main/res/
├── mipmap-hdpi/     (72x72)
├── mipmap-mdpi/     (48x48)
├── mipmap-xhdpi/    (96x96)
├── mipmap-xxhdpi/   (144x144)
└── mipmap-xxxhdpi/  (192x192)
```

### Splash Screen

El splash se configura automáticamente con el logo de RifaFlash.

---

## 🔄 ACTUALIZAR LA APP

Cuando hagas cambios:

```powershell
npm run build
npx cap sync android
npx cap open android
```

Luego en Android Studio: **Build** → **Generate APK**

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error "JAVA_HOME not set"
Descargá e instalá Android Studio con el JDK incluido.

### Error "Android SDK not found"
En Android Studio: **Tools** → **SDK Manager** → Instalá el SDK.

### Error "Gradle sync failed"
En Android Studio: **File** → **Sync Project with Gradle Files**

---

## 📋 CHECKLIST

- [ ] Android Studio instalado
- [ ] SDK de Android instalado
- [ ] Java JDK instalado
- [ ] Capacitor instalado (`npm install @capacitor/core @capacitor/cli @capacitor/android`)
- [ ] Build web exitoso (`npm run build`)
- [ ] Proyecto Android creado (`npx cap add android`)
- [ ] APK generada

---

**¿Listo para compilar la APK?** 🚀