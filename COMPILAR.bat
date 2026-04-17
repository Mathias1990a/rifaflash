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
:: CONFIGURACIÓN
:: ============================================
set PROJECT_PATH=C:\Users\mathi\OneDrive\Escritorio\RapiPremio
set NODE_PATH=C:\Program Files\nodejs

:: ============================================
:: VERIFICAR PROYECTO
:: ============================================
echo 🔍 Verificando proyecto...

if not exist "%PROJECT_PATH%\package.json" (
    color 0C
    echo.
    echo ❌ ERROR: No se encontró package.json
    echo 📁 Buscando en: %PROJECT_PATH%
    echo.
    echo 💡 Verifica que la carpeta exista
    pause
    exit /b 1
)

echo ✅ Proyecto encontrado
echo.

:: ============================================
:: VERIFICAR NODE.JS
:: ============================================
echo 🔍 Verificando Node.js...

if not exist "%NODE_PATH%\node.exe" (
    :: Buscar en otras ubicaciones
    if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set NODE_PATH=C:\Program Files (x86)\nodejs
    ) else (
        where node >nul 2>nul
        if %errorlevel% neq 0 (
            color 0C
            echo ❌ Node.js no encontrado
            echo 🌐 Instala desde: https://nodejs.org
            pause
            exit /b 1
        )
    )
)

echo ✅ Node.js encontrado
echo.

:: ============================================
:: NAVEGAR AL PROYECTO
cd /d "%PROJECT_PATH%"
echo 📁 Directorio: %CD%
echo.

:: ============================================
:: INSTALAR DEPENDENCIAS
:: ============================================
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    echo ⏳ Esto puede tomar 2-5 minutos...
    echo.
    
    "%NODE_PATH%\npm.cmd" install
    
    if %errorlevel% neq 0 (
        color 0C
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

"%NODE_PATH%\npm.cmd" run build

if %errorlevel% neq 0 (
    color 0C
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

:: Preguntar
set /p opcion="¿Abrir previsualización? (S/N): "

if /i "%opcion%"=="S" (
    echo.
    echo 🚀 Abriendo http://localhost:4173
    start http://localhost:4173
    "%NODE_PATH%\npm.cmd" run preview
)

echo.
echo 🎉 ¡Listo!
pause