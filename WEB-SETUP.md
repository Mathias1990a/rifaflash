# 🌐 RIFAFASH - VERSIÓN WEB CON BASE DE DATOS

## ✅ LO QUE TENÉS AHORA

- **Frontend**: React + TypeScript + Tailwind
- **Base de datos**: Supabase (PostgreSQL + Realtime)
- **Tiempo real**: Actualizaciones instantáneas
- **Deploy listo**: Vercel

---

## 🚀 PASOS PARA PROBAR

### 1. INSTALAR DEPENDENCIAS

```powershell
cd "C:\Users\mathi\OneDrive\Escritorio\RapiPremio"
npm install
```

### 2. CONFIGURAR SUPABASE

1. Creá cuenta en https://supabase.com
2. Creá proyecto nuevo
3. En SQL Editor, ejecutá el script de `SUPABASE-SETUP.md`
4. Copiá tus credenciales (URL y anon key)

### 3. CONFIGURAR VARIABLES DE ENTORNO

Creá archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 4. COMPILAR Y PROBAR LOCAL

```powershell
npm run dev
```

Abre: http://localhost:5173

---

## 🎯 FUNCIONALIDADES

### ✅ Registro de Usuario
- Nombre, DNI, Teléfono, CVU/Alias
- Se guarda en Supabase
- Persiste en localStorage

### ✅ Compra de Números
- Seleccionás sala (Standard/Premium/VIP)
- Elegís número disponible
- Pagás por Ualá/Mercado Pago
- Confirmás el pago
- ¡El número se bloquea para todos!

### ✅ Tiempo Real
- Vés quién compra en vivo
- Números se actualizan instantáneamente
- Contador de disponibles
- Alerta cuando quedan pocos

### ✅ Sorteo Automático
- Cuando se completan todos los números
- Animación de ruleta
- Selección aleatoria del ganador
- Guarda en historial

### ✅ Historial de Ganadores
- Lista de todos los ganadores
- Filtrado por sala
- Fecha y premio

---

## 📱 PARA QUE JUEGUE CUALQUIERA

### Deploy en Vercel:

1. Subí a GitHub:
```bash
git init
git add .
git commit -m "RifaFlash web"
git remote add origin https://github.com/tuusuario/rifaflash.git
git push -u origin main
```

2. En Vercel:
   - Importá desde GitHub
   - Agregá las variables de entorno
   - Deploy!

3. La URL será:
```
https://rifaflash.vercel.app
```

**¡Listo! Cualquiera puede jugar desde cualquier lado.**

---

## 💰 FLUJO DE PAGO COMPLETO

```
1. Usuario entra a https://rifaflash.vercel.app
2. Se registra (nombre, DNI, tel, CVU)
3. Selecciona sala y número
4. Ve datos de pago (Ualá/MP)
5. Realiza transferencia
6. Toca "Ya realicé el pago"
7. Vos recibís notificación Telegram
8. Confirmás el pago manualmente
9. El número se marca OCUPADO para todos
10. Cuando se completan → SORTEO AUTOMÁTICO
```

---

## 🎨 DISEÑO DEL SORTEO

```
┌─────────────────────────────────────┐
│                                     │
│   🎰 SORTEO EN CURSO 🎰            │
│                                     │
│      ┌─────────┐                    │
│      │   12    │  ← Cambia rápido   │
│      │   45    │                    │
│      │   08    │                    │
│      │   31    │                    │
│      └─────────┘                    │
│                                     │
│   [Confeti] [Sonido] [Brillo]      │
│                                     │
└─────────────────────────────────────┘

... 5 segundos después ...

┌─────────────────────────────────────┐
│                                     │
│    👑 ¡GANADOR! 👑                 │
│                                     │
│      ┌─────────┐                    │
│      │         │                    │
│      │   23    │  ✨ Número ganador │
│      │ [BRILLO]│                    │
│      │         │                    │
│      └─────────┘                    │
│                                     │
│   🎉 María González                │
│   💰 $100.000                      │
│                                     │
│   [Confeti cayendo]                │
│   [Celebración]                    │
│                                     │
└─────────────────────────────────────┘
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error al compilar:
```bash
npm install
npm run build
```

### Error de tipos:
```bash
npx tsc --noEmit
```

### No conecta a Supabase:
- Verificá las credenciales en `.env`
- Verificá que las tablas estén creadas
- Verificá las políticas RLS

---

## 📋 CHECKLIST PARA PROBAR

- [ ] `npm install` sin errores
- [ ] `npm run dev` funciona
- [ ] Registro de usuario guarda en BD
- [ ] Compra de número funciona
- [ ] Notificación llega a Telegram
- [ ] Sorteo se ejecuta al completar
- [ ] Historial de ganadores se guarda

---

**¿Empezamos?** Ejecutá:
```powershell
npm install
```

Y me contás si hay errores.