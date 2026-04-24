// Configuración del Bot de Telegram
const TELEGRAM_CONFIG = {
    botToken: 'TU_BOT_TOKEN_AQUI', // Reemplazar con tu token de BotFather
    chatId: 'TU_CHAT_ID_AQUI',     // Reemplazar con tu chat ID
    apiUrl: 'https://api.telegram.org/bot'
};

// Función para enviar mensaje a Telegram
async function enviarTelegram(mensaje) {
    const url = `${TELEGRAM_CONFIG.apiUrl}${TELEGRAM_CONFIG.botToken}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text: mensaje,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Error al enviar a Telegram:', error);
        return false;
    }
}

// Función para enviar lead a Telegram
async function enviarLeadTelegram(formData) {
    const mensaje = `
🚨 <b>NUEVO LEAD - SEGURIDADPRO</b> 🚨

👤 <b>Nombre:</b> ${formData.nombre}
📱 <b>Teléfono:</b> ${formData.telefono}
📧 <b>Email:</b> ${formData.email || 'No proporcionado'}
📍 <b>Dirección:</b> ${formData.direccion}
🏠 <b>Tipo:</b> ${formData.tipo_propiedad}
📝 <b>Mensaje:</b> ${formData.mensaje || 'Sin mensaje'}

📅 Fecha: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
    `;
    
    return await enviarTelegram(mensaje);
}

// Exportar para usar en main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { enviarTelegram, enviarLeadTelegram };
}
