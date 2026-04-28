# RifaFlash - Migración a Firebase

## Pasos para configurar Firebase

### 1. Crear proyecto en Firebase
1. Andá a https://console.firebase.google.com/
2. Creá un nuevo proyecto (ej: "rifaflash")
3. Desactivá Google Analytics por ahora

### 2. Agregar una app web
1. En la página del proyecto, hacé clic en el icono de Web (</>)
2. Registrá la app con un nombre (ej: "rifaflash-web")
3. **IMPORTANTE**: Copiá la configuración de Firebase que te muestra

### 3. Actualizar configuración en el código
Abrí `src/services/firebase.ts` y reemplazá `firebaseConfig` con tus datos:

```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 4. Configurar Firestore Database
1. En Firebase Console, andá a "Firestore Database"
2. Hacé clic en "Crear base de datos"
3. Elegí "Modo de prueba" (permite lectura/escritura por 30 días)
4. Seleccioná la ubicación más cercana (ej: us-central, southamerica-east1)

### 5. Configurar Authentication
1. Andá a "Authentication" en Firebase Console
2. Hacé clic en "Comenzar"
3. Activá "Email/Password" (solo el método de email/contraseña)

### 6. Instalar dependencias y probar
```bash
npm install
npm run dev
```

## Reglas de seguridad de Firestore (para producción)

Cuando estés listo para producción, actualizá las reglas en Firebase Console > Firestore Database > Reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública de salas y números
    match /rooms/{roomId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /numbers/{numberId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /winners/{winnerId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Solo el dueño puede ver/editar sus datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /payments/{paymentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Estructura de datos

La app creará automáticamente:
- **rooms**: Configuración de las 3 salas (standard, premium, vip)
- **numbers**: Los números de cada sala (50, 25, 15 respectivamente)
- **users**: Datos de usuarios registrados
- **payments**: Pagos pendientes
- **winners**: Historial de ganadores
- **referrals**: Registro de referidos

## Deploy

```bash
npm run build
# Subir la carpeta 'dist' a tu hosting (Vercel, Netlify, etc.)
```
