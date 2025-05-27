document.addEventListener('DOMContentLoaded', () => {
    // --- INICIO: REDIRIGIR SI YA HAY SESIÓN ---
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
        console.log('Usuario ya logueado, evaluando redirección desde login.js');
        try {
            const loggedUser = JSON.parse(currentUserStr);
            // Define aquí los IDs de rol que se consideran empleados/autorizados
            // Debes obtener estos IDs de tu base de datos. Ejemplo: 1 = Administrador, 3 = Empleado
            const AUTHORIZED_ROLE_IDS_FOR_ORG_AREA = [1, 3]; // AJUSTA ESTOS IDs

            // Ruta al panel de empleados/org
            const ORG_PANEL_URL = '../org/dashboard.html'; // AJUSTA si es diferente (ej. panel-empleado.html)
            // Ruta al perfil de cliente normal
            const USER_PROFILE_URL = 'perfil.html'; // O '../pages/perfil.html' si login.html está en otra carpeta

            if (loggedUser && typeof loggedUser.idRol !== 'undefined') {
                if (AUTHORIZED_ROLE_IDS_FOR_ORG_AREA.includes(loggedUser.idRol)) {
                    console.log('Redirigiendo empleado/admin a su panel.');
                    window.location.href = ORG_PANEL_URL;
                } else {
                    console.log('Redirigiendo cliente a su perfil.');
                    window.location.href = USER_PROFILE_URL;
                }
            } else {
                // Si no hay idRol o el usuario es inválido, por seguridad, ir a perfil (o login si quieres ser más estricto)
                console.warn('currentUser sin idRol o inválido, redirigiendo a perfil por defecto.');
                window.location.href = USER_PROFILE_URL;
            }
        } catch (e) {
            console.error('Error parseando currentUser en login.js, redirigiendo a login por seguridad.', e);
            localStorage.removeItem('currentUser'); // Limpiar localStorage corrupto
            // No redirigimos aquí si estamos en login.js para evitar bucle si login.html es la misma página
            // Si esta lógica estuviera en un guard global, sí se redirigiría a login.html
        }
        return; // Detener la ejecución del resto del script de login
    }
    // --- FIN: REDIRIGIR SI YA HAY SESIÓN ---

    const loginForm = document.getElementById('registerForm'); // El ID de tu formulario en login.html es 'registerForm'
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const SERVLET_URL = 'http://localhost:8080/BitBurger/Controller';

    function displayFormMessage(message, type = 'error') {
        let messageContainer = document.getElementById('form-message-placeholder');
        if (!messageContainer && loginForm) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'form-message-placeholder';
            loginForm.parentNode.insertBefore(messageContainer, loginForm);
        }
        if (messageContainer) {
            messageContainer.innerHTML = `<p class="${type}-message" style="color:${type === 'error' ? 'red' : 'green'}; text-align:center; margin-bottom:15px;">${message}</p>`;
            setTimeout(() => {
                messageContainer.innerHTML = '';
            }, 5000);
        } else {
            alert(message);
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = emailInput ? emailInput.value : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!email || !password) {
                displayFormMessage('Por favor, ingresa email y contraseña.');
                return;
            }

            const formData = new URLSearchParams();
            formData.append('ACTION', 'USUARIO.LOGIN');
            formData.append('email', email);
            formData.append('password', password);

            try {
                const response = await fetch(SERVLET_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString()
                });

                const responseData = await response.json();

                if (response.ok && responseData.success && responseData.user) {
                    displayFormMessage('¡Login exitoso! Redirigiendo...', 'success');
                    localStorage.setItem('currentUser', JSON.stringify(responseData.user));

                    if (typeof aceptarCookies === 'function') {
                        aceptarCookies();
                    }

                    // --- INICIO: LÓGICA DE REDIRECCIÓN BASADA EN ROL ---
                    const loggedInUser = responseData.user; // Usuario que acaba de loguearse
                    
                    // Define aquí los IDs de rol que se consideran empleados/autorizados para el área de organización
                    // Debes obtener estos IDs de tu base de datos. Ejemplo: 1 = Administrador, 3 = Empleado
                    const AUTHORIZED_ROLE_IDS_FOR_ORG_AREA = [1, 3]; // AJUSTA ESTOS IDs según tu BD (ej. Rol 'Admin' y 'Empleado')

                    // Ruta al panel de empleados/org
                    const ORG_PANEL_URL = '../org/index.html'; // AJUSTA si la página principal de empleados es otra
                    // Ruta a la carta o perfil para clientes normales
                    const CUSTOMER_REDIRECT_URL = '../pages/carta.html'; // O a perfil.html si prefieres

                    let redirectTo = CUSTOMER_REDIRECT_URL; // Por defecto, redirigir a la página de cliente

                    if (loggedInUser && typeof loggedInUser.idRol !== 'undefined') {
                        if (AUTHORIZED_ROLE_IDS_FOR_ORG_AREA.includes(loggedInUser.idRol)) {
                            console.log(`Usuario ${loggedInUser.email} con rol ${loggedInUser.idRol} es empleado/admin. Redirigiendo a ${ORG_PANEL_URL}.`);
                            redirectTo = ORG_PANEL_URL;
                        } else {
                            console.log(`Usuario ${loggedInUser.email} con rol ${loggedInUser.idRol} es cliente. Redirigiendo a ${CUSTOMER_REDIRECT_URL}.`);
                        }
                    } else {
                        console.warn('Usuario logueado no tiene idRol o es inválido. Redirigiendo a la página de cliente por defecto.');
                    }
                    // --- FIN: LÓGICA DE REDIRECCIÓN BASADA EN ROL ---
                    
                    setTimeout(() => {
                        window.location.href = redirectTo;
                    }, 1500);

                } else {
                    displayFormMessage(responseData.error || 'Email o contraseña incorrectos.');
                }

            } catch (error) {
                console.error('Error en la solicitud de login:', error);
                displayFormMessage('Error de conexión o del servidor. Inténtalo más tarde.');
            }
        });
    }
});