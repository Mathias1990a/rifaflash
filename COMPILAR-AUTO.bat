@echo off
chcp 65001 >nul
title RifaFlash - Buscador y Compilador
color 0B

cls
echo ============================================
echo    ÔÜí RIFAFASH - BUSCADOR Y COMPILADOR ÔÜí
echo ============================================
echo.

:: ============================================
:: BUSCAR LA CARPETA DEL PROYECTO
:: ============================================
echo ­ƒöì Buscando carpeta RifaFlash...

set PROJECT_FOUND=0
set PROJECT_PATH=

:: Buscar en ubicaciones comunes
if exist "C:\Users\%USERNAME%\OneDrive\Escritorio\RifaFlash\package.json" (
    set PROJECT_PATH=C:\Users\%USERNAME%\OneDrive\Escritorio\RifaFlash
    set PROJECT_FOUND=1
    echo Ô£à Encontrado en OneDrive\Escritorio
)

if %PROJECT_FOUND% equ 0 (
    if exist "C:\Users\%USERNAME%\Desktop\RifaFlash\package.json" (
        set PROJECT_PATH=C:\Users\%USERNAME%\Desktop\RifaFlash
        set PROJECT_FOUND=1
        echo Ô£à Encontrado en Desktop
    )
)

if %PROJECT_FOUND% equ 0 (
    if exist "C:\Users\%USERNAME%\Documents\RifaFlash\package.json" (
        set PROJECT_PATH=C:\Users\%USERNAME%\Documents\RifaFlash
        set PROJECT_FOUND=1
        echo Ô£à Encontrado en Documents
    )
)

if %PROJECT_FOUND% equ 0 (
    if exist "%USERPROFILE%\RifaFlash\package.json" (
        set PROJECT_PATH=%USERPROFILE%\RifaFlash
        set PROJECT_FOUND=1
        echo Ô£à Encontrado en UserProfile
    )
)

:: Buscar con where
if %PROJECT_FOUND% equ 0 (
    for /f "tokens=*" %%a in ('where /r C:\Users package.json 2^>nul ^| findstr "RifaFlash"') do (
        set PROJECT_PATH=%%~dpa
        set PROJECT_FOUND=1
        echo Ô£à Encontrado con busqueda: %%~dpa
        goto :found
    )
)

:found
if %PROJECT_FOUND% equ 0 (
    color 0C
    echo.
    echo ÔØî ERROR: No se encontro la carpeta RifaFlash
    echo.
    echo ­ƒÆí Verifica que la carpeta exista en:
    echo    - C:\Users\%USERNAME%\OneDrive\Escritorio\RifaFlash
    echo    - C:\Users\%USERNAME%\Desktop\RifaFlash
    echo    - C:\Users\%USERNAME%\Documents\RifaFlash
    echo.
    echo ­ƒôü Contenido de Escritorio:
    dir "C:\Users\%USERNAME%\OneDrive\Escritorio\" /b 2>nul || dir "C:\Users\%USERNAME%\Desktop\" /b 2>nul
    echo.
    pause
    exit /b 1
)

echo Ô£à Proyecto encontrado en: %PROJECT_PATH%
echo.

:: ============================================
:: BUSCAR NODE.JS
:: ============================================
echo ­ƒöì Buscando Node.js...

set NODE_FOUND=0

:: Verificar en ubicaciones comunes
if exist "C:\Program Files\nodejs\node.exe" (
    set NODE_PATH=C:\Program Files\nodejs
    set NODE_FOUND=1
)

if %NODE_FOUND% equ 0 (
    if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set NODE_PATH=C:\Program Files (x86)\nodejs
        set NODE_FOUND=1
    )
)

if %NODE_FOUND% equ 0 (
    if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set NODE_PATH=%LOCALAPPDATA%\Programs\nodejs
        set NODE_FOUND=1
    )
)

:: Verificar con where
if %NODE_FOUND% equ 0 (
    where node >nul 2>nul
    if %errorlevel% equ 0 (
        for /f "tokens=*" %%a in ('where node') do (
            set NODE_PATH=%%~dpa
            set NODE_FOUND=1
        )
    )
)

if %NODE_FOUND% equ 0 (
    color 0C
    echo.
    echo ÔØî Node.js no encontrado
    echo ­ƒîÉ Instala desde: https://nodejs.org
    pause
    exit /b 1
)

echo Ô£à Node.js encontrado en: %NODE_PATH%
for /f "tokens=*" %%a in ('"%NODE_PATH%\node.exe" --version') do echo Ô£à Version: %%a
echo.

:: ============================================
:: NAVEGAR AL PROYECTO
cd /d "%PROJECT_PATH%"
echo ­ƒôü Directorio de trabajo: %CD%
echo.

:: ============================================
:: INSTALAR DEPENDENCIAS
:: ============================================
if not exist "node_modules" (
    echo ­ƒôª Instalando dependencias...
    echo â│ Esto puede tomar unos minutos...
    echo.
    
    call "%NODE_PATH%\npm.cmd" install
    
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo ÔØî Error instalando dependencias
        pause
        exit /b 1
    )
    
    echo Ô£à Dependencias instaladas!
) else (
    echo Ô£à Dependencias ya instaladas
)
echo.

:: ============================================
:: COMPILAR
:: ============================================
echo ­ƒö¿ COMPILANDO RIFAFASH...
echo ============================================
echo.

call "%NODE_PATH%\npm.cmd" run build

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ÔØî Error en la compilacion
    pause
    exit /b 1
)

echo.
echo ============================================
echo    Ô£à Ô¡É COMPILACION EXITOSA! Ô¡É Ô£à
echo ============================================
echo.
echo ­ƒôª Archivos generados en: %CD%\dist\
echo.

:: Contar archivos
for /f %%A in ('dir /b /s dist\*.* 2^>nul ^| find /c /v ""') do echo ­ƒôè Total de archivos: %%A
echo.

:: Preguntar
set /p opcion="┬┐Abrir previsualizacion? (S/N): "

if /i "%opcion%"=="S" (
    echo.
    echo ­ƒÜÇ Abriendo http://localhost:4173
    start http://localhost:4173
    call "%NODE_PATH%\npm.cmd" run preview
)

echo.
echo ­ƒÄë Ô¡É LISTO! Tu app esta compilada en la carpeta 'dist'
echo.
pause