# ðŸ“± RIFAFASH - APK PARA ANDROID

## âœ… RESUMEN DE LO QUE TENÃ‰S

- âœ… App compilada y funcionando
- âœ… Datos locales (persisten en el celular)
- âœ… IntegraciÃ³n con Telegram
- âœ�âƒ¨ Lista para convertir a APK

---

## ðŸš€ PASOS PARA GENERAR LA APK

### 1. INSTALAR DEPENDENCIAS DE CAPACITOR

En PowerShell (en la carpeta del proyecto):

```powershell
cd "C:\Users\mathi\OneDrive\Escritorio\RapiPremio"
npm install
```

Esto instalarÃ¡:
- @capacitor/core
- @capacitor/android
- @capacitor/preferences (para guardar datos localmente)

---

### 2. COMPILAR Y GENERAR APK

#### OPCIÃ“N A: Script AutomÃ¡tico

```powershell
.\GENERAR-APK.bat
```

#### OPCIÃ“N B: Comandos Manuales

```powershell
# Compilar app web
npm run build

# Inicializar Capacitor (solo la primera vez)
npx cap init RifaFlash com.rifaflash.app --web-dir dist

# Agregar Android (solo la primera vez)
npx cap add android

# Sincronizar cambios
npx cap sync android

# Abrir Android Studio
npx cap open android
```

---

### 3. EN ANDROID STUDIO

1. **EsperÃ¡** que cargue el proyecto (puede tardar la primera vez)
2. MenÃº: **Build** â†’ **Generate Signed Bundle / APK**
3. SeleccionÃ¡: **APK**
4. **Keystore**:
   - Si no tenÃ©s, creÃ¡ uno nuevo
   - Path: `C:\Users\mathi\rifaflash-keystore.jks`
   - Password: (elegÃ­ uno seguro)
   - Alias: `rifaflash`
5. SeleccionÃ¡: **release**
6. Click en **Finish**

El APK estarÃ¡ en:
```
android/app/release/app-release.apk
```

---

## ðŸ“² INSTALAR EN EL CELULAR

### OpciÃ³n 1: Cable USB
1. ConectÃ¡ el celular por USB
2. ActivÃ¡ "DepuraciÃ³n USB" en el celular:
   - ConfiguraciÃ³n â†’ Acerca del telÃ©fono â†’ Tocar 7 veces "NÃºmero de compilaciÃ³n"
   - Opciones de desarrollador â†’ DepuraciÃ³n USB
3. En Android Studio, click en "Run" (â–¶ï¸�)

### OpciÃ³n 2: Transferir APK
1. CopiÃ¡ `app-release.apk` al celular (USB, Bluetooth, Drive, etc.)
2. En el celular, permitÃ­ "Instalar apps de fuentes desconocidas"
3. TocÃ¡ el APK e instalÃ¡

---

## ðŸ’¾ DATOS LOCALES (FUNCIONA SIN INTERNET)

La app guarda todo en el celular:

- âœ… **Perfil del usuario** (nombre, DNI, telÃ©fono, CVU)
- âœ… **NÃºmeros comprados** (cuÃ¡les ocupaste)
- âœ… **Estado de la rifa** (cuÃ¡ntos nÃºmeros quedan)
- âœ… **Historial** de participaciones

**Los datos persisten** incluso si:
- CerrÃ¡s la app
- ApagÃ¡s el celular
- No tenÃ©s internet

---

## ðŸ”„ ACTUALIZAR LA APP

Cuando hagas cambios:

```powershell
npm run build
npx cap sync android
```

Luego en Android Studio: **Build** â†’ **Generate APK**

---

## âš™ï¸� CONFIGURACIÃ“N DE TELEGRAM

Ya estÃ¡ configurado con:
- **Token**: `8338989353:AAFVrhVX-8H2aCKCc1fDTVHYdmpk8ScQ3ic`
- **Chat ID**: `7850014359`

RecibirÃ¡s notificaciones cuando:
- Alguien compre un nÃºmero
- Queden 5 nÃºmeros (sorteo cercano)
- Se complete la rifa (ganador)

---

## ðŸ†˜ SOLUCIÃ“N DE PROBLEMAS

### Error "JAVA_HOME not set"
- InstalÃ¡ Android Studio con el JDK incluido
- O descargÃ¡ JDK 17 desde: https://adoptium.net

### Error "Android SDK not found"
- En Android Studio: **Tools** â†’ **SDK Manager**
- InstalÃ¡ el SDK de Android 13+ (API 33)

### Error "Gradle sync failed"
- En Android Studio: **File** â†’ **Sync Project with Gradle Files**
- O reiniciÃ¡ Android Studio

---

## ðŸ“‹ CHECKLIST

- [ ] Node.js instalado
- [ ] Android Studio instalado
- [ ] SDK de Android instalado
- [ ] Capacitor instalado (`npm install`)
- [ ] Build web exitoso (`npm run build`)
- [ ] Proyecto Android creado (`npx cap add android`)
- [ ] APK generada y firmada
- [ ] APK instalada en el celular

---

## ðŸŽ¨ ICONOS Y SPLASH SCREEN

Los iconos se generan automÃ¡ticamente. Para personalizar:

1. ReemplazÃ¡ `public/icon-512x512.png` con tu logo
2. EjecutÃ¡:
   ```powershell
   npx cordova-res android --skip-config --copy
   ```

---

**Â¿LISTO PARA COMPILAR?** ðŸš€

EjecutÃ¡:
```powershell
cd "C:\Users\mathi\OneDrive\Escritorio\RapiPremio"
npm install
.\GENERAR-APK.bat
```

Â¡Y seguÃ­ las instrucciones! ðŸŽ‰