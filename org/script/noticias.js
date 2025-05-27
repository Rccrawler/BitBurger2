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

    // --- Lógica del Formulario de Noticias ---
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

            addNewsItemToPage(title, content, category);

            // Limpiar formulario y cerrar modal
            newsForm.reset();
            if (modalOverlay) modalOverlay.classList.add('hidden');

            alert('¡Noticia publicada con éxito! (Simulación)');
        });
    }

    function addNewsItemToPage(title, content, categoryId) {
        const newsSection = document.getElementById(categoryId);
        if (!newsSection) {
            console.error(`No se encontró la sección de noticias con ID: ${categoryId}`);
            // Por defecto, añadir a la sección general si la categoría no se encuentra
            const generalNewsSection = document.getElementById('general-news');
            if (generalNewsSection) {
                 generalNewsSection.appendChild(createNewsElement(title, content, "Desconocido"));
            }
            return;
        }

        const author = "Tú (Empleado)"; // Simulación de autor
        newsSection.appendChild(createNewsElement(title, content, author));
    }

    function createNewsElement(title, content, author) {
        const article = document.createElement('article');
        article.classList.add('news-item');

        const h3 = document.createElement('h3');
        h3.textContent = title;

        const meta = document.createElement('p');
        meta.classList.add('news-meta');
        const today = new Date();
        const dateString = `Publicado el ${today.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} por ${author}`;
        meta.textContent = dateString;

        const pContent = document.createElement('p');
        pContent.textContent = content;

        article.appendChild(h3);
        article.appendChild(meta);
        article.appendChild(pContent);

        return article;
    }

    // ---- Cargar noticias de ejemplo (opcional, si no hay pre-cargadas en HTML) ----
    // Podrías tener un array de objetos de noticias y renderizarlas al cargar
    // Ejemplo:
    /*
    const sampleNews = [
        { title: "Mantenimiento Programado", content: "El sistema estará en mantenimiento el próximo viernes.", categoryId: "general-news", author: "Soporte TI" },
        { title: "Carlos R. gana el concurso de ideas", content: "¡Felicidades a Carlos por su innovadora propuesta para reducir el desperdicio de papel!", categoryId: "employee-achievements", author: "Comité de Innovación"}
    ];

    sampleNews.forEach(news => {
        const section = document.getElementById(news.categoryId);
        if (section) {
            section.appendChild(createNewsElement(news.title, news.content, news.author));
        }
    });
    */

});