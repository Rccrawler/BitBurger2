// script/beneficios.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página de Beneficios cargada y lista para animaciones.");

    // --- LÓGICA DE ANIMACIÓN CON INTERSECTION OBSERVER ---
    const animatedBenefitItems = document.querySelectorAll('.benefit-item');

    if (animatedBenefitItems.length > 0) {
        const observerOptions = {
            root: null, // Observa la intersección con el viewport
            rootMargin: '0px', // Sin margen adicional alrededor del viewport
            threshold: 0.1 // El 10% del item debe ser visible para activar la animación
                           // Puedes ajustar este valor (e.g., 0.2 para 20%)
        };

        const observerCallback = (entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observerInstance.unobserve(entry.target); // Deja de observar después de animar una vez
                }
            });
        };

        // Crear la instancia del Observer
        const benefitObserver = new IntersectionObserver(observerCallback, observerOptions);

        // Observar cada item de beneficio
        animatedBenefitItems.forEach(item => {
            benefitObserver.observe(item);
        });
    } else {
        console.log("No se encontraron elementos .benefit-item para animar.");
    }
});