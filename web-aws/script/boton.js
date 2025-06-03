document.addEventListener('DOMContentLoaded', () => {
    const mainButton = document.getElementById('mainButton');
    const optionsMenu = document.getElementById('optionsMenu');

    // URL a la que navegar en el segundo clic del botón principal.
    // Puedes definirla aquí o pasarla de alguna manera si necesitas que sea más dinámica.
        
    const secondClickUrl = '/';
    
    if (mainButton && optionsMenu) {
        mainButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Evita que el clic se propague al 'document' inmediatamente

            const isVisible = optionsMenu.classList.contains('visible');

            if (!isVisible) {
                optionsMenu.classList.add('visible');
                mainButton.setAttribute('aria-expanded', 'true');
            } else {
                // En el segundo clic (cuando el menú ya está visible), navegamos
                console.log(`Botón principal (segundo clic): Redirigiendo a: ${secondClickUrl}`);
                window.location.href = secondClickUrl;
            }
        });

        // Event listener para cerrar el menú si se hace clic fuera de él
        document.addEventListener('click', (event) => {
            // Comprobar que el menú esté visible Y que el clic NO sea en el menú ni en el botón principal
            if (optionsMenu.classList.contains('visible') &&
                !optionsMenu.contains(event.target) &&
                !mainButton.contains(event.target))
            {
                 optionsMenu.classList.remove('visible');
                 mainButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Event listeners para los botones de opción dentro del menú
        const optionButtons = optionsMenu.querySelectorAll('.option-button');
        optionButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Detiene la propagación
                
                const targetUrl = button.dataset.url; // Obtener la URL del atributo data-url

                if (targetUrl) {
                    console.log(`Botón de opción: Redirigiendo a: ${targetUrl}`);
                    window.location.href = targetUrl;
                } else {
                    const buttonText = button.querySelector('.option-text') ? button.querySelector('.option-text').textContent.trim() : 'un botón de opción sin texto';
                    alert(`URL no definida para el botón: ${buttonText}`);
                }
                
                // Siempre cerramos el menú después de interactuar con una opción (incluso si no navega)
                optionsMenu.classList.remove('visible');
                mainButton.setAttribute('aria-expanded', 'false');
            });
        });

    } else {
        if (!mainButton) console.error("No se encontró el elemento #mainButton.");
        if (!optionsMenu) console.error("No se encontró el elemento #optionsMenu.");
    }
});