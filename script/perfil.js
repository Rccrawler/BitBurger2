document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const nombreInput = document.getElementById('nombre');
    const apellidosInput = document.getElementById('apellidos');
    const telefonoInput = document.getElementById('telefono');
    const profileImageElement = document.getElementById('profileImage');
    const searchBarPlaceholder = document.querySelector('.search-bar-placeholder');

    // --- NUEVOS CAMPOS DE DIRECCIÓN ---
    const dirCalleInput = document.getElementById('direccion_calle');
    const dirNumeroInput = document.getElementById('direccion_numero');
    const dirPisoPuertaInput = document.getElementById('direccion_piso_puerta');
    const dirCiudadInput = document.getElementById('direccion_ciudad');
    const dirCodigoPostalInput = document.getElementById('direccion_codigo_postal');
    const dirPaisInput = document.getElementById('direccion_pais');
    // Campos de fecha de nacimiento (opcionales, no se envían al backend en este ejemplo)
    // const dobDayInput = document.getElementById('dob-day');
    // const dobMonthInput = document.getElementById('dob-month');
    // const dobYearInput = document.getElementById('dob-year');


    const logOutButton = document.querySelector('.log-out-button');
    const changePicButton = document.querySelector('.change-pic-button');

    const CONTROLLER_SERVLET_URL = 'http://localhost:8080/BitBurger/Controller';
    const IMAGE_SERVLET_URL = 'http://localhost:8080/BitBurger/ImageServlet';

    let currentUser = null;

    function loadUserProfile() {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            console.warn('No hay usuario logueado, redirigiendo al login desde perfil.js');
            window.location.href = 'login.html';
            return;
        }

        try {
            currentUser = JSON.parse(storedUser);
            if (!currentUser || !currentUser.idUsuario) {
                throw new Error("Datos de usuario inválidos en localStorage");
            }
        } catch (error) {
            console.error("Error al parsear datos del usuario de localStorage:", error);
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            return;
        }

        // Rellenar datos básicos del usuario
        if (nombreInput) nombreInput.value = currentUser.nombre || '';
        if (apellidosInput) apellidosInput.value = currentUser.apellido || '';
        if (telefonoInput) telefonoInput.value = currentUser.telefonoPrincipal || '';
        if (searchBarPlaceholder && currentUser.nombre) {
            searchBarPlaceholder.placeholder = `Bienvenido/a, ${currentUser.nombre}!`;
        }

        // Rellenar datos de la dirección principal si existen
        if (currentUser.direccionPrincipal && typeof currentUser.direccionPrincipal === 'object') {
            const dir = currentUser.direccionPrincipal;
            if (dirCalleInput) dirCalleInput.value = dir.calle || '';
            if (dirNumeroInput) dirNumeroInput.value = dir.numero || '';
            if (dirPisoPuertaInput) dirPisoPuertaInput.value = dir.pisoPuerta || '';
            if (dirCiudadInput) dirCiudadInput.value = dir.ciudad || '';
            if (dirCodigoPostalInput) dirCodigoPostalInput.value = dir.codigoPostal || '';
            if (dirPaisInput) dirPaisInput.value = dir.pais || '';
        } else {
            // Limpiar campos de dirección si no hay dirección principal
            if (dirCalleInput) dirCalleInput.value = '';
            if (dirNumeroInput) dirNumeroInput.value = '';
            if (dirPisoPuertaInput) dirPisoPuertaInput.value = '';
            if (dirCiudadInput) dirCiudadInput.value = '';
            if (dirCodigoPostalInput) dirCodigoPostalInput.value = '';
            if (dirPaisInput) dirPaisInput.value = '';
        }

        // Mostrar imagen de perfil
        if (profileImageElement) {
            profileImageElement.src = `${IMAGE_SERVLET_URL}?userId=${currentUser.idUsuario}&t=${new Date().getTime()}`;
            profileImageElement.alt = `Foto de ${currentUser.nombre || 'usuario'}`;
            profileImageElement.onerror = function() {
                this.onerror = null;
                this.src = '../img/inicio/usuario.png';
                console.warn(`ImageServlet en ${IMAGE_SERVLET_URL} no encontró imagen o falló para userId=${currentUser.idUsuario}. Usando placeholder local.`);
            };
        } else {
            console.error("Elemento con ID 'profileImage' no encontrado.");
        }
        console.log('Perfil cargado para:', currentUser);
    }

    function displayProfileMessage(message, type = 'error') {
        let messageContainer = document.getElementById('profile-message-placeholder');
        if (!messageContainer && profileForm) { // Intentar añadirlo si no existe, aunque ya debería estar en el HTML
            messageContainer = document.createElement('div');
            messageContainer.id = 'profile-message-placeholder';
            profileForm.parentNode.insertBefore(messageContainer, profileForm.nextSibling); // O antes del botón de guardar
        }
        if (messageContainer) {
            messageContainer.innerHTML = `<p class="msg-${type}">${message}</p>`; // Usar msg-success o msg-error para CSS
             messageContainer.className = `form-message msg-${type}`; // Para estilos
            setTimeout(() => { 
                messageContainer.innerHTML = ''; 
                messageContainer.className = 'form-message'; // Limpiar clases de tipo
            }, 5000);
        } else {
            alert(message);
        }
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (!currentUser || !currentUser.idUsuario) {
                displayProfileMessage('Error: No se pudo identificar al usuario.', 'error');
                return;
            }

            const formData = new URLSearchParams();
            formData.append('ACTION', 'USUARIO.UPDATE');
            formData.append('idUsuario', currentUser.idUsuario.toString());

            // Datos del usuario
            if (nombreInput) formData.append('nombre', nombreInput.value);
            if (apellidosInput) formData.append('apellido', apellidosInput.value);
            if (telefonoInput) formData.append('telefonoPrincipal', telefonoInput.value);
            // Opcional: Si permites cambiar rol o contraseña, añádelos aquí.
            // if (document.getElementById('idRol')) formData.append('idRol', document.getElementById('idRol').value);
            // if (document.getElementById('password') && document.getElementById('password').value) formData.append('password', document.getElementById('password').value);


            // --- ENVIAR CAMPOS DE DIRECCIÓN SEPARADOS ---
            if (dirCalleInput) formData.append('direccion_calle', dirCalleInput.value);
            if (dirNumeroInput) formData.append('direccion_numero', dirNumeroInput.value);
            if (dirPisoPuertaInput) formData.append('direccion_piso_puerta', dirPisoPuertaInput.value);
            if (dirCiudadInput) formData.append('direccion_ciudad', dirCiudadInput.value);
            if (dirCodigoPostalInput) formData.append('direccion_codigo_postal', dirCodigoPostalInput.value);
            if (dirPaisInput) formData.append('direccion_pais', dirPaisInput.value);
            // Si la dirección principal tenía un ID, enviarlo para que el backend sepa si actualizar o crear.
            // El ControllerServlet actual ya obtiene la dirección existente del usuario.
            // Si quieres enviar el idDireccion explícitamente:
            // if(currentUser.direccionPrincipal && currentUser.direccionPrincipal.idDireccion > 0){
            //     formData.append('idDireccion', currentUser.direccionPrincipal.idDireccion.toString());
            // }


            try {
                const response = await fetch(CONTROLLER_SERVLET_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
                    body: formData.toString()
                });

                // Siempre intentar parsear como JSON, incluso si no es ok, para obtener el mensaje de error
                let responseData;
                try {
                    responseData = await response.json();
                } catch (jsonError) {
                     console.error("Error parseando respuesta JSON:", jsonError);
                     const textResponse = await response.text(); // Intentar leer como texto
                     displayProfileMessage(`Error del servidor: ${response.status} - Respuesta no es JSON válido. ${textResponse}`, 'error');
                     return;
                }


                if (response.ok && responseData.idUsuario) { // El backend debe devolver el objeto usuario actualizado
                    displayProfileMessage('¡Datos guardados exitosamente!', 'success');
                    localStorage.setItem('currentUser', JSON.stringify(responseData));
                    currentUser = responseData;
                    loadUserProfile(); // Recargar el perfil para mostrar los datos actualizados
                } else {
                    displayProfileMessage(responseData.error || `Error al guardar los datos (HTTP ${response.status}).`, 'error');
                }
            } catch (error) {
                console.error('Error al actualizar perfil:', error);
                displayProfileMessage('Error de conexión o del servidor al guardar.', 'error');
            }
        });
    }

    // --- LOGOUT ---
    if (logOutButton) {
        logOutButton.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            // Opcional: llamar a un endpoint de logout en el backend si es necesario
            displayProfileMessage('Cerrando sesión...', 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        });
    }

    // --- CAMBIAR FOTO ---
    if (changePicButton && profileImageElement) {
        const hiddenFileInput = document.createElement('input');
        hiddenFileInput.type = 'file';
        hiddenFileInput.accept = 'image/*';
        hiddenFileInput.style.display = 'none';
        if (profileForm) { // Añadir al formulario si existe
            profileForm.appendChild(hiddenFileInput);
        } else { // Sino, al body
            document.body.appendChild(hiddenFileInput);
        }

        changePicButton.addEventListener('click', function() {
            hiddenFileInput.click();
        });

        hiddenFileInput.addEventListener('change', async function(event) {
            const file = event.target.files[0];
            if (file && currentUser && currentUser.idUsuario) {
                displayProfileMessage('Cargando imagen...', 'info');
                const fileData = new FormData(); // FormData para enviar archivos
                fileData.append('ACTION', 'USUARIO.UPDATE_FOTO');
                fileData.append('idUsuario', currentUser.idUsuario.toString());
                fileData.append('fotoPerfil', file);

                try {
                    const response = await fetch(CONTROLLER_SERVLET_URL, { method: 'POST', body: fileData });
                    let responseData;
                    try {
                        responseData = await response.json();
                    } catch (jsonError) {
                        console.error("Error parseando respuesta JSON de UPDATE_FOTO:", jsonError);
                        const textResponse = await response.text();
                        displayProfileMessage(`Error del servidor (foto): ${response.status} - ${textResponse}`, 'error');
                        return;
                    }

                    if (response.ok && responseData.success && responseData.usuarioConFotoActualizada) {
                        displayProfileMessage('Foto de perfil actualizada.', 'success');
                        localStorage.setItem('currentUser', JSON.stringify(responseData.usuarioConFotoActualizada));
                        currentUser = responseData.usuarioConFotoActualizada;
                        if (profileImageElement) {
                            profileImageElement.src = `${IMAGE_SERVLET_URL}?userId=${currentUser.idUsuario}&t=${new Date().getTime()}`;
                        }
                    } else {
                        displayProfileMessage(responseData.error || `Error al actualizar la foto (HTTP ${response.status}).`, 'error');
                    }
                } catch (error) {
                    console.error('Error al subir foto:', error);
                    displayProfileMessage('Error de conexión al subir la foto.', 'error');
                }
            }
        });
    }

    // Carga inicial del perfil
    loadUserProfile();
});