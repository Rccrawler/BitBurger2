// script/noticias.js
document.addEventListener('DOMContentLoaded', function() {
    const openModalBtn = document.getElementById('openPostNewsModalBtn');
    const closeModalBtn = document.getElementById('closePostNewsModalBtn');
    const modalOverlay = document.getElementById('postNewsModal');
    const newsForm = document.getElementById('postNewsForm');

    // --- Lógica del Modal ---
    if (openModalBtn && modalOverlay) {
        openModalBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('hidden');
        });
    }

    if (closeModalBtn && modalOverlay) {
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.classList.add('hidden');
        });
    }

    if (modalOverlay) {
        // Cerrar modal si se hace clic fuera del contenido del modal
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                modalOverlay.classList.add('hidden');
            }
        });
    }

    // --- Lógica del Formulario de Noticias (definir funciones antes de usarlas en el observer) ---
    
    // La función createNewsElement se define aquí para que esté disponible globalmente en este script
    function createNewsElement(title, content, author) {
        const article = document.createElement('article');
        article.classList.add('news-item'); // La animación se basará en esta clase

        const h3 = document.createElement('h3');
        h3.textContent = title;

        const meta = document.createElement('p');
        meta.classList.add('news-meta');
        const today = new Date();
        // Mantener el formato de fecha en español como en el original, o cambiar si se traduce toda la app
        const dateString = `Publicado el ${today.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} por ${author}`;
        meta.textContent = dateString;

        const pContent = document.createElement('p');
        pContent.textContent = content;

        article.appendChild(h3);
        article.appendChild(meta);
        article.appendChild(pContent);

        return article;
    }

    // --- LÓGICA DE ANIMACIÓN CON INTERSECTION OBSERVER ---
    
    // Opciones y Callback del Observer (definidos una vez)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // 10% del item visible para activar la animación
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
    const newsObserver = new IntersectionObserver(observerCallback, observerOptions);

    // Función para observar un item específico
    function observeNewsItem(item) {
        if (item && newsObserver) {
            newsObserver.observe(item);
        }
    }
    
    // Modificar addNewsItemToPage para usar la función de observar
    function addNewsItemToPage(title, content, categoryId) {
        const newsSection = document.getElementById(categoryId);
        let targetSection = newsSection;

        if (!newsSection) {
            console.error(`No se encontró la sección de noticias con ID: ${categoryId}`);
            targetSection = document.getElementById('general-news'); // Fallback a la sección general
            if (!targetSection) {
                console.error('La sección de fallback "general-news" tampoco se encontró.');
                return null; // No se puede añadir el elemento
            }
        }
        
        const author = "Tú (Empleado)"; // Simulación de autor - puedes cambiar esto o hacerlo dinámico
        const newsElement = createNewsElement(title, content, author);
        targetSection.appendChild(newsElement);
        
        // *** AÑADIR EL NUEVO ITEM AL OBSERVER PARA ANIMACIÓN ***
        observeNewsItem(newsElement); 
        
        return newsElement; // Devolver el elemento creado para posible uso futuro
    }

    // Observar items existentes al cargar la página
    const initialNewsItems = document.querySelectorAll('.news-item');
    if (initialNewsItems.length > 0) {
        initialNewsItems.forEach(item => {
            observeNewsItem(item);
        });
    }

    // --- Lógica del Formulario de Noticias (Submit Handler) ---
    if (newsForm) {
        newsForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const title = document.getElementById('newsTitle').value.trim();
            const content = document.getElementById('newsContent').value.trim();
            const category = document.getElementById('newsCategory').value;

            if (!title || !content) {
                alert('Por favor, completa el título y el contenido de la noticia.');
                return;
            }

            addNewsItemToPage(title, content, category); // Esta función ahora también maneja la observación del nuevo item

            newsForm.reset();
            if (modalOverlay) modalOverlay.classList.add('hidden');

            alert('¡Noticia publicada con éxito! (Simulación)');
        });
    }

    // ---- Cargar noticias de ejemplo (opcional, si no hay pre-cargadas en HTML) ----
    // Si decides usar esto, asegúrate de que `observeNewsItem` se llame para cada una.
    /*
    const sampleNews = [
        { title: "Mantenimiento Programado", content: "El sistema estará en mantenimiento el próximo viernes.", categoryId: "general-news", author: "Soporte TI" },
        { title: "Carlos R. gana el concurso de ideas", content: "¡Felicidades a Carlos por su innovadora propuesta para reducir el desperdicio de papel!", categoryId: "employee-achievements", author: "Comité de Innovación"}
    ];

    sampleNews.forEach(news => {
        const newsElement = addNewsItemToPage(news.title, news.content, news.categoryId, news.author); // Pasar author si es diferente
        // observeNewsItem(newsElement) ya se llama dentro de addNewsItemToPage
    });
    */
});