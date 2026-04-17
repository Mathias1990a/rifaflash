@echo off
chcp 65001 >nul
title RifaFlash - Compilador
color 0B

cls
echo ============================================
echo    ⚡ RIFAFASH - COMPILADOR v1.0 ⚡
echo ============================================
echo.

:: ============================================
:: VERIFICAR NODE.JS
:: ============================================
echo 🔍 Verificando Node.js...

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ ERROR: Node.js no está instalado!
    echo.
    echo 💡 Para instalar Node.js:
    echo    1. Ve a: https://nodejs.org
    echo    2. Descarga la versión LTS (recomendada)
    echo    3. Instala con las opciones por defecto
    echo    4. Reinicia esta ventana de CMD
    echo.
    echo 🌐 O usa el instalador directo:
    echo    https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
echo ✅ Node.js encontrado: %NODE_VERSION%

:: ============================================
:: VERIFICAR NPM
echo 🔍 Verificando npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ❌ ERROR: npm no está instalado correctamente
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
echo ✅ npm encontrado: %NPM_VERSION%
echo.

:: ============================================
:: NAVEGAR AL DIRECTORIO
cd /d "%~dp0"
echo 📁 Directorio de trabajo: %CD%
echo.

:: ============================================
:: INSTALAR DEPENDENCIAS
:: ============================================
if not exist "node_modules" (
    echo 📦 Instalando dependencias por primera vez...
    echo ⏳ Esto puede tomar 2-5 minutos...
    echo.
    
    call npm install
    
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo ❌ ERROR: Falló la instalación de dependencias
        echo 💡 Intenta ejecutar: npm install manualmente
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ Dependencias instaladas correctamente!
) else (
    echo ✅ Dependencias ya instaladas (node_modules existe)
)
echo.

:: ============================================
:: LIMPIAR BUILD ANTERIOR
:: ============================================
if exist "dist" (
    echo 🧹 Limpiando build anterior...
    rmdir /s /q "dist"
    echo ✅ Build anterior eliminado
    echo.
)

:: ============================================
:: COMPILAR
:: ============================================
echo 🔨 COMPILANDO RIFAFASH...
echo ============================================
echo.

call npm run build

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ ERROR: La compilación falló!
    echo.
    echo 💡 Posibles soluciones:
    echo    1. Verifica que todos los archivos estén en src/
    echo    2. Ejecuta: npm install
    echo    3. Intenta: npm run build manualmente
    echo.
    pause
    exit /b 1
)

:: ============================================
:: VERIFICAR RESULTADO
:: ============================================
if not exist "dist" (
    color 0C
    echo ❌ ERROR: No se creó la carpeta dist/
    pause
    exit /b 1
)

echo.
echo ============================================
echo    ✅ ¡COMPILACIÓN EXITOSA! ✅
echo ============================================
echo.
echo 📁 Archivos generados en: %CD%\dist\
echo.

:: Contar archivos
for /f %%A in ('dir /b /s dist\*.* 2^>nul ^| find /c /v ""') do set FILE_COUNT=%%A
echo 📊 Total de archivos: %FILE_COUNT%
echo.

:: ============================================
:: PREGUNTAR SI ABRIR PREVIEW
:: ============================================
echo 💻 ¿Qué querés hacer ahora?
echo.
echo    [1] 🚀 Previsualizar la app (abrir navegador)
echo    [2] 📂 Abrir carpeta dist/
echo    [3] 🚪 Salir
echo.
set /p opcion="Seleccioná una opción (1-3): "

if "%opcion%"=="1" (
    echo.
    echo 🚀 Iniciando servidor de previsualización...
    echo 🌐 La app se abrirá en: http://localhost:4173
    echo ⏳ Presiona Ctrl+C para detener el servidor
    echo.
    timeout /t 2 >nul
    start http://localhost:4173
    call npm run preview
)

if "%opcion%"=="2" (
    echo.
    echo 📂 Abriendo carpeta dist/...
    start explorer "dist"
)

echo.
echo ============================================
echo    🎉 ¡LISTO PARA USAR! 🎉
echo ============================================
echo.
echo 💡 Para publicar online:
echo    • Subí la carpeta 'dist' a Vercel, Netlify o GitHub Pages
echo.
echo 💡 Para generar APK:
echo    • Seguí la guía en APK-GUIDE.md
echo.
pause