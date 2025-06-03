document.addEventListener('DOMContentLoaded', function() {
    console.log("Página de Bienvenido cargada y rediseñada con animaciones.");

    // --- Employee Name Update (Do this first) ---
    const employeeNameSpan = document.querySelector('.welcome-hero h1 .hero-employee-name');
    if (employeeNameSpan) {
        const storedName = localStorage.getItem('employeeName'); 
        if (storedName && storedName.trim() !== "") {
            employeeNameSpan.textContent = storedName; // Update the name content if available
        }
        // If no stored name, it will use the default content from HTML (e.g., "BitBurger")
    }

    // --- Animate Hero Title Letters ---
    const heroTitle = document.querySelector('.welcome-hero h1.animate-hero-title');
    if (heroTitle) {
        const childNodes = Array.from(heroTitle.childNodes); // Get all children: text nodes and element nodes
        heroTitle.innerHTML = ''; // Clear existing H1 content to rebuild it with animated spans
        let charOverallDelay = 0; // Used to stagger animation for each character

        childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) { // If it's a plain text part (e.g., "WELCOME, to ")
                const text = node.textContent;
                text.split('').forEach(char => {
                    if (char === ' ' || char === '\u00A0' /* Non-breaking space */) { 
                        // Preserve spaces as simple text nodes, not animated spans
                        heroTitle.appendChild(document.createTextNode(char));
                    } else {
                        const span = document.createElement('span');
                        span.className = 'char';
                        span.textContent = char;
                        span.style.animationDelay = `${charOverallDelay * 0.05}s`;
                        heroTitle.appendChild(span);
                        charOverallDelay++;
                    }
                });
            } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('hero-employee-name')) {
                // This is the <span class="hero-employee-name">BitBurger</span> (or the actual employee name)
                const nameText = node.textContent; // Get the text inside (e.g., "BitBurger" or "John Doe")
                
                // Keep the original span for its class, but fill it with animated characters
                const nameSpanContainer = node.cloneNode(false); // Clone the span without its children
                nameSpanContainer.innerHTML = ''; // Ensure it's empty before adding new char spans

                nameText.split('').forEach(nameChar => {
                    if (nameChar === ' ' || nameChar === '\u00A0') {
                        nameSpanContainer.appendChild(document.createTextNode(nameChar));
                    } else {
                        const charSpan = document.createElement('span');
                        charSpan.className = 'char'; // Each letter inside the name gets animated
                        charSpan.textContent = nameChar;
                        charSpan.style.animationDelay = `${charOverallDelay * 0.05}s`;
                        nameSpanContainer.appendChild(charSpan);
                        charOverallDelay++;
                    }
                });
                heroTitle.appendChild(nameSpanContainer); // Add the fully reconstructed name span to H1
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // For any other elements (e.g., <br>), just append them as they are
                heroTitle.appendChild(node.cloneNode(true));
            }
        });
    }

    // Smooth scroll for the "Explore Your Intranet" button
    const exploreButton = document.querySelector('.btn-explore');
    if (exploreButton && exploreButton.getAttribute('href') === '#quick-nav') {
        exploreButton.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.getElementById('quick-nav');
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // --- Scroll-Triggered Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    
                    // This handles children that need staggered delays, like nav-cards
                    // The CSS .animate-on-scroll.is-visible .animated-child[data-delay] handles the actual animation start
                    
                    // Optional: Unobserve after animation if you don't want it to re-animate
                    // observerInstance.unobserve(entry.target);
                }
                // Optional: To re-animate if it scrolls out and back in (remove unobserve)
                // else {
                //    entry.target.classList.remove('is-visible');
                // }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
});