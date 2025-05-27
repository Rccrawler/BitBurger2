/*-------------------------------------------------------------------------------------
* logica del mensaje de advertencia
*------------------------------------------------------------------------------------*/
console.log(
    "%cATTENTION!",
    "color: red; font-size: 48px; font-weight: bold; -webkit-text-stroke: 1px black; text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;"
);
console.log(
    "%cThis is a browser feature intended for developers. If someone told you to copy/paste something here to enable a feature or “hack” something, it is a scam and will likely give them access to your account.",
    "color: red; font-size: 18px; font-weight: bold; margin-top: 10px;"
);

/*-------------------------------------------------------------------------------------
* fin del mensaje de advertencia
*------------------------------------------------------------------------------------*/

document.addEventListener('DOMContentLoaded', () => {
    //const mainButton = document.getElementById('mainButton');
    //const optionsMenu = document.getElementById('optionsMenu');

    //const secondClickUrl = '../index.html';     //  URL a la que navegar en el segundo clic ---

    /*-------------------------------------------------------------------------------------
    * logica del cuadro de estado
    *------------------------------------------------------------------------------------*/

    const statusTextElement = document.getElementById('statusText');
    const orderStatus = "Order in preparation"; // <-- DEFINIR AQUÍ EL TEXTO/ESTADO

    if (statusTextElement) {
        statusTextElement.textContent = orderStatus; // Asignar el texto al span
    } else {
        console.error("No se encontró el elemento #statusText.");
    }

    /*-------------------------------------------------------------------------------------
    * FIN logica para el cuadro de estado
    *------------------------------------------------------------------------------------*/
    /*
    if (mainButton && optionsMenu) {
        mainButton.addEventListener('click', (event) => {
            event.stopPropagation();

            const isVisible = optionsMenu.classList.contains('visible');

            if (!isVisible) {
                optionsMenu.classList.add('visible');
                mainButton.setAttribute('aria-expanded', 'true');
            } else {
                // Navegamos a la URL especificada
                console.log(`Redirigiendo a: ${secondClickUrl}`);
                window.location.href = secondClickUrl;
            }
        });

        document.addEventListener('click', (event) => {
            // Comprobamos que el menú esté visible Y que el clic NO sea ni en el menú ni en el botón principal
            if (optionsMenu.classList.contains('visible') &&
                !optionsMenu.contains(event.target) &&
                !mainButton.contains(event.target))
            {
                 optionsMenu.classList.remove('visible');
                 mainButton.setAttribute('aria-expanded', 'false');
            }
        });

         // Listeners para los botones de opción
        const optionButtons = optionsMenu.querySelectorAll('.option-button');
        optionButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Detiene la propagación para no cerrar el menú si es un clic dentro del menú
                
                const targetUrl = button.dataset.url; // Obtener la URL del atributo data-url

                if (targetUrl) {
                    window.location.href = targetUrl; // Navegar a la URL
                } else {
                    // Si no hay data-url, puedes mantener el alert o hacer otra cosa
                    const buttonText = button.querySelector('.option-text') ? button.querySelector('.option-text').textContent.trim() : 'un botón sin texto';
                    alert(`URL no definida para: ${buttonText}`);
                }
                
                // Opcional: cerrar el menú después de hacer clic, incluso si no navega
                // Si la navegación ocurre, esto no será visible, pero es bueno si hay un error o no hay URL
                optionsMenu.classList.remove('visible');
                mainButton.setAttribute('aria-expanded', 'false');
            });
        });

    } else {
        console.error("No se encontraron los elementos del botón o del menú.");
    }
    */

    /*-------------------------------------------------------------------------------------
    * Lógica del Carrusel (Estándar 3D + Plato Fijo - Items Más Grandes y Centrados)
    *------------------------------------------------------------------------------------*/

    const carouselContainer = document.querySelector('.carousel-section.draggable-carousel .carousel-container');
    const plate = document.getElementById('carouselPlate');
    const items = plate?.querySelectorAll('.carousel-item');

    if (carouselContainer && plate && items && items.length > 0) {
        const itemCount = items.length; // hajustes de posicionamiento
        const anglePerItem = 360 / itemCount;
        const itemBaseScale = 1;
        const itemActiveScale = 2.1;
        const itemActiveRaiseZ = 40;
        const dragSensitivity = 0.4;
        const snapTransitionDuration = '0.9s';

        let radius = calculateRadius();
        let currentIndex = 0;
        let currentRotationY = 0;
        let startX = 0;
        let startRotationY = 0;
        let isDragging = false;

        function calculateRadius() {
            const containerWidth = carouselContainer.offsetWidth;
            return Math.max(160, containerWidth / 2.89); // espacio entre imajnes en el carrusel
        }

        function setupCarousel() {
            radius = calculateRadius();
            console.log("Calculated Radius:", radius);

            plate.style.transform = `rotateY(0deg)`;

            items.forEach((item, index) => {
                positionItem(item, index, radius, 0, index === 0);
            });
        }

        function positionItem(item, index, radius, currentPlateYRotation, isActive) {
            const itemAngle = anglePerItem * index;
            const scale = isActive ? itemActiveScale : itemBaseScale;
            const raiseZ = isActive ? itemActiveRaiseZ : 0;

            const itemTransform = `
                rotateY(${itemAngle}deg)
                translateZ(${radius + raiseZ}px)
                scale(${scale})
            `;

            // Aplicar transición solo si no se está arrastrando
            item.style.transition = isDragging ? 'none' : `transform ${snapTransitionDuration} ease, opacity ${snapTransitionDuration} ease`;
            item.style.transform = itemTransform;

            const effectiveItemAngle = (itemAngle + currentPlateYRotation) % 360;
            const angleRad = effectiveItemAngle * (Math.PI / 180);
            const cosAngle = Math.cos(angleRad);
            const opacityFactor = (cosAngle + 1) / 2;
            const minOpacity = 0.4;
            const opacity = minOpacity + (1 - minOpacity) * Math.pow(opacityFactor, 1.5);
            
            item.style.opacity = opacity.toFixed(2);
            item.style.zIndex = isActive ? itemCount + 1 : Math.round(1 + cosAngle * itemCount);
            item.classList.toggle('active', isActive);
        }

        function updateItemsState(currentPlateYRotation) {
            let closestIndex = 0;
            let minDiff = 360;
            const normalizedRotation = (currentPlateYRotation % 360 + 360) % 360;

            items.forEach((item, index) => {
                const itemTargetAngle = (anglePerItem * index + 360) % 360;
                let diff = Math.abs(itemTargetAngle - (-normalizedRotation % 360 + 360) % 360);
                diff = Math.min(diff, 360 - diff);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = index;
                }
            });
            currentIndex = closestIndex;

            items.forEach((item, index) => {
                positionItem(item, index, radius, currentPlateYRotation, index === currentIndex);
            });
        }

        function applyPlateRotation(yRotation, useTransition = false) {
            plate.style.transition = useTransition ? `transform ${snapTransitionDuration} cubic-bezier(0.68, -0.55, 0.27, 1.55)` : 'none';
            plate.style.transform = `rotateY(${yRotation}deg)`;

            updateItemsState(yRotation);
        }

        function onPointerDown(event) {
            if (event.button !== 0 && event.pointerType === 'mouse') return;
            isDragging = true;
            startX = event.pageX || event.touches[0].pageX;
            startRotationY = currentRotationY;
            plate.style.transition = 'none';
            items.forEach(item => item.style.transition = 'none');
            carouselContainer.classList.add('is-dragging');
            event.preventDefault();
            document.addEventListener('pointermove', onPointerMove, { passive: false });
            document.addEventListener('pointerup', onPointerUp);
            document.addEventListener('pointerleave', onPointerUp);
        }

        function onPointerMove(event) {
            if (!isDragging) return;
            event.preventDefault();
            currentX = event.pageX || event.touches[0].pageX;
            const deltaX = currentX - startX;
            const rotationChange = deltaX * dragSensitivity;
            currentRotationY = startRotationY + rotationChange;
            applyPlateRotation(currentRotationY, false);
        }

        function onPointerUp(event) {
            if (!isDragging) return;
            isDragging = false;
            carouselContainer.classList.remove('is-dragging');
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointerleave', onPointerUp);

            const closestIndexRaw = Math.round(-currentRotationY / anglePerItem);
            currentIndex = (closestIndexRaw % itemCount + itemCount) % itemCount;
            const targetRotationY = -currentIndex * anglePerItem;
            currentRotationY = targetRotationY;
            applyPlateRotation(targetRotationY, true);

            // Reactivar transición items
            setTimeout(() => {
                items.forEach(item => {
                    item.style.transition = `transform ${snapTransitionDuration} ease, opacity ${snapTransitionDuration} ease`;
                });
            }, parseFloat(snapTransitionDuration) * 1000 + 50);
        }

        carouselContainer.addEventListener('pointerdown', onPointerDown, { passive: true });
        setupCarousel();
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(setupCarousel, 250);
        });

    } else {
        console.error("Error al inicializar el carrusel: Elementos no encontrados.");
    }
    /*-------------------------------------------------------------------------------------
    * FIN: Lógica del Carrusel Giratorio
    *------------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------
    * logica del cuadro de busqueda y animación splash
    *------------------------------------------------------------------------------------*/

    // Selecciona los elementos necesarios UNA VEZ al cargar el DOM
    const goButton = document.getElementById('goButton');       // <<< AÑADIDO
    const searchInput = document.getElementById('searchInput');
    const splashElement = document.getElementById('splash');    // <<< AÑADIDO (o mantenlo dentro de splash si prefieres)

    // Función para la animación
    function splash() {
        // Asegúrate de que el elemento splash existe antes de intentar usarlo
        if (!splashElement) {
            console.error("Elemento con id 'splash' no encontrado.");
            return;
        }
        console.log("Ejecutando splash()"); // Para depuración
        // Reiniciar animación si ya está en curso
        splashElement.classList.remove('splash-activo');
        // Truco para forzar reinicio de la animación (reflow/repaint)
        void splashElement.offsetWidth;
        splashElement.classList.add('splash-activo');
        console.log("Clase splash-activo añadida."); // Para depuración
    }

    // --- Event Listener para el botón GO ---
    // Verifica que el botón existe antes de añadir el listener
    if (goButton) {
        goButton.addEventListener('click', splash); // <<< AÑADIDO: Llama a splash() al hacer clic
    } else {
        console.error("Botón con id 'goButton' no encontrado.");
    }

    // --- Event Listener para la tecla Enter en el input ---
    // Verifica que el input existe antes de añadir el listener
    if (searchInput) {
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.keyCode === 13) {
                event.preventDefault();
                splash(); // Llama a la misma función del splash
                // console.log("Buscando:", searchInput.value); // Lógica de búsqueda si la necesitas
            }
        });
    } else {
        console.error("Input con id 'searchInput' no encontrado.");
    }

    /*-------------------------------------------------------------------------------------
    * FIN DE logica del cuadro de busqueda y animación splash
    *------------------------------------------------------------------------------------*/

     /*-------------------------------------------------------------------------------------
    * ININCIO Lógica del Contador de 7 Segmentos
    *------------------------------------------------------------------------------------*/

     const digits = document.querySelectorAll('.digit');

     const segmentMap = {
         0: ['a', 'b', 'c', 'd', 'e', 'f'],
         1: ['b', 'c'],
         2: ['a', 'b', 'g', 'e', 'd'],
         3: ['a', 'b', 'g', 'c', 'd'],
         4: ['f', 'g', 'b', 'c'],
         5: ['a', 'f', 'g', 'c', 'd'],
         6: ['a', 'f', 'e', 'd', 'c', 'g'],
         7: ['a', 'b', 'c'],
         8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
         9: ['a', 'b', 'c', 'd', 'f', 'g'],
         ' ': []
     };

     function displayDigit(digitElement, numberChar) {
         const segmentsToLight = segmentMap[numberChar] || segmentMap[' '];

         ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach(segmentClassSuffix => {
             const segmentElement = digitElement.querySelector(`.segment-${segmentClassSuffix}`);
             if (segmentElement) {
                 // Si el segmento actual debe encenderse, añade la clase 'on'
                 if (segmentsToLight.includes(segmentClassSuffix)) {
                     segmentElement.classList.add('on');
                 } else {
                     // Si no, quita la clase 'on' (asegura que esté apagado)
                     segmentElement.classList.remove('on');
                 }
             }
         });
         // Opcional: actualizar el data attribute para debugging o referencia
         digitElement.dataset.digitValue = numberChar;
     }

     // Función para mostrar un número completo (con varios dígitos) en el contador
     function displayNumber(number) {
         const numberString = String(number).padStart(digits.length, '0'); 
         [...numberString].forEach((char, index) => {
             displayDigit(digits[index], char);
         });
     }

     displayNumber("0000001"); // numero del contador podria ser una variable

    /*-------------------------------------------------------------------------------------
    * FIN Lógica del Contador
    *------------------------------------------------------------------------------------*/



        // --- Scroll-Triggered Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: Unobserve after animation to save resources
                    // observerInstance.unobserve(entry.target);
                }
                // Optional: To re-animate if it scrolls out and back in (remove unobserve)
                // else {
                //     entry.target.classList.remove('is-visible');
                // }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
            // rootMargin: "0px 0px -50px 0px" // Example: trigger 50px before it's fully in view
        });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }


    // --- Dynamic Counter (Example for KEVIN BACON VENDIDAS) ---
    const counterElement = document.querySelector('.seven-segment-counter');
    if (counterElement) {
        const targetNumberString = "0829588"; // The number to display
        const digits = counterElement.querySelectorAll('.digit');
        let flatDigits = [];
        digits.forEach(d => {
            if (d.textContent.length > 1) { // For digit groups like "829"
                [...d.textContent].forEach(char => flatDigits.push(char));
            } else {
                flatDigits.push(d.textContent);
            }
        });
        
        // This is a simplified representation. A real 7-segment dynamic update
        // would involve changing each actual .digit span's content.
        // For now, we'll simulate an update to the original static HTML structure.
        // To make it truly dynamic, you'd create/update spans per digit of targetNumberString.

        // Example: Simulate updating a specific digit if needed for a visual cue.
        // This part is complex for true 7-segment visual counting up without individual segment control.
        // For simplicity, the current visual is static but can be made dynamic if you
        // structure the HTML with individual spans for each digit character.
        // The current HTML groups them "0", "829", "588".

        // Let's refine the HTML for the counter to make JS targeting easier for a dynamic display.
        // (See HTML update below)
        const dynamicCounterDigits = document.querySelectorAll('.dynamic-digit');
        if (dynamicCounterDigits.length > 0) {
            const finalNumber = 829588; // Example final number
            let currentNumber = 0;

            // Observer for the counter itself to start when visible
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(finalNumber, dynamicCounterDigits);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            counterObserver.observe(counterElement);
        }
    }

    function animateCounter(target, digitElements) {
        let numStr = String(target).padStart(digitElements.length, '0');
        digitElements.forEach((digitSpan, index) => {
            const finalDigit = numStr[index];
            let currentDigit = 0;
            const interval = setInterval(() => {
                digitSpan.textContent = currentDigit;
                if (currentDigit == finalDigit) {
                    clearInterval(interval);
                    digitSpan.classList.add('landed'); // Add class for subtle land effect
                }
                currentDigit = (currentDigit + 1) % 10;
            }, 80 + (index * 20)); // Stagger and speed up
        });
    }


    // --- Coupon Carousel (Placeholder Logic) ---
    const couponSection = document.querySelector('.coupon-section');
    if (couponSection) {
        const prevArrow = couponSection.querySelector('.prev-arrow');
        const nextArrow = couponSection.querySelector('.next-arrow');
        // Add event listeners and logic for carousel functionality here
        // This would involve changing the background image or content of .coupon-section
        if(prevArrow) prevArrow.addEventListener('click', () => console.log('Prev coupon'));
        if(nextArrow) nextArrow.addEventListener('click', () => console.log('Next coupon'));
    }

    // --- Carta Items Horizontal Scroll with Mouse Wheel (Optional Enhancement) ---
    const cartaWrapper = document.querySelector('.carta-items-wrapper');
    if (cartaWrapper) {
        cartaWrapper.addEventListener('wheel', (event) => {
            if (event.deltaY !== 0) { // Check if vertical scroll, then apply to horizontal
                // event.preventDefault(); // Uncomment if you want to prevent page scroll while scrolling carta
                cartaWrapper.scrollLeft += event.deltaY * 1.5; // Adjust multiplier for speed
            }
        });
    }

        // --- Full Width Carousel ---
    const carouselSection = document.querySelector('.full-width-carousel-section');
    if (carouselSection) { // Only run if carousel section exists

        const slidesContainer = carouselSection.querySelector('.carousel-slides');
        const slides = Array.from(carouselSection.querySelectorAll('.carousel-slide'));
        const prevButton = carouselSection.querySelector('.carousel-button.prev');
        const nextButton = carouselSection.querySelector('.carousel-button.next');
        const dotsContainer = carouselSection.querySelector('.carousel-dots');

        if (!slidesContainer || slides.length === 0 || !prevButton || !nextButton || !dotsContainer) {
            console.warn('Full width carousel elements not found or incomplete.');
        } else {
            let currentIndex = 0;
            const totalSlides = slides.length;
            let autoPlayInterval;
            const autoPlayDelay = 5000; // 5 seconds

            // Create dots
            slides.forEach((_, index) => {
                const dot = document.createElement('button'); // Use button for accessibility
                dot.classList.add('carousel-dot');
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    goToSlide(index);
                    // if (autoPlayInterval) stopAutoPlay(); // Optional: stop autoplay on manual dot click
                });
                dotsContainer.appendChild(dot);
            });
            const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));

            function updateCarousel() {
                slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });

                // Disable/Enable buttons at ends (non-looping for manual nav)
                prevButton.disabled = currentIndex === 0;
                nextButton.disabled = currentIndex === totalSlides - 1;
            }

            function goToSlide(index) {
                if (index < 0 || index >= totalSlides) return;
                currentIndex = index;
                updateCarousel();
            }

            prevButton.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                    // if (autoPlayInterval) stopAutoPlay(); // Optional: stop autoplay on manual nav
                }
            });

            nextButton.addEventListener('click', () => {
                if (currentIndex < totalSlides - 1) {
                    currentIndex++;
                    updateCarousel();
                    // if (autoPlayInterval) stopAutoPlay(); // Optional: stop autoplay on manual nav
                }
            });
            
            function startAutoPlay() {
                if (autoPlayInterval) clearInterval(autoPlayInterval); // Clear existing interval
                autoPlayInterval = setInterval(() => {
                    currentIndex++;
                    if (currentIndex >= totalSlides) {
                        currentIndex = 0; // Loop back to the first slide for autoplay
                    }
                    updateCarousel();
                }, autoPlayDelay);
            }

            function stopAutoPlay() {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null; // Clear the interval ID
            }

            // Uncomment to start autoplay by default
            // startAutoPlay();

            // Pause autoplay on hover (optional)
            // carouselSection.addEventListener('mouseenter', stopAutoPlay);
            // carouselSection.addEventListener('mouseleave', () => { if (!autoPlayInterval) startAutoPlay(); });


            // Basic Touch/Swipe support
            let touchStartX = 0;
            let touchEndX = 0;

            slidesContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                // if (autoPlayInterval) stopAutoPlay(); // Optional: Stop autoplay on touch
            }, { passive: true });

            slidesContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
                // if (!autoPlayInterval) startAutoPlay(); // Optional: Restart autoplay after touch
            }, { passive: true });

            function handleSwipe() {
                const threshold = 50; // Minimum swipe distance
                if (touchEndX < touchStartX - threshold) { // Swiped left
                    if (currentIndex < totalSlides - 1) {
                        currentIndex++;
                    } 
                    // else { currentIndex = 0; } // Optional: loop to first slide on swipe
                } else if (touchEndX > touchStartX + threshold) { // Swiped right
                    if (currentIndex > 0) {
                        currentIndex--;
                    }
                    // else { currentIndex = totalSlides - 1; } // Optional: loop to last slide on swipe
                }
                updateCarousel();
            }
             // Initialize carousel
            updateCarousel();
        }
    }

});