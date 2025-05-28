document.addEventListener('DOMContentLoaded', function() {
    const entradaFechaEl = document.getElementById('entrada-fecha');
    const entradaHoraEl = document.getElementById('entrada-hora');
    const salidaFechaEl = document.getElementById('salida-fecha');
    const salidaHoraEl = document.getElementById('salida-hora');

    const clockInButton = document.getElementById('clock-in-button');
    const clockOutButton = document.getElementById('clock-out-button');

    const fichajeStatusContainer = document.getElementById('fichaje-status-container');
    const fichajeStatusMessageEl = document.getElementById('fichaje-status-message');
    const fichajeCountdownEl = document.getElementById('fichaje-countdown');

    const pdfPath = '../img/Calendario 2025.pdf';
    const pdfFileName = 'Calendario_Laboral_2025.pdf';

    // --- Estado del fichaje ---
    let isClockedIn = false;
    let clockInTime = null;
    let countdownIntervalId = null;
    const WORK_DURATION_HOURS = 8; // Jornada laboral de 8 horas
    const WORK_DURATION_MS = WORK_DURATION_HOURS * 60 * 60 * 1000;

    // Función para formatear la hora y fecha (similar a la original pero más concisa)
    function getFormattedDateTime(dateObj) {
        const dia = String(dateObj.getDate()).padStart(2, '0');
        const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
        const anio = dateObj.getFullYear();
        const fecha = `${dia}/${mes}/${anio}`;

        const horas = String(dateObj.getHours()).padStart(2, '0');
        const minutos = String(dateObj.getMinutes()).padStart(2, '0');
        const segundos = String(dateObj.getSeconds()).padStart(2, '0');
        const hora = `${horas}:${minutos}:${segundos}`;
        return { fecha, hora };
    }
    
    // Función para actualizar el reloj de tiempo actual (opcional, si quieres un reloj general)
    // Si solo quieres que las horas de entrada/salida se fijen al pulsar, puedes eliminar esta.
    // Por ahora la mantendré para que los campos "--:--:--" se actualicen con la hora actual ANTES de fichar.
    function updateCurrentTimeDisplay() {
        if (!isClockedIn) { // Solo actualiza si no está fichado o para el campo de salida.
            const ahora = new Date();
            const { fecha, hora } = getFormattedDateTime(ahora);
            if (entradaFechaEl && !clockInTime) entradaFechaEl.textContent = fecha; // Muestra fecha actual si no se ha fichado
            if (entradaHoraEl && !clockInTime) entradaHoraEl.textContent = hora;   // Muestra hora actual si no se ha fichado
            
            // Si queremos que la hora de salida también muestre la hora actual antes de fichar salida:
            // if (salidaFechaEl) salidaFechaEl.textContent = fecha;
            // if (salidaHoraEl) salidaHoraEl.textContent = hora;
        }
    }
    // Llamada inicial y actualización
    // updateCurrentTimeDisplay();
    // setInterval(updateCurrentTimeDisplay, 1000); // Puedes descomentar esto si quieres el reloj vivo

    function formatMillisecondsToHHMMSS(ms) {
        if (ms < 0) ms = 0;
        let seconds = Math.floor((ms / 1000) % 60);
        let minutes = Math.floor((ms / (1000 * 60)) % 60);
        let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

        hours = String(hours).padStart(2, '0');
        minutes = String(minutes).padStart(2, '0');
        seconds = String(seconds).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }

    function startCountdown() {
        if (countdownIntervalId) clearInterval(countdownIntervalId); // Limpiar intervalo anterior si existe

        const endTime = new Date(clockInTime.getTime() + WORK_DURATION_MS);

        countdownIntervalId = setInterval(() => {
            const now = new Date();
            const remainingTimeMs = endTime - now;

            if (remainingTimeMs <= 0) {
                fichajeCountdownEl.textContent = "Workday complete!";
                // Opcional: podrías querer cambiar el mensaje de estado aquí también
                // fichajeStatusMessageEl.textContent = "Workday finished. Please clock out.";
                clearInterval(countdownIntervalId);
                // Opcional: auto clock-out o alguna notificación
            } else {
                fichajeCountdownEl.textContent = `Time remaining: ${formatMillisecondsToHHMMSS(remainingTimeMs)}`;
            }
        }, 1000);
        
        // Ejecutar una vez inmediatamente para no esperar 1 segundo
        const initialRemainingTimeMs = endTime - new Date();
        if (initialRemainingTimeMs <= 0) {
             fichajeCountdownEl.textContent = "Workday complete!";
             clearInterval(countdownIntervalId);
        } else {
            fichajeCountdownEl.textContent = `Time remaining: ${formatMillisecondsToHHMMSS(initialRemainingTimeMs)}`;
        }
    }

    function handleClockIn() {
        if (isClockedIn) return; // Ya está fichado

        isClockedIn = true;
        clockInTime = new Date();
        const { fecha, hora } = getFormattedDateTime(clockInTime);

        entradaFechaEl.textContent = fecha;
        entradaHoraEl.textContent = hora;

        // Limpiar campos de salida por si había un fichaje anterior
        salidaFechaEl.textContent = "--/--/----";
        salidaHoraEl.textContent = "--:--:--";

        fichajeStatusMessageEl.textContent = "You are CLOCKED IN.";
        fichajeStatusContainer.style.display = 'block';
        startCountdown();

        clockInButton.disabled = true;
        clockOutButton.disabled = false;

        // Aquí iría la lógica real para enviar los datos al servidor.
        console.log(`Clocked IN at ${hora} on ${fecha}`);
    }

    function handleClockOut() {
        if (!isClockedIn) return; // No estaba fichado

        isClockedIn = false;
        const now = new Date();
        const { fecha, hora } = getFormattedDateTime(now);

        salidaFechaEl.textContent = fecha;
        salidaHoraEl.textContent = hora;

        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
        
        fichajeStatusMessageEl.textContent = "You have CLOCKED OUT.";
        fichajeCountdownEl.textContent = `Total time: ${formatMillisecondsToHHMMSS(now - clockInTime)}`; // Muestra tiempo total trabajado
        // O puedes ocultar el countdown: fichajeCountdownEl.textContent = '';

        clockInTime = null; // Resetear hora de entrada

        clockInButton.disabled = false;
        clockOutButton.disabled = true;
        
        // Aquí iría la lógica real para enviar los datos al servidor.
        console.log(`Clocked OUT at ${hora} on ${fecha}`);
        // Podrías ocultar el contenedor de estado después de un tiempo
        // setTimeout(() => { fichajeStatusContainer.style.display = 'none'; }, 5000);
    }

    // --- Event Listeners para botones de fichaje ---
    if (clockInButton) {
        clockInButton.addEventListener('click', handleClockIn);
    }

    if (clockOutButton) {
        clockOutButton.addEventListener('click', handleClockOut);
    }

    // Estado inicial de los botones
    clockOutButton.disabled = true; // Empezamos sin poder fichar salida

    // --- Lógica del botón de descarga (sin cambios) ---
    const downloadButton = document.querySelector('.download-button');
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            const link = document.createElement('a');
            link.href = pdfPath;
            link.download = pdfFileName; 

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});