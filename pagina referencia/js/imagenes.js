// Configuración para imágenes locales
// Ejecutar descargar-imagenes.bat primero para descargar todas las imágenes

const IMAGENES_LOCALES = {
    // Productos Dahua
    dahuaBullet2MP: 'images/dahua-bullet-2mp.png',
    dahuaBullet4K: 'images/dahua-bullet-4k.png',
    dahuaDome4MP: 'images/dahua-dome-4mp.png',
    dahuaPTZ25x: 'images/dahua-ptz-25x.png',
    dahuaWifi3MP: 'images/dahua-wifi-3mp.png',
    dahuaColorVu4MP: 'images/dahua-colorvu-4mp.png',
    
    // Instalaciones
    cercoInstalacion1: 'images/cerco-instalacion-1.jpg',
    cercoInstalacion2: 'images/cerco-instalacion-2.jpg',
    sistemaIntegrado: 'images/sistema-integrado.jpg',
    seguridadCompleta: 'images/seguridad-completa.jpg',
    camarasSistema: 'images/camaras-sistema.jpg',
    camaraTiOC: 'images/camara-tioc.png'
};

// Función para verificar si una imagen existe
function imagenExiste(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}
