// --- START OF FILE cookies.js ---

// Comprobar si el usuario ya aceptó
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('cookiesAceptadas') === 'true') {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.add('hidden');
        }
    }
});

// Guardar preferencia y ocultar cartel
function aceptarCookies() {
    localStorage.setItem('cookiesAceptadas', 'true');
    localStorage.setItem('cookiesPreferencias', JSON.stringify({
        analiticas: true,
        publicidad: true
    }));
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.classList.add('hidden');
    }
    console.log('Cookies aceptadas y preferencias guardadas.'); // Para depuración
}

// Abrir configuración de cookies
function abrirConfiguracion() {
    const modal = document.getElementById('configurar-cookies-modal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.warn('Modal de configuración de cookies no encontrado.');
    }
}

// Guardar configuración
function guardarConfiguracion() {
    const form = document.getElementById('configurar-cookies-form');
    if (!form) {
        console.error('Formulario de configuración de cookies no encontrado.');
        return;
    }
    const preferencias = {
        analiticas: form.elements['cookies-analiticas'].checked,
        publicidad: form.elements['cookies-publicidad'].checked
    };
    localStorage.setItem('cookiesPreferencias', JSON.stringify(preferencias));
    localStorage.setItem('cookiesAceptadas', 'true');

    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.classList.add('hidden');
    }
    cerrarConfiguracion();
    console.log('Configuración de cookies guardada.'); // Para depuración
}

// Cerrar modal de configuración
function cerrarConfiguracion() {
    const modal = document.getElementById('configurar-cookies-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}
// --- END OF FILE cookies.js ---