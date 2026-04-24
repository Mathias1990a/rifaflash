/**
 * SEGURIDADPRO - Main JavaScript v2
 * Cercos Eléctricos y Cámaras Dahua - Buenos Aires, Argentina
 */

// Configuración de Telegram
const TELEGRAM_CONFIG = {
    botToken: '7735822985:AAEu9nCNodD6dXv-ZgzZv3pOU9MRmEOlZ-Y', // Tu token del bot
    chatId: '-4798137821',     // Tu chat ID
    apiUrl: 'https://api.telegram.org/bot'
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initNavigation();
    initHeroSlideshow();
    initScrollAnimations();
    initFormHandling();
    initSmoothScroll();
    initProductFilter();
    initGalleryFilter();
    initCalculadora();
    initCounters();
});

/**
 * Enviar mensaje a Telegram
 */
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

/**
 * Enviar lead a Telegram
 */
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
🌎 Ubicación: Buenos Aires, Argentina
    `;
    
    return await enviarTelegram(mensaje);
}

/**
 * Navigation Module
 */
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
                
                navMenu.style.display = 'flex';
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '72px';
                navMenu.style.left = '0';
                navMenu.style.right = '0';
                navMenu.style.background = 'rgba(255, 255, 255, 0.98)';
                navMenu.style.padding = '1.5rem';
                navMenu.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                navMenu.style.gap = '1rem';
                navMenu.style.zIndex = '999';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
                navMenu.style.display = '';
            }
        });
        
        // Close menu on link click
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.style.display = '';
                
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }
}

/**
 * Hero Slideshow
 */
function initHeroSlideshow() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

/**
 * Counter Animation
 */
function initCounters() {
    const counters = document.querySelectorAll('.stat-num[data-target]');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * (target - start) + start);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.badge, .servicio-card, .paso, .garantia-item, .producto-card, .testimonio-card, .galeria-item, .cred-item'
    );
    
    animatedElements.forEach(el => el.classList.add('animate-on-scroll'));
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => observer.observe(el));
}

/**
 * Product Filter (Dahua)
 */
function initProductFilter() {
    const catBtns = document.querySelectorAll('.cat-btn');
    const productCards = document.querySelectorAll('.producto-card');
    
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-cat');
            
            // Filter products
            productCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-cat') === category) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeInUp 0.5s ease';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

/**
 * Gallery Filter
 */
function initGalleryFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.galeria-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeInUp 0.5s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

/**
 * Calculadora de Presupuesto
 */
let presupuestoItems = [];

function initCalculadora() {
    // Inicializar con valores guardados en localStorage si existen
    const saved = localStorage.getItem('presupuestoItems');
    if (saved) {
        presupuestoItems = JSON.parse(saved);
        actualizarTotal();
    }
}

function actualizarTotal() {
    const checkboxes = document.querySelectorAll('.calc-option input[type="checkbox"]:checked');
    let total = 0;
    presupuestoItems = [];
    
    checkboxes.forEach(checkbox => {
        const value = parseInt(checkbox.value);
        const name = checkbox.getAttribute('data-name');
        total += value;
        presupuestoItems.push({ name, value });
    });
    
    const totalElement = document.getElementById('totalPresupuesto');
    if (totalElement) {
        totalElement.textContent = '$' + total.toLocaleString();
    }
    
    // Guardar en localStorage
    localStorage.setItem('presupuestoItems', JSON.stringify(presupuestoItems));
}

function agregarPresupuesto(nombre, valor) {
    // Buscar el checkbox correspondiente y marcarlo
    const checkboxes = document.querySelectorAll('.calc-option input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.getAttribute('data-name') === nombre) {
            checkbox.checked = true;
        }
    });
    
    actualizarTotal();
    
    // Scroll a la calculadora
    document.getElementById('calculadora').scrollIntoView({ behavior: 'smooth' });
    
    // Mostrar notificación
    mostrarNotificacion(`${nombre} agregado al presupuesto`);
}

function solicitarCotizacion() {
    if (presupuestoItems.length === 0) {
        alert('Por favor selecciona al menos un producto o servicio.');
        return;
    }
    
    // Guardar items para el formulario
    localStorage.setItem('presupuestoItems', JSON.stringify(presupuestoItems));
    
    // Scroll al formulario de contacto
    document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
    
    // Prellenar mensaje
    const mensajeTextarea = document.querySelector('textarea[name="mensaje"]');
    if (mensajeTextarea) {
        const itemsList = presupuestoItems.map(item => `- ${item.name}: $${item.value.toLocaleString()}`).join('\n');
        mensajeTextarea.value = `Me interesa cotizar los siguientes productos:\n${itemsList}\n\nTotal estimado: ${document.getElementById('totalPresupuesto').textContent}`;
    }
}

function mostrarNotificacion(mensaje) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: var(--color-accent, #38a169);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

/**
 * Form Handling
 */
function initFormHandling() {
    const form = document.getElementById('formContacto');
    const modal = document.getElementById('modalConfirmacion');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(form)) {
                submitForm(form);
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    }
    
    // Close modal on outside click
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                cerrarModal();
            }
        });
    }
}

function validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll('input[required], select[required]');
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    removeError(field);
    
    if (!value) {
        isValid = false;
        errorMessage = 'Este campo es obligatorio';
    } else {
        switch (field.name) {
            case 'nombre':
                if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Ingresa tu nombre completo';
                }
                break;
                
            case 'telefono':
                const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingresa un teléfono válido';
                }
                break;
                
            case 'email':
                if (value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Ingresa un correo válido';
                    }
                }
                break;
                
            case 'direccion':
                if (value.length < 5) {
                    isValid = false;
                    errorMessage = 'Ingresa una dirección válida';
                }
                break;
        }
    }
    
    if (!isValid) {
        showError(field, errorMessage);
    }
    
    return isValid;
}

function showError(field, message) {
    field.classList.add('error');
    field.style.borderColor = '#c53030';
    
    const errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    errorEl.style.cssText = `
        display: block;
        color: #c53030;
        font-size: 0.75rem;
        margin-top: 0.25rem;
    `;
    
    field.parentNode.appendChild(errorEl);
}

function removeError(field) {
    field.classList.remove('error');
    field.style.borderColor = '';
    
    const errorEl = field.parentNode.querySelector('.error-message');
    if (errorEl) {
        errorEl.remove();
    }
}

async function submitForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Obtener datos del formulario
    const formData = {
        nombre: form.querySelector('input[name="nombre"]').value,
        telefono: form.querySelector('input[name="telefono"]').value,
        email: form.querySelector('input[name="email"]')?.value || '',
        direccion: form.querySelector('input[name="direccion"]').value,
        tipo_propiedad: form.querySelector('select[name="tipo_propiedad"]').value,
        mensaje: form.querySelector('textarea[name="mensaje"]')?.value || ''
    };
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>Enviando...</span>
    `;
    
    try {
        // Enviar a Telegram
        const enviado = await enviarLeadTelegram(formData);
        
        if (enviado) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            mostrarModal();
            form.reset();
            
            // Clear presupuesto
            localStorage.removeItem('presupuestoItems');
            presupuestoItems = [];
            actualizarTotal();
        } else {
            throw new Error('Error al enviar');
        }
    } catch (error) {
        console.error('Error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        alert('Hubo un error al enviar. Por favor intenta de nuevo o contáctanos por WhatsApp.');
    }
}

function mostrarModal() {
    const modal = document.getElementById('modalConfirmacion');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModal() {
    const modal = document.getElementById('modalConfirmacion');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * FAQ Toggle
 */
function toggleFaq(button) {
    const faqItem = button.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked if wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

/**
 * Lightbox Gallery
 */
let currentImageIndex = 0;
let galleryImages = [];

function abrirLightbox(button) {
    const item = button.closest('.galeria-item');
    const img = item.querySelector('img');
    const overlay = item.querySelector('.galeria-overlay');
    
    // Get all visible gallery images
    galleryImages = Array.from(document.querySelectorAll('.galeria-item:not([style*="display: none"])'));
    currentImageIndex = galleryImages.indexOf(item);
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const caption = lightbox.querySelector('.lightbox-caption');
    
    lightboxImg.src = img.src;
    caption.textContent = overlay.querySelector('h4').textContent;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function cambiarImagen(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = galleryImages.length - 1;
    } else if (currentImageIndex >= galleryImages.length) {
        currentImageIndex = 0;
    }
    
    const item = galleryImages[currentImageIndex];
    const img = item.querySelector('img');
    const overlay = item.querySelector('.galeria-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    const caption = document.querySelector('.lightbox-caption');
    
    lightboxImg.src = img.src;
    caption.textContent = overlay.querySelector('h4').textContent;
}

// Close lightbox on outside click
document.addEventListener('click', function(e) {
    const lightbox = document.getElementById('lightbox');
    if (e.target === lightbox) {
        cerrarLightbox();
    }
});

// Keyboard navigation for lightbox
document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') cerrarLightbox();
    if (e.key === 'ArrowLeft') cambiarImagen(-1);
    if (e.key === 'ArrowRight') cambiarImagen(1);
});

/**
 * Smooth Scroll
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Utility: Debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
