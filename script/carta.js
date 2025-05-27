// script/carta.js
document.addEventListener('DOMContentLoaded', () => {
    const SERVLET_URL = 'http://localhost:8080/BitBurger/Controller';

    const categoryIdMap = {
        1: 'hamburguesas',
        2: 'bebidas',
        3: 'entrantes',
        4: 'otros-platos'
    };

    const tabLinks = document.querySelectorAll('.tab-link');
    const menuCategoriesElements = document.querySelectorAll('.menu-category');

    if (tabLinks.length > 0 && menuCategoriesElements.length > 0) {
        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const targetTab = link.dataset.tab;
                tabLinks.forEach(tl => tl.classList.remove('active'));
                link.classList.add('active');
                menuCategoriesElements.forEach(category => {
                    category.classList.toggle('active', category.id === targetTab);
                });
            });
        });
    }

    const itemDetailModal = document.getElementById('item-detail-modal');
    let currentModalItemData = {}; 

    function setupModalEventListeners() {
        if (!itemDetailModal) {
            console.error("[CARTA.JS] Modal 'item-detail-modal' not found.");
            return;
        }

        const modalItemImage = document.getElementById('modal-item-image');
        const modalItemName = document.getElementById('modal-item-name');
        const modalItemDescription = document.getElementById('modal-item-description');
        const closeModalBtn = itemDetailModal.querySelector('.close-modal-btn');
        const menuItemCards = document.querySelectorAll('.menu-item-card');
        const quantityInput = document.getElementById('item-quantity');
        const quantityButtons = itemDetailModal.querySelectorAll('.quantity-btn');
        const addToOrderBtn = document.getElementById('add-to-order-btn');
        const modalBackgroundTextElement = itemDetailModal.querySelector('.modal-background-text');

        if (menuItemCards.length > 0) {
            menuItemCards.forEach(card => {
                card.addEventListener('click', () => {
                    const id = card.dataset.id; 
                    const name = card.dataset.name;
                    const price = parseFloat(card.dataset.price);
                    const imageSrc = card.dataset.imageSrc;
                    // Changed default description to English
                    const description = card.dataset.description || "Description not available."; 

                    if (typeof id !== 'string' || id.trim() === "" || id === "undefined" || id === "null") {
                        console.error("[CARTA.JS] CRITICAL: Clicked card has invalid ID:", id, "Name:", name);
                        // Changed alert to English
                        alert("Error: This product has an invalid ID and cannot be processed.");
                        return;
                    }
                    if (isNaN(price)) {
                        console.error("[CARTA.JS] CRITICAL: Clicked card has invalid price:", card.dataset.price, "Name:", name);
                        // Changed alert to English
                        alert("Error: This product has an invalid price.");
                        return;
                    }

                    currentModalItemData = { id, name, price, imageSrc }; 

                    if (modalItemName) modalItemName.textContent = name;
                    if (modalItemImage) {
                        modalItemImage.src = imageSrc;
                        modalItemImage.alt = name;
                        modalItemImage.onerror = function() { this.onerror = null; this.src = '../img/menu/placeholder.png'; };
                    }
                    if (modalItemDescription) modalItemDescription.textContent = description;
                    if (quantityInput) quantityInput.value = "1"; 

                    // --- MODIFICATION TO REMOVE BACKGROUND TEXT ---
                    if (modalBackgroundTextElement) {
                        modalBackgroundTextElement.innerText = ''; // Clear the background text
                    }
                    // --- END OF MODIFICATION ---

                    itemDetailModal.classList.remove('hidden');
                });
            });
        }

        if (closeModalBtn) closeModalBtn.addEventListener('click', () => itemDetailModal.classList.add('hidden'));
        if (itemDetailModal) itemDetailModal.addEventListener('click', (event) => {
            if (event.target === itemDetailModal) itemDetailModal.classList.add('hidden');
        });

        if (quantityButtons.length > 0 && quantityInput) {
            quantityButtons.forEach(button => {
                button.addEventListener('click', () => {
                    let currentValue = parseInt(quantityInput.value, 10);
                    if (isNaN(currentValue)) currentValue = 1; 
                    if (button.dataset.action === 'increase') currentValue++;
                    else if (button.dataset.action === 'decrease' && currentValue > 1) currentValue--;
                    quantityInput.value = currentValue.toString();
                });
            });
        }

        if (addToOrderBtn && quantityInput) {
            addToOrderBtn.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value, 10);

                if (typeof currentModalItemData.id !== 'string' || currentModalItemData.id.trim() === "" || currentModalItemData.id === "undefined" || currentModalItemData.id === "null") {
                    console.error("[CARTA.JS] Error: Item ID is missing or invalid in currentModalItemData.", currentModalItemData);
                    // Changed alert to English
                    alert("Error adding product (ID not found in modal data). Please try again.");
                    return;
                }
                if (isNaN(quantity) || quantity <= 0) {
                    console.error("[CARTA.JS] Error: Item quantity is invalid.", quantityInput.value);
                    // Changed alert to English
                    alert("Error adding product (invalid quantity). Please try again.");
                    return;
                }

                const itemToAdd = {
                    id: currentModalItemData.id,
                    name: currentModalItemData.name,
                    price: currentModalItemData.price,
                    imageSrc: currentModalItemData.imageSrc,
                    quantity: quantity
                };
                
                addItemToCart(itemToAdd);
                // Changed alert to English
                alert(`${itemToAdd.quantity} x ${itemToAdd.name} added to cart.`);
                itemDetailModal.classList.add('hidden');
            });
        } else {
            if (!addToOrderBtn) console.error("[CARTA.JS] Button 'add-to-order-btn' not found.");
            if (!quantityInput) console.error("[CARTA.JS] Input 'item-quantity' not found.");
        }
    }

    async function fetchAndRenderProducts() {
        try {
            const response = await fetch(`${SERVLET_URL}?ACTION=PRODUCTO.LIST_ALL`);
            const responseText = await response.text();

            if (!response.ok) throw new Error(`HTTP error ${response.status}: ${responseText}`);
            const products = JSON.parse(responseText);
            renderProducts(products);
        } catch (error) {
            console.error('[CARTA.JS] Error fetching products:', error);
            const container = document.querySelector('.menu-items-container');
            // Changed error message to English
            if (container) container.innerHTML = `<p class="error-message">Could not load products. Please try again later. (${error.message})</p>`;
        }
    }

    function renderProducts(products) {
        Object.values(categoryIdMap).forEach(categoryIdHtml => {
            const container = document.getElementById(categoryIdHtml);
            if (container) container.innerHTML = '';
        });

        if (!products || products.length === 0) {
            console.warn("[CARTA.JS] No products to render or product list is empty.");
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
                return;
            }

            const card = document.createElement('button');
            card.className = 'menu-item-card';
            card.dataset.id = productIdStr; 
            card.dataset.name = product.nombre;
            card.dataset.price = (product.precioBase || 0).toFixed(2);
            card.dataset.imageSrc = product.imagenNombre || '../img/menu/placeholder.png';
            // Changed default description to English
            card.dataset.description = product.descripcion || 'Description not available.';

            const img = document.createElement('img');
            img.src = card.dataset.imageSrc;
            img.alt = product.nombre;
            img.onerror = function() { this.onerror = null; this.src = '../img/menu/placeholder.png'; };

            const span = document.createElement('span');
            span.textContent = product.nombre;

            card.appendChild(img);
            card.appendChild(span);
            categoryContainer.appendChild(card);
        });
        setupModalEventListeners();
    }

    function addItemToCart(item) { 
        let cart = [];
        try {
            const storedCart = localStorage.getItem('bitBurgerCart');
            if (storedCart) {
                cart = JSON.parse(storedCart);
                cart = cart.map(cartItem => ({
                    ...cartItem,
                    id: String(cartItem.id || ''), 
                    quantity: parseInt(cartItem.quantity, 10) || 1 
                }));
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
            // Changed alert to English
            alert("There was a problem saving your cart.");
        }
    }

    fetchAndRenderProducts();

    // Cookies logic
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner && localStorage.getItem('cookiesAceptadas') !== 'true') {
        cookieBanner.classList.remove('hidden');
    }
});