@echo off
chcp 65001 >nul
title RifaFlash - Generador de APK
color 0B

cls
echo ============================================
echo    ÔÜí RIFAFASH - GENERADOR DE APK ÔÜí
echo ============================================
echo.

set PROJECT_PATH=C:\Users\mathi\OneDrive\Escritorio\RapiPremio
set NODE_PATH=C:\Program Files\nodejs

cd /d "%PROJECT_PATH%"

:: ============================================
echo Ô£ö Directorio: %CD%
echo.

:: ============================================
echo ðŸ“¦ PASO 1: Verificando Capacitor...
:: ============================================
if not exist "node_modules\@capacitor" (
    echo ðŸ“¥ Instalando Capacitor...
    "%NODE_PATH%\npm.cmd" install @capacitor/core @capacitor/cli @capacitor/android
    if %errorlevel% neq 0 (
        color 0C
        echo Ã— Error instalando Capacitor
        pause
        exit /b 1
    )
) else (
    echo âœ… Capacitor ya instalado
)
echo.

:: ============================================
echo ðŸ”¨ PASO 2: Compilando app web...
:: ============================================
call "%NODE_PATH%\npm.cmd" run build
if %errorlevel% neq 0 (
    color 0C
    echo Ã— Error en el build
    pause
    exit /b 1
)
echo âœ… Build completado
echo.

:: ============================================
echo ðŸ“± PASO 3: Inicializando Capacitor...
:: ============================================
if not exist "android" (
    echo ðŸ“± Creando proyecto Android...
    npx cap init RifaFlash com.rifaflash.app --web-dir dist
    npx cap add android
) else (
    echo âœ… Proyecto Android ya existe
)
echo.

:: ============================================
echo ðŸ”„ PASO 4: Sincronizando...
:: ============================================
npx cap sync android
echo âœ… Sincronizado
echo.

:: ============================================
echo ============================================
echo    âœ… ðŸŽ‰ PROYECTO ANDROID LISTO! ðŸŽ‰ âœ…
echo ============================================
echo.
echo ðŸ“± Para generar la APK:
echo    1. Se abrira Android Studio
echo    2. Espera que cargue el proyecto
echo    3. Menu: Build -^> Generate Signed Bundle/APK
echo    4. Selecciona APK -^> Release
echo    5. Crea o selecciona tu keystore
echo    6. Click en Finish
echo.
echo ðŸ“ El APK estara en:
echo    android/app/release/app-release.apk
echo.

set /p abrir="Â¿Abrir Android Studio ahora? (S/N): "

if /i "%abrir%"=="S" (
    echo.
    echo ðŸš€ Abriendo Android Studio...
    npx cap open android
)

echo.
pause