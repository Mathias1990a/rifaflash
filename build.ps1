# Script de build para PowerShell

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   RIFAFASH - SCRIPT DE COMPILACIÓN" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde: https://nodejs.org/"
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm detectado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está instalado" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Instalar dependencias
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    Write-Host "Esto puede tomar unos minutos..." -ForegroundColor Yellow
    Write-Host ""
    
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
}

Write-Host ""

# Compilar
Write-Host "🔨 Compilando aplicación..." -ForegroundColor Yellow
Write-Host ""

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando la aplicación" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "✅ ¡Compilación exitosa!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Los archivos compilados están en la carpeta 'dist'" -ForegroundColor Cyan
Write-Host ""

# Preguntar si quiere previsualizar
$preview = Read-Host "¿Quieres previsualizar la app ahora? (S/N)"

if ($preview -eq "S" -or $preview -eq "s") {
    Write-Host ""
    Write-Host "🚀 Iniciando servidor de previsualización..." -ForegroundColor Green
    Write-Host "La app se abrirá en: http://localhost:4173" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Presiona Ctrl+C para cerrar" -ForegroundColor Yellow
    Write-Host ""
    
    npm run preview
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   COMPILACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Presiona Enter para salir"