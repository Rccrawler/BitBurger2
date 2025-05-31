// script/convenio.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página de Convenio cargada y lista para animaciones internas.");

    const viewer = document.querySelector('.document-viewer');
    if (!viewer) {
        console.warn("Elemento .document-viewer no encontrado para animaciones internas.");
        return;
    }

    // Seleccionamos los hijos directos o elementos específicos que queremos animar
    // dentro de .document-viewer.
    // El selector ">" asegura que solo sean hijos directos, si la estructura es así.
    // Si hay anidamiento y quieres animar elementos más profundos, ajusta el selector.
    // Para el HTML de convenio.html, los elementos son hijos directos del .document-viewer
    // excepto los párrafos dentro de .external-convenio-link, pero animaremos el contenedor.
    const elementsToAnimate = viewer.querySelectorAll(
        ':scope > .document-subtitle, :scope > .section-heading, :scope > .document-paragraph, :scope > em, :scope > .download-link-container'
    );
    // :scope se refiere al propio 'viewer'

    if (!elementsToAnimate.length) {
        console.warn("No se encontraron elementos para animar dentro de .document-viewer.");
        return;
    }

    const observerOptions = {
        root: null, // Observa la intersección con el viewport
        rootMargin: '0px 0px -50px 0px', // Activa ~50px antes de que el fondo del elemento sea visible
        threshold: 0.1 // El 10% del item debe ser visible (puedes poner 0 para que se active apenas entre)
    };

    const observerCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Opcional: añadir un delay escalonado para elementos que aparecen JUNTOS en el viewport al cargar.
                // Si ya entran de uno en uno con el scroll, este delay es menos crucial.
                // Puedes experimentar con esto si lo ves necesario.
                // const delay = index * 0.08; // 80ms de diferencia entre cada elemento
                // element.style.transitionDelay = `${delay}s`;

                element.classList.add('animate-in');
                observer.unobserve(element); // Deja de observar después de animar una vez
            }
        });
    };

    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);

    elementsToAnimate.forEach(item => {
        intersectionObserver.observe(item);
    });
});