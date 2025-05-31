// js/employee-guard.js
(function() { // IIFE para evitar contaminación del ámbito global
    const currentUserStr = localStorage.getItem('currentUser');
    
    // Define los IDs de rol que se consideran empleados/autorizados
    // Debes obtener estos IDs de tu base de datos.
    // Ejemplo: 1 = Administrador, 3 = Empleado
    const AUTHORIZED_ROLE_IDS = [1, 3]; 

    // Ruta a la página de login. AJUSTA ESTA RUTA según la ubicación
    // de tus páginas de empleado respecto a la página de login.
    // Si las páginas de empleado están en /org/pagina.html y login.html está en /pages/login.html
    // la ruta podría ser '../pages/login.html'
    const LOGIN_PAGE_URL = '../pages/login.html'; // Ajusta según tu estructura

    // Página a la que redirigir si el usuario está logueado pero no es empleado
    // Podría ser la carta, el perfil, o una página de "acceso denegado".
    const UNAUTHORIZED_REDIRECT_URL = '../pages/carta.html'; // Ajusta

    if (!currentUserStr) {
        console.log('EmployeeGuard: No hay usuario logueado. Redirigiendo a login.');
        window.location.href = LOGIN_PAGE_URL;
        return; // Detiene la ejecución para evitar que se cargue el resto de la página
    }

    let currentUser;
    try {
        currentUser = JSON.parse(currentUserStr);
    } catch (error) {
        console.error('EmployeeGuard: Error parseando currentUser. Limpiando y redirigiendo a login.', error);
        localStorage.removeItem('currentUser');
        window.location.href = LOGIN_PAGE_URL;
        return;
    }

    if (!currentUser || typeof currentUser.idUsuario === 'undefined' || typeof currentUser.idRol === 'undefined') {
        console.warn('EmployeeGuard: currentUser inválido o sin idRol. Limpiando y redirigiendo a login.');
        localStorage.removeItem('currentUser');
        window.location.href = LOGIN_PAGE_URL;
        return;
    }

    // Verificar si el idRol del usuario está en la lista de roles autorizados
    if (!AUTHORIZED_ROLE_IDS.includes(currentUser.idRol)) {
        console.log(`EmployeeGuard: Usuario ${currentUser.email} (Rol ID: ${currentUser.idRol}) no autorizado. Redirigiendo.`);
        // Opcional: Mostrar un mensaje antes de redirigir
        // alert('No tienes permisos para acceder a esta sección.');
        window.location.href = UNAUTHORIZED_REDIRECT_URL; 
        return;
    }

    // Si llegamos aquí, el usuario está logueado y tiene un rol autorizado.
    console.log(`EmployeeGuard: Acceso concedido para ${currentUser.email} (Rol ID: ${currentUser.idRol}).`);

})(); // Ejecuta la función inmediatamente