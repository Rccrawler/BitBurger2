// script/despidos.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página de Despidos cargada y lista para animaciones.");

    // --- LÓGICA DE ANIMACIÓN CON INTERSECTION OBSERVER ---

    // Seleccionar todos los tipos de elementos que queremos animar
    const elementsToAnimate = document.querySelectorAll(
        '.general-causes, .company-criteria.optional-section, .legal-references, .important-note, .cause-category, .legal-subsection'
    );

    if (elementsToAnimate.length > 0) {
        const observerOptions = {
            root: null, // Observa la intersección con el viewport
            rootMargin: '0px', // Sin margen adicional
            threshold: 0.1 // El 10% del elemento debe ser visible
                           // Puedes ajustar esto si quieres que aparezcan antes o después
        };

        const observerCallback = (entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observerInstance.unobserve(entry.target); // Deja de observar una vez animado
                }
            });
        };

        // Crear la instancia del Observer
        const dismissalsObserver = new IntersectionObserver(observerCallback, observerOptions);

        // Observar cada elemento
        elementsToAnimate.forEach(item => {
            dismissalsObserver.observe(item);
        });
    } else {
        console.log("No se encontraron elementos para animar en la página de despidos.");
    }
});