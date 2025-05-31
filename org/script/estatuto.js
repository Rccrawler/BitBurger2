// script/estatuto.js
// ../script/estatuto.js

document.addEventListener('DOMContentLoaded', () => {
    // Puedes mantener tu console.log si quieres, o quitarlo
    console.log("Página de Estatuto cargada y lista para animaciones.");

    const animatedItems = document.querySelectorAll('.key-point-item');

    if (!animatedItems.length) {
        // Si no hay elementos .key-point-item, no hacemos nada más
        console.log("No se encontraron elementos .key-point-item para animar.");
        return;
    }

    const observerOptions = {
        root: null, // Observa la intersección con el viewport
        rootMargin: '0px', // Sin margen adicional alrededor del viewport
        threshold: 0.1 // El 10% del item debe ser visible para activar la animación
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log("Elemento visible:", entry.target.id || "un item sin id");
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target); // Deja de observar después de animar una vez
            }
        });
    };

    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);

    animatedItems.forEach(item => {
        console.log("Observando item:", item.id || "un item sin id");
        intersectionObserver.observe(item);
    });
});