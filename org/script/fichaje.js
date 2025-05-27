document.addEventListener('DOMContentLoaded', function() {
    const entradaFechaEl = document.getElementById('entrada-fecha');
    const entradaHoraEl = document.getElementById('entrada-hora');
    const salidaFechaEl = document.getElementById('salida-fecha');
    const salidaHoraEl = document.getElementById('salida-hora');

    // --- Ruta al PDF para DESCARGAR ---
    // Asegúrate que esta ruta apunte a tu archivo PDF original.
    // El nombre del archivo debe ser exacto, incluyendo espacios si los tiene.
    const pdfPath = '../img/Calendario 2025.pdf';
    // Nombre que tendrá el archivo al descargarse (mejor sin espacios para compatibilidad)
    const pdfFileName = 'Calendario_Laboral_2025.pdf';

    function actualizarHoraFecha() {
        const ahora = new Date();

        const dia = String(ahora.getDate()).padStart(2, '0');
        const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexados
        const anio = ahora.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${anio}`;

        const horas = String(ahora.getHours()).padStart(2, '0');
        // --- CORRECCIÓN AQUÍ ---
        // Definir minutos y segundos ANTES de usarlos en horaFormateada
        const minutos = String(ahora.getMinutes()).padStart(2, '0');
        const segundos = String(ahora.getSeconds()).padStart(2, '0');
        const horaFormateada = `${horas}:${minutos}:${segundos}`;
        // --- FIN DE LA CORRECCIÓN ---

        // Actualizar elementos de ENTRADA
        if (entradaFechaEl) entradaFechaEl.textContent = fechaFormateada;
        if (entradaHoraEl) entradaHoraEl.textContent = horaFormateada;

        // Actualizar elementos de SALIDA (esto hará que ambos relojes muestren la hora actual)
        // Si la lógica es que el reloj de salida solo se actualice al fichar la salida,
        // entonces no deberías actualizarlo aquí en cada intervalo.
        // Por ahora, lo dejo como estaba, actualizando ambos.
        if (salidaFechaEl) salidaFechaEl.textContent = fechaFormateada;
        if (salidaHoraEl) salidaHoraEl.textContent = horaFormateada;
    }

    // Llamada inicial para que no espere 1 segundo en mostrarse
    actualizarHoraFecha();
    // Actualizar cada segundo
    setInterval(actualizarHoraFecha, 1000);

    const fichajeBotones = document.querySelectorAll('.fichaje-action-button');
    fichajeBotones.forEach(boton => {
        boton.addEventListener('click', function() {
            // Lógica para cuando se hace clic en "Fichar"
            // Podrías querer actualizar solo la fecha/hora correspondiente (entrada o salida)
            // en el momento del clic, en lugar de tenerla corriendo constantemente.
            // Por ejemplo:
            const ahora = new Date();
            const dia = String(ahora.getDate()).padStart(2, '0');
            const mes = String(ahora.getMonth() + 1).padStart(2, '0');
            const anio = ahora.getFullYear();
            const fechaActual = `${dia}/${mes}/${anio}`;
            const horas = String(ahora.getHours()).padStart(2, '0');
            const minutos = String(ahora.getMinutes()).padStart(2, '0');
            const segundos = String(ahora.getSeconds()).padStart(2, '0');
            const horaActual = `${horas}:${minutos}:${segundos}`;

            const seccionFichaje = this.closest('.fichaje-section');
            const tipoFichajeH2 = seccionFichaje.querySelector('h2');
            const tipoFichaje = tipoFichajeH2.textContent;

            if (tipoFichaje.toUpperCase() === 'ENTRADA') {
                if (entradaFechaEl) entradaFechaEl.textContent = fechaActual;
                if (entradaHoraEl) entradaHoraEl.textContent = horaActual;
            } else if (tipoFichaje.toUpperCase() === 'SALIDA') {
                if (salidaFechaEl) salidaFechaEl.textContent = fechaActual;
                if (salidaHoraEl) salidaHoraEl.textContent = horaActual;
            }

            alert(`Acción para "${tipoFichaje}" registrada a las ${horaActual} del ${fechaActual}`);
            // Aquí iría la lógica real para enviar los datos al servidor.
        });
    });

    const downloadButton = document.querySelector('.download-button');
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            const link = document.createElement('a');
            link.href = pdfPath;
            link.download = pdfFileName; // Este es el nombre con el que se guardará el archivo

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});