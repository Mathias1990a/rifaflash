# SeguridadPro - Landing Page

Landing page profesional para empresa de seguridad residencial especializada en cercos eléctricos y cámaras de seguridad.

## 📁 Estructura del Proyecto

```
seguridadpro-landing/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos completos
├── js/
│   └── main.js             # JavaScript interactivo
├── images/                 # Carpeta para imágenes (vacía)
└── README.md              # Este archivo
```

## 🚀 Cómo usar

### Opción 1: Abrir directamente
1. Haz doble clic en `index.html`
2. Se abrirá en tu navegador predeterminado

### Opción 2: Servidor local (recomendado)
Con Python:
```bash
python -m http.server 8000
```

Con Node.js:
```bash
npx serve
```

Luego abre: `http://localhost:8000`

## ✨ Características

- **Diseño Responsive**: Se adapta a móvil, tablet y desktop
- **Animaciones suaves**: Elementos aparecen al hacer scroll
- **Formulario funcional**: Validación en tiempo real y modal de confirmación
- **SEO optimizado**: Meta tags y keywords integrados
- **Navegación suave**: Scroll animado entre secciones
- **Menú móvil**: Hamburguesa para dispositivos pequeños

## 🎨 Secciones incluidas

1. **Hero**: Headline impactante + CTA principal
2. **Credibilidad**: Badges de confianza + testimonio
3. **Servicios**: 
   - Cercos eléctricos residenciales
   - Cámaras de seguridad IP
   - Sistema integrado (destacado)
4. **Proceso**: 4 pasos de trabajo
5. **Garantía**: 4 pilares de confianza
6. **Footer CTA**: Formulario de contacto

## 📝 Personalización

### Cambiar colores
Edita las variables CSS en `css/styles.css`:
```css
:root {
    --color-primary: #1a365d;      /* Azul corporativo */
    --color-secondary: #c53030;    /* Rojo CTA */
    --color-accent: #38a169;       /* Verde éxito */
    --color-gold: #d69e2e;         /* Dorado destacado */
}
```

### Agregar imágenes
1. Coloca tus imágenes en la carpeta `images/`
2. Referencia en HTML:
```html
<img src="images/tu-imagen.jpg" alt="Descripción">
```

### Modificar contenido
Edita directamente el archivo `index.html`. Las secciones están claramente comentadas.

## 🔧 Funcionalidades JavaScript

- **Navbar**: Efecto de scroll y menú móvil
- **Animaciones**: Elementos aparecen al entrar en viewport
- **Contador**: Animación de números en estadísticas
- **Formulario**: Validación y envío simulado
- **Modal**: Confirmación de envío
- **Smooth scroll**: Navegación entre secciones

## 📱 Responsive breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

## 🔒 SEO incluido

- Meta description
- Keywords relevantes
- Open Graph tags (para redes sociales)
- Estructura semántica HTML5
- Heading hierarchy (H1, H2, H3)

## 📞 Integración con backend

Para conectar el formulario a tu servidor:

1. En `js/main.js`, reemplaza la función `submitForm`:

```javascript
function submitForm(form) {
    const formData = new FormData(form);
    
    fetch('tu-endpoint.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        mostrarModal();
        form.reset();
    })
    .catch(error => {
        alert('Hubo un error. Por favor intenta nuevamente.');
    });
}
```

## 📄 Licencia

Este proyecto es de uso libre para fines comerciales.

---

**Creado para:** SeguridadResidencial Pro  
**Fecha:** 2024
