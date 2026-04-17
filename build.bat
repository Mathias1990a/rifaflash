@echo off
chcp 65001 >nul
echo ==========================================
echo    RIFAFASH - SCRIPT DE COMPILACIÓN
echo ==========================================
echo.

:: Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detectado
node --version
echo.

:: Verificar si npm está instalado
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado
    pause
    exit /b 1
)

echo ✅ npm detectado
npm --version
echo.

:: Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    echo Esto puede tomar unos minutos...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas
) else (
    echo ✅ Dependencias ya instaladas
)
echo.

:: Compilar la aplicación
echo 🔨 Compilando aplicación...
echo.
npm run build
if %errorlevel% neq 0 (
    echo ❌ Error compilando la aplicación
    pause
    exit /b 1
)

echo.
echo ✅ ¡Compilación exitosa!
echo.
echo 📁 Los archivos compilados están en la carpeta 'dist'
echo.

:: Preguntar si quiere previsualizar
set /p preview=¿Quieres previsualizar la app ahora? (S/N): 
if /i "%preview%"=="S" (
    echo.
    echo 🚀 Iniciando servidor de previsualización...
    echo La app se abrirá en: http://localhost:4173
    echo.
    echo Presiona Ctrl+C para cerrar
    echo.
    npm run preview
)

echo.
echo ==========================================
echo    COMPILACIÓN COMPLETADA
echo ==========================================
echo.
pause