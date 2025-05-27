document.addEventListener('DOMContentLoaded', () => {
    // --- INICIO: REDIRIGIR SI YA HAY SESIÓN ---
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        console.log('Usuario ya logueado, redirigiendo a perfil desde register.js');
        window.location.href = 'perfil.html'; // O la ruta correcta a tu perfil.html
        return; // Detener la ejecución del resto del script de registro
    }
    // --- FIN: REDIRIGIR SI YA HAY SESIÓN ---

    const registerForm = document.getElementById('registerForm');
    const nombreInput = document.getElementById('nombre');
    // ... (resto del código de register.js sin cambios) ...
    const apellidosInput = document.getElementById('apellidos');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordErrorSpan = document.getElementById('password-confirm-error');
    const terminosCheckbox = document.getElementById('terminos');

    const SERVLET_URL = 'http://localhost:8080/BitBurger/Controller';

    function displayFormMessage(message, type = 'error') {
        let messageContainer = document.getElementById('form-message-placeholder');
        if (!messageContainer && registerForm) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'form-message-placeholder';
            registerForm.parentNode.insertBefore(messageContainer, registerForm);
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

    function validatePasswordConfirmation() {
        if (!passwordInput || !confirmPasswordInput) return true;

        if (passwordInput.value !== confirmPasswordInput.value) {
            if (passwordErrorSpan) {
                passwordErrorSpan.textContent = 'Las contraseñas no coinciden.';
                passwordErrorSpan.style.display = 'block';
            }
            confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden.');
            return false;
        } else {
            if (passwordErrorSpan) {
                passwordErrorSpan.textContent = '';
                passwordErrorSpan.style.display = 'none';
            }
            confirmPasswordInput.setCustomValidity('');
            return true;
        }
    }

    if (passwordInput && confirmPasswordInput) {
        passwordInput.addEventListener('input', validatePasswordConfirmation);
        confirmPasswordInput.addEventListener('input', validatePasswordConfirmation);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            if (!validatePasswordConfirmation()) {
                confirmPasswordInput.focus();
                return;
            }

            if (terminosCheckbox && !terminosCheckbox.checked) {
                displayFormMessage('Debes aceptar los términos y condiciones.');
                terminosCheckbox.focus();
                return;
            }

            const nombre = nombreInput ? nombreInput.value : '';
            const apellido = apellidosInput ? apellidosInput.value : '';
            const email = emailInput ? emailInput.value : '';
            const password = passwordInput ? passwordInput.value : '';
            const ID_ROL_CLIENTE = 2; // AJUSTA ESTO AL ID REAL DE TU ROL 'cliente'

            const formData = new URLSearchParams();
            formData.append('ACTION', 'USUARIO.REGISTER');
            formData.append('nombre', nombre);
            formData.append('apellido', apellido);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('idRol', ID_ROL_CLIENTE.toString());

            try {
                const response = await fetch(SERVLET_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString()
                });

                const responseData = await response.json();

                if (response.ok && responseData.idUsuario) {
                    displayFormMessage('¡Registro exitoso! Redirigiendo al login...', 'success');
                    if (typeof aceptarCookies === 'function') {
                        aceptarCookies();
                    }
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    displayFormMessage(responseData.error || 'Error en el registro. Inténtalo de nuevo.');
                }

            } catch (error) {
                console.error('Error en la solicitud de registro:', error);
                displayFormMessage('Error de conexión o del servidor. Inténtalo más tarde.');
            }
        });
    }
});