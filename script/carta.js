// --- START OF FILE carta.js ---
document.addEventListener('DOMContentLoaded', () => {
    const SERVLET_URL = 'http://localhost:8080/BitBurger/Controller'; // Asegúrate que esta URL es correcta

    const categoryIdMap = {
        1: 'hamburguesas',
        2: 'bebidas',
        3: 'entrantes',
        4: 'otros-platos',
        // ... (otros mapeos si los tienes)
    };

    const itemDetailModal = document.getElementById('item-detail-modal');
    let currentModalItemData = {};

    // ----- MODAL LOGIC -----
    function setupModalEventListeners() {
        if (!itemDetailModal) {
            console.error("[CARTA.JS] Modal 'item-detail-modal' not found.");
            return;
        }

        const closeModalBtn = itemDetailModal.querySelector('.close-modal-btn');
        const quantityInput = document.getElementById('item-quantity');
        const quantityButtons = itemDetailModal.querySelectorAll('.quantity-btn');
        const addToOrderBtn = document.getElementById('add-to-order-btn');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => itemDetailModal.classList.add('hidden'));
        }
        itemDetailModal.addEventListener('click', (event) => {
            if (event.target === itemDetailModal) {
                itemDetailModal.classList.add('hidden');
            }
        });

        if (quantityButtons.length > 0 && quantityInput) {
            quantityButtons.forEach(button => {
                button.addEventListener('click', () => {
                    let currentValue = parseInt(quantityInput.value, 10);
                    if (isNaN(currentValue) || currentValue < 1) currentValue = 1;
                    
                    if (button.dataset.action === 'increase') {
                        currentValue++;
                    } else if (button.dataset.action === 'decrease' && currentValue > 1) {
                        currentValue--;
                    }
                    quantityInput.value = currentValue.toString();
                });
            });
        }

        if (addToOrderBtn && quantityInput) {
            addToOrderBtn.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value, 10);
                // Simplificando validación para el ejemplo, asegúrate de tenerlas completas
                if (!currentModalItemData || !currentModalItemData.id || isNaN(quantity) || quantity <= 0) {
                    console.error("[CARTA.JS] Error adding product due to invalid data or quantity.");
                    alert("Error adding product. Please check details and quantity.");
                    return;
                }
                const itemToAdd = { ...currentModalItemData, quantity: quantity };
                addItemToCart(itemToAdd);
                alert(`${itemToAdd.quantity} x ${itemToAdd.name} added to cart.`);
                itemDetailModal.classList.add('hidden');
            });
        } else { 
            if (!addToOrderBtn) console.error("[CARTA.JS] Button 'add-to-order-btn' not found.");
            if (!quantityInput) console.error("[CARTA.JS] Input 'item-quantity' not found.");
        }
    }

    function openProductModal(productData) {
        if (!itemDetailModal) return;
        const modalItemImage = document.getElementById('modal-item-image');
        const modalItemName = document.getElementById('modal-item-name');
        const modalItemDescription = document.getElementById('modal-item-description');
        const quantityInput = document.getElementById('item-quantity');

        // Simplificando validación para el ejemplo
        if (!productData || !productData.id) {
            console.error("[CARTA.JS] Invalid product data for modal.");
            alert("Error: Cannot display product details.");
            return;
        }

        currentModalItemData = { ...productData };
        if (modalItemName) modalItemName.textContent = productData.name;
        if (modalItemImage) {
            modalItemImage.src = productData.imageSrc; // imageSrc ya fue determinada en renderProducts
            modalItemImage.alt = productData.name;
            modalItemImage.onerror = function() { 
                this.onerror = null;
                this.src = '../img/menu/placeholder.png';
            };
        }
        if (modalItemDescription) modalItemDescription.textContent = productData.description || "No description available.";
        if (quantityInput) quantityInput.value = "1";
        itemDetailModal.classList.remove('hidden');
    }

    // ----- PRODUCT FETCHING AND RENDERING -----
    async function fetchAndRenderProducts() {
        try {
            const response = await fetch(`${SERVLET_URL}?ACTION=PRODUCTO.LIST_ALL`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error ${response.status}: ${errorText}`);
            }
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('[CARTA.JS] Error fetching products:', error);
            const container = document.querySelector('.menu-items-container');
            if (container) {
                container.innerHTML = `<p class="error-message" style="color: var(--accent-red, red); text-align: center; padding: 20px;">Could not load products. Please try again later. (${error.message})</p>`;
            }
        }
    }

    function renderProducts(products) {
        Object.values(categoryIdMap).forEach(categoryIdHtml => {
            const container = document.getElementById(categoryIdHtml);
            if (container) container.innerHTML = '';
        });

        if (!products || products.length === 0) {
            console.warn("[CARTA.JS] No products to render or product list is empty.");
            const activeCategoryContainer = document.querySelector('.menu-items-container .menu-category.active');
            if (activeCategoryContainer) {
                activeCategoryContainer.innerHTML = '<p style="text-align:center; color: #555; padding: 20px;">No products found in this category.</p>';
            }
            return;
        }

        products.forEach(product => {
            if (typeof product.id === 'undefined' || product.id === null) {
                console.error("[CARTA.JS] CRITICAL: Product from backend has invalid ID:", product);
                return;
            }
            const productIdStr = String(product.id);
            const categoryHtmlId = categoryIdMap[product.idCategoria];
            const categoryContainer = document.getElementById(categoryHtmlId);

            if (!categoryContainer) {
                console.warn(`[CARTA.JS] Category container '${categoryHtmlId}' not found for product: ${product.nombre}. Ensure mapping is correct.`);
                return;
            }

            const card = document.createElement('button');
            card.className = 'menu-item-card';

            const productPrice = parseFloat(product.precioBase || 0);
            if (isNaN(productPrice)) {
                console.warn(`[CARTA.JS] Product ${product.nombre} has invalid price: ${product.precioBase}. Defaulting to 0.`);
            }

            // --- LÓGICA DE IMAGEN SIMILAR A old.js ---
            // Asumimos que el backend envía 'imagenNombre' que es el nombre del archivo.
            // Y que las imágenes están en '../img/menu/' relativo a carta.html
            let imageSourceForProduct;
            if (product.imagenNombre && product.imagenNombre.trim() !== '') {
                // Si imagenNombre parece una URL completa (http:// o https://), úsala directamente.
                if (product.imagenNombre.startsWith('http://') || product.imagenNombre.startsWith('https://')) {
                    imageSourceForProduct = product.imagenNombre;
                } else {
                    // Sino, asume que es un nombre de archivo y construye la ruta.
                    imageSourceForProduct = `../img/menu/${product.imagenNombre}`;
                }
            } else {
                imageSourceForProduct = '../img/menu/placeholder.png';
            }
            // console.log(`Product: ${product.nombre}, imagenNombre: ${product.imagenNombre}, Source: ${imageSourceForProduct}`);


            const productDataForModal = {
                id: productIdStr,
                name: product.nombre,
                price: !isNaN(productPrice) ? parseFloat(productPrice.toFixed(2)) : 0.00,
                imageSrc: imageSourceForProduct, // Usar la imagen determinada
                description: product.descripcion || 'No description available.'
            };
            
            const nameOverlay = document.createElement('div');
            nameOverlay.className = 'menu-item-name-overlay';
            nameOverlay.textContent = productDataForModal.name;

            const img = document.createElement('img');
            img.src = productDataForModal.imageSrc; // Usar la imagen determinada
            img.alt = productDataForModal.name;
            img.onerror = function() {
                console.warn(`Error loading image for ${product.nombre} at: ${this.src}. Using placeholder.`);
                this.onerror = null;
                this.src = '../img/menu/placeholder.png';
            };

            card.appendChild(nameOverlay);
            card.appendChild(img);
            card.addEventListener('click', () => openProductModal(productDataForModal));
            categoryContainer.appendChild(card);
        });
        
        // Animación de tarjetas para la pestaña activa
        const activeCategoryContainer = document.querySelector('.menu-items-container .menu-category.active');
        if (activeCategoryContainer) {
            const cards = activeCategoryContainer.querySelectorAll('.menu-item-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px) scale(0.95)';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                }, index * 70); // Animación escalonada
            });
        }
    }

    // ----- CART LOGIC -----
    function addItemToCart(item) { 
        let cart = [];
        try {
            const storedCart = localStorage.getItem('bitBurgerCart');
            if (storedCart) {
                cart = JSON.parse(storedCart);
                cart = cart.map(cartItem => ({ ...cartItem, id: String(cartItem.id || ''), quantity: parseInt(cartItem.quantity, 10) || 1 })).filter(cartItem => cartItem.id && cartItem.quantity > 0);
            }
        } catch (e) {
            console.error("[CARTA.JS] Error parsing cart from localStorage. Resetting cart.", e);
            cart = []; 
        }

        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id); 

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += item.quantity; 
        } else {
            cart.push(item); 
        }

        try {
            localStorage.setItem('bitBurgerCart', JSON.stringify(cart));
        } catch (e) {
            console.error("[CARTA.JS] Error saving cart to localStorage:", e);
            alert("There was a problem saving your cart.");
        }
    }

     // --- NUEVA FUNCIÓN PARA ANIMAR EL TÍTULO HERO ---
    function animateHeroTitle() {
        const heroTitleElement = document.querySelector('.hero-menu-section .hero-menu-title');
        if (!heroTitleElement) {
            console.warn("Elemento .hero-menu-title no encontrado para animación.");
            return;
        }

        const text = heroTitleElement.textContent.trim();
        heroTitleElement.innerHTML = ''; // Limpiar el contenido original

        text.split('').forEach((char, index) => {
            const letterSpan = document.createElement('span');
            letterSpan.classList.add('letter');
            letterSpan.textContent = char;
            
            // Aplicar el delay de animación directamente con JS si se prefiere al CSS :nth-child
            // Esto es más flexible si el texto del título pudiera cambiar dinámicamente.
            // letterSpan.style.animationDelay = `${index * 0.15}s`; // Ajusta el factor de delay (0.15s)

            heroTitleElement.appendChild(letterSpan);
        });
    }
    // --- FIN DE LA NUEVA FUNCIÓN ---


    // ----- INITIALIZATION -----
    fetchAndRenderProducts();
    setupModalEventListeners(); // Configurar listeners del modal una vez al cargar la página
    animateHeroTitle(); // Llamar a la función para animar el título
});