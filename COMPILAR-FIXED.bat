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
:: BUSCAR NODE.JS EN UBICACIONES COMUNES
:: ============================================
echo 🔍 Buscando Node.js...

set NODE_FOUND=0
set NODE_PATH=

:: Verificar en ubicaciones comunes
if exist "C:\Program Files\nodejs\node.exe" (
    set NODE_PATH=C:\Program Files\nodejs
    set NODE_FOUND=1
)

if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set NODE_PATH=C:\Program Files (x86)\nodejs
    set NODE_FOUND=1
)

if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set NODE_PATH=%LOCALAPPDATA%\Programs\nodejs
    set NODE_FOUND=1
)

:: Verificar con where
where node >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('where node') do (
        set NODE_PATH=%%~dpa
        set NODE_FOUND=1
    )
)

if %NODE_FOUND% equ 1 (
    echo ✅ Node.js encontrado en: %NODE_PATH%
    set "PATH=%NODE_PATH%;%PATH%"
    
    for /f "tokens=*" %%a in ('"%NODE_PATH%\node.exe" --version') do (
        echo ✅ Versión: %%a
    )
) else (
    color 0C
    echo.
    echo ❌ Node.js no encontrado en las ubicaciones comunes
    echo.
    echo 💡 Soluciones:
    echo    1. Reiniciá la computadora e intentá de nuevo
    echo    2. Reinstalá Node.js desde: https://nodejs.org
    echo    3. Agregá Node.js al PATH manualmente
    echo.
    pause
    exit /b 1
)

echo.

:: ============================================
:: NAVEGAR AL DIRECTORIO
cd /d "%~dp0"
echo 📁 Directorio: %CD%
echo.

:: ============================================
:: INSTALAR DEPENDENCIAS
:: ============================================
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    echo ⏳ Esto puede tomar unos minutos...
    echo.
    
    call "%NODE_PATH%\npm.cmd" install
    
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
    
    echo ✅ Dependencias instaladas!
) else (
    echo ✅ Dependencias ya instaladas
)
echo.

:: ============================================
:: COMPILAR
:: ============================================
echo 🔨 COMPILANDO...
echo ============================================
echo.

call "%NODE_PATH%\npm.cmd" run build

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ Error en la compilación
    pause
    exit /b 1
)

echo.
echo ============================================
echo    ✅ ¡COMPILACIÓN EXITOSA! ✅
echo ============================================
echo.
echo 📁 Archivos en: %CD%\dist\
echo.

:: Preguntar qué hacer
set /p opcion="¿Abrir previsualización? (S/N): "

if /i "%opcion%"=="S" (
    echo.
    echo 🚀 Abriendo http://localhost:4173
    start http://localhost:4173
    call "%NODE_PATH%\npm.cmd" run preview
)

echo.
pause