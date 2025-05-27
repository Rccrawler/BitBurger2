// script/carrito.js
document.addEventListener('DOMContentLoaded', () => {
    const currentUserString = localStorage.getItem('currentUser');
    if (!currentUserString) {
        alert('Debes iniciar sesión para acceder al carrito.');
        window.location.href = 'login.html';
        return;
    }
    let currentUser;
    try {
        currentUser = JSON.parse(currentUserString);
        if (!currentUser || !currentUser.idUsuario) throw new Error("Datos de usuario inválidos.");
    } catch (e) {
        console.error("[CARRITO.JS] Error parseando currentUser o datos inválidos:", e);
        localStorage.removeItem('currentUser');
        alert('Hubo un problema con tu sesión. Por favor, inicia sesión de nuevo.');
        window.location.href = 'login.html';
        return;
    }

    const cartItemListContainer = document.getElementById('dynamic-cart-item-list');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const processOrderBtn = document.querySelector('.process-order-btn');
    const closeBtn = document.querySelector('.cart-close-btn');

    const SERVLET_URL = 'http://localhost:8080/BitBurger/Controller';
    const PRODUCT_IMAGE_BASE_URL = '../uploads/product_images/';

    function getCart() {
        let cart = [];
        try {
            const storedCart = localStorage.getItem('bitBurgerCart');
            if (storedCart) {
                cart = JSON.parse(storedCart);
                // Sanear al cargar: asegurar que IDs son strings y cantidades son números
                cart = cart.map(item => ({
                    ...item,
                    id: String(item.id || ''), // ID siempre string
                    name: String(item.name || 'Producto Desconocido'),
                    price: parseFloat(item.price) || 0,
                    imageSrc: String(item.imageSrc || ''),
                    quantity: parseInt(item.quantity, 10) || 1 // quantity siempre número
                }));
            }
        } catch(e) {
            console.error("[CARRITO.JS] Error parsing cart from localStorage. Returning empty cart.", e);
            localStorage.removeItem('bitBurgerCart'); // Limpiar si está corrupto
        }
        // console.log("[CARRITO.JS] getCart() returning:", cart);
        return cart;
    }

    function saveCart(cart) {
        // console.log("[CARRITO.JS] saveCart() called with cart:", cart);
        // Antes de guardar, asegurar la consistencia de tipos
        const sanitizedCart = cart.map(item => ({
            id: String(item.id || ''),
            name: String(item.name || 'Producto Desconocido'),
            price: parseFloat(item.price) || 0,
            imageSrc: String(item.imageSrc || ''),
            quantity: parseInt(item.quantity, 10) || 1
        }));
        localStorage.setItem('bitBurgerCart', JSON.stringify(sanitizedCart));
        renderCartItems(); // Re-renderizar la vista del carrito
    }

    function renderCartItems() {
        // console.log("[CARRITO.JS] renderCartItems() called");
        const cart = getCart(); // Obtiene carrito saneado
        if (!cartItemListContainer) {
            console.error("[CARRITO.JS] Element 'dynamic-cart-item-list' not found.");
            return;
        }
        cartItemListContainer.innerHTML = ''; // Limpiar vista anterior

        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
            cartItemListContainer.classList.add('hidden');
        } else {
            if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
            cartItemListContainer.classList.remove('hidden');

            cart.forEach(item => { // item.id es string, item.quantity es number
                const listItem = document.createElement('li');
                listItem.classList.add('cart-item');
                listItem.dataset.id = item.id; // Guardar ID (string) en el dataset

                const itemImage = document.createElement('img');
                itemImage.classList.add('item-image');
                itemImage.alt = item.name;
                itemImage.src = (item.imageSrc.startsWith('http') || item.imageSrc.startsWith('/')) ? item.imageSrc : PRODUCT_IMAGE_BASE_URL + item.imageSrc;
                itemImage.onerror = function() { this.onerror = null; this.src = '../img/menu/burger-clasica.png'; };

                const itemName = document.createElement('span');
                itemName.classList.add('item-name');
                itemName.textContent = item.name;

                const quantityControls = document.createElement('div');
                quantityControls.classList.add('item-quantity-controls');

                const minusBtn = document.createElement('button');
                minusBtn.classList.add('quantity-btn', 'minus-btn');
                minusBtn.setAttribute('aria-label', 'Disminuir cantidad');
                minusBtn.textContent = '-';

                const quantitySpan = document.createElement('span');
                quantitySpan.classList.add('item-quantity');
                quantitySpan.textContent = item.quantity.toString(); // quantity es number

                const plusBtn = document.createElement('button');
                plusBtn.classList.add('quantity-btn', 'plus-btn');
                plusBtn.setAttribute('aria-label', 'Aumentar cantidad');
                plusBtn.textContent = '+';

                quantityControls.appendChild(minusBtn);
                quantityControls.appendChild(quantitySpan);
                quantityControls.appendChild(plusBtn);

                const removeItemBtn = document.createElement('button');
                removeItemBtn.classList.add('quantity-btn', 'remove-item-btn');
                removeItemBtn.setAttribute('aria-label', 'Eliminar ítem');
                removeItemBtn.innerHTML = '×';

                listItem.appendChild(itemImage);
                listItem.appendChild(itemName);
                listItem.appendChild(quantityControls);
                listItem.appendChild(removeItemBtn);
                cartItemListContainer.appendChild(listItem);
            });
        }
        updateTotalPrice();
    }

    function updateTotalPrice() {
        const cart = getCart(); // Obtiene carrito saneado
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotalPriceElement) cartTotalPriceElement.textContent = `€${total.toFixed(2)}`;
        return total;
    }

    if (cartItemListContainer) {
        cartItemListContainer.addEventListener('click', (event) => {
            const target = event.target;
            const cartItemElement = target.closest('.cart-item');
            if (!cartItemElement) return;

            const itemIdStr = cartItemElement.dataset.id; // ID del dataset es string
            let cart = getCart(); // Obtiene carrito saneado

            // item.id en el carrito también es string debido al saneamiento en getCart()
            const itemIndex = cart.findIndex(item => item.id === itemIdStr);

            if (itemIndex === -1) {
                console.warn(`[CARRITO.JS] Ítem con ID "${itemIdStr}" no encontrado para modificar.`);
                return;
            }

            if (target.classList.contains('minus-btn')) {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity--;
                } else {
                    cart.splice(itemIndex, 1); // Eliminar si cantidad llega a 1 y se presiona menos
                }
                saveCart(cart);
            } else if (target.classList.contains('plus-btn')) {
                cart[itemIndex].quantity++;
                saveCart(cart);
            } else if (target.classList.contains('remove-item-btn')) {
                cart.splice(itemIndex, 1); // Eliminar directamente
                saveCart(cart);
            }
        });
    }

    if (processOrderBtn) {
        processOrderBtn.addEventListener('click', async () => {
            const cart = getCart();
            if (cart.length === 0) {
                alert("Tu carrito está vacío. ¡Añade productos antes de tramitar!");
                return;
            }
            // currentUser ya está validado al inicio.

            const totalPedido = updateTotalPrice();
            const lineasPedido = cart.map(item => ({
                // IMPORTANTE: Si tu backend espera idProducto como número, parseInt es necesario.
                // Si item.id es un string como "BURGER-1", parseInt fallará (dará NaN).
                // En ese caso, tu backend debe esperar un string o debes tener IDs numéricos.
                idProducto: parseInt(item.id, 10), // item.id es string
                cantidad: item.quantity, // item.quantity es number
                precioUnitarioEnPedido: item.price, // item.price es number
                subtotalLinea: parseFloat((item.price * item.quantity).toFixed(2))
            }));

            // Validar que idProducto no sea NaN si se usa parseInt
            const hasInvalidIdProducto = lineasPedido.some(linea => isNaN(linea.idProducto));
            if (hasInvalidIdProducto) {
                console.error("[CARRITO.JS] Error: Al menos un idProducto es NaN después de parseInt. Revisa los IDs de producto.", lineasPedido);
                alert("Error interno al procesar los IDs de producto. Contacta a soporte.");
                return;
            }

            const itemsJsonString = JSON.stringify(lineasPedido);
            // console.log("[CARRITO.JS] Preparando para enviar pedido:", { idUsuario: currentUser.idUsuario, totalPedido, itemsJson: itemsJsonString });

            const formData = new URLSearchParams();
            formData.append('ACTION', 'PEDIDO.CREATE');
            formData.append('idUsuario', currentUser.idUsuario.toString());
            formData.append('totalPedido', totalPedido.toFixed(2));
            formData.append('itemsJson', itemsJsonString);

            try {
                const response = await fetch(SERVLET_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                });
                const responseData = await response.json();
                if (response.ok && responseData.success && responseData.order && responseData.order.id) {
                    alert(`¡Pedido #${responseData.order.id} tramitado con éxito!\nGracias por tu compra.`);
                    localStorage.removeItem('bitBurgerCart'); // Limpiar carrito
                    renderCartItems(); // Actualizar vista (mostrar carrito vacío)
                } else {
                    alert(`Error al tramitar el pedido: ${responseData.error || 'Error desconocido.'}`);
                }
            } catch (error) {
                console.error('[CARRITO.JS] Error al procesar el pedido:', error);
                alert('Hubo un error de conexión al procesar tu pedido.');
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.location.href = 'carta.html';
        });
    }

    // Renderizar el carrito al cargar la página
    renderCartItems();
});