// script/carrito.js
document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES GLOBALES PARA MODALES ---
    const paymentMethodModal = document.getElementById('payment-method-modal');
    const orderConfirmationModal = document.getElementById('order-confirmation-modal');
    const creditCardDetailsDiv = document.getElementById('credit-card-details');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');

    // --- ESTADO ---
    let selectedPaymentMethod = null; // Para guardar el método de pago seleccionado

    // ... (tu código existente para currentUser, cartItemListContainer, etc.)
    const currentUserString = localStorage.getItem('currentUser');
    if (!currentUserString) { /* ... (redirección si no hay usuario) ... */ return; }
    let currentUser;
    try { currentUser = JSON.parse(currentUserString); if (!currentUser || !currentUser.idUsuario) throw new Error("Invalid user data."); }
    catch (e) { /* ... (manejo de error de parseo) ... */ return; }

    const cartItemListContainer = document.getElementById('dynamic-cart-item-list');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const processOrderBtn = document.querySelector('.process-order-btn');
    const mainCartCloseBtn = document.querySelector('.cart-content-wrapper .cart-close-btn'); // Botón X principal del carrito

    const SERVLET_URL = 'http://localhost:8080/BitBurger/Controller';
    const PRODUCT_IMAGE_BASE_URL = '../uploads/product_images/'; // O la ruta correcta

    // --- FUNCIONES DEL CARRITO (getCart, saveCart, renderCartItems, updateTotalPrice - sin cambios mayores) ---
    function getCart() { /* ... como estaba ... */ 
        let cart = [];
        try {
            const storedCart = localStorage.getItem('bitBurgerCart');
            if (storedCart) cart = JSON.parse(storedCart).map(item => ({...item, id: String(item.id || ''), name: String(item.name || 'Unknown'), price: parseFloat(item.price) || 0, imageSrc: String(item.imageSrc || ''), quantity: parseInt(item.quantity, 10) || 1}));
        } catch(e) { console.error("[CARRITO.JS] Error parsing cart. Returning empty.", e); localStorage.removeItem('bitBurgerCart');}
        return cart;
    }
    function saveCart(cart) { /* ... como estaba ... */ 
        const sanitizedCart = cart.map(item => ({id: String(item.id || ''), name: String(item.name || 'Unknown'), price: parseFloat(item.price) || 0, imageSrc: String(item.imageSrc || ''), quantity: parseInt(item.quantity, 10) || 1}));
        localStorage.setItem('bitBurgerCart', JSON.stringify(sanitizedCart));
        renderCartItems();
    }
    function renderCartItems() { /* ... como estaba, asegúrate que los botones +/- y X de los ítems funcionen ... */
        const cart = getCart();
        if (!cartItemListContainer) return;
        cartItemListContainer.innerHTML = ''; 

        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
            cartItemListContainer.classList.add('hidden');
        } else {
            if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
            cartItemListContainer.classList.remove('hidden');
            cart.forEach(item => {
                const listItem = document.createElement('li');
                listItem.classList.add('cart-item');
                listItem.dataset.id = item.id;

                const itemImage = document.createElement('img');
                itemImage.classList.add('item-image');
                itemImage.alt = item.name;
                // Ajusta esta lógica si PRODUCT_IMAGE_BASE_URL no aplica a todas las imageSrc
                itemImage.src = (item.imageSrc.startsWith('http') || item.imageSrc.startsWith('../') || item.imageSrc.startsWith('/')) ? item.imageSrc : PRODUCT_IMAGE_BASE_URL + item.imageSrc;
                itemImage.onerror = function() { this.onerror = null; this.src = '../img/menu/burger-clasica.png'; };

                const itemName = document.createElement('span');
                itemName.classList.add('item-name');
                itemName.textContent = item.name;

                const quantityControls = document.createElement('div');
                quantityControls.classList.add('item-quantity-controls');
                const minusBtn = document.createElement('button'); minusBtn.classList.add('quantity-btn', 'minus-btn'); minusBtn.setAttribute('aria-label', 'Decrease quantity'); minusBtn.textContent = '-';
                const quantitySpan = document.createElement('span'); quantitySpan.classList.add('item-quantity'); quantitySpan.textContent = item.quantity.toString();
                const plusBtn = document.createElement('button'); plusBtn.classList.add('quantity-btn', 'plus-btn'); plusBtn.setAttribute('aria-label', 'Increase quantity'); plusBtn.textContent = '+';
                quantityControls.appendChild(minusBtn); quantityControls.appendChild(quantitySpan); quantityControls.appendChild(plusBtn);

                const removeItemBtn = document.createElement('button'); removeItemBtn.classList.add('quantity-btn', 'remove-item-btn'); removeItemBtn.setAttribute('aria-label', 'Remove item'); removeItemBtn.innerHTML = '×'; // O un icono SVG

                listItem.appendChild(itemImage); listItem.appendChild(itemName); listItem.appendChild(quantityControls); listItem.appendChild(removeItemBtn);
                cartItemListContainer.appendChild(listItem);
            });
        }
        updateTotalPrice();
    }
    function updateTotalPrice() { /* ... como estaba ... */ 
        const cart = getCart();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotalPriceElement) cartTotalPriceElement.textContent = `€${total.toFixed(2)}`;
        return total;
    }


    // --- LÓGICA PARA MODALES ---
    function openModal(modalElement) {
        if (modalElement) modalElement.classList.remove('hidden');
    }
    function closeModal(modalElement) {
        if (modalElement) modalElement.classList.add('hidden');
    }

    // Event listeners para cerrar modales
    if (paymentMethodModal) {
        const paymentCloseBtn = paymentMethodModal.querySelector('.payment-close-btn');
        if (paymentCloseBtn) paymentCloseBtn.addEventListener('click', () => closeModal(paymentMethodModal));
        paymentMethodModal.addEventListener('click', (event) => { // Cerrar al hacer clic en overlay
            if (event.target === paymentMethodModal) closeModal(paymentMethodModal);
        });
    }
    if (orderConfirmationModal) {
        const confirmationCloseBtn = orderConfirmationModal.querySelector('.confirmation-close-btn');
        if (confirmationCloseBtn) confirmationCloseBtn.addEventListener('click', () => {
            closeModal(orderConfirmationModal);
            window.location.href = 'carta.html'; // O a donde quieras redirigir
        });
         orderConfirmationModal.addEventListener('click', (event) => { // Cerrar al hacer clic en overlay
            if (event.target === orderConfirmationModal) {
                 closeModal(orderConfirmationModal);
                 window.location.href = 'carta.html';
            }
        });
        const backToMenuBtn = orderConfirmationModal.querySelector('#back-to-menu-btn');
        if (backToMenuBtn) backToMenuBtn.addEventListener('click', () => {
            closeModal(orderConfirmationModal);
            window.location.href = 'carta.html'; // O a donde quieras redirigir
        });
    }


    // --- LÓGICA DE SELECCIÓN DE MÉTODO DE PAGO ---
    const paymentOptionBtns = document.querySelectorAll('.payment-option-btn');
    paymentOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            paymentOptionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedPaymentMethod = btn.dataset.method;

            if (selectedPaymentMethod === 'credit-card') {
                if (creditCardDetailsDiv) creditCardDetailsDiv.classList.remove('hidden');
            } else {
                if (creditCardDetailsDiv) creditCardDetailsDiv.classList.add('hidden');
            }
            if (confirmPaymentBtn) confirmPaymentBtn.disabled = false; // Habilitar botón de confirmar
        });
    });

    // --- VALIDACIÓN SIMULADA DE TARJETA (MUY BÁSICA) ---
    function validateCardDetails() {
        // Esto es solo una simulación. En un caso real, la validación sería más compleja
        // y NO se debería manejar información sensible de tarjeta en el cliente así.
        // Idealmente, se usaría un proveedor de pagos (Stripe, PayPal SDK) que maneje esto de forma segura.
        if (selectedPaymentMethod === 'credit-card') {
            const cardNumber = document.getElementById('card-number')?.value;
            const cardName = document.getElementById('card-name')?.value;
            const cardExpiry = document.getElementById('card-expiry')?.value;
            const cardCvv = document.getElementById('card-cvv')?.value;
            return cardNumber && cardName && cardExpiry && cardCvv &&
                   cardNumber.length >= 15 && cardName.length > 2 &&
                   cardExpiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/) && cardCvv.length >= 3;
        }
        return true; // Para otros métodos de pago, no se necesita validación de tarjeta
    }


    // --- LÓGICA DE PROCESAR PEDIDO (MODIFICADA) ---
    if (processOrderBtn) {
        processOrderBtn.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                alert("Your cart is empty. Add products before proceeding!");
                return;
            }
            selectedPaymentMethod = null; // Resetear método de pago
            if (confirmPaymentBtn) confirmPaymentBtn.disabled = true; // Deshabilitar hasta que se seleccione método
            if (creditCardDetailsDiv) creditCardDetailsDiv.classList.add('hidden'); // Ocultar detalles de tarjeta
            paymentOptionBtns.forEach(b => b.classList.remove('selected')); // Deseleccionar opciones
            
            openModal(paymentMethodModal); // Mostrar modal de método de pago
        });
    }

    // --- LÓGICA DE CONFIRMAR PAGO Y ENVIAR PEDIDO ---
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', async () => {
            if (!selectedPaymentMethod) {
                alert("Please select a payment method.");
                return;
            }

            if (selectedPaymentMethod === 'credit-card' && !validateCardDetails()) {
                alert("Please fill in all credit card details correctly.");
                return;
            }

            // Simular procesamiento de pago si es necesario aquí
            // Por ahora, asumimos que la validación es suficiente y procedemos a crear el pedido

            const cart = getCart();
            const totalPedido = updateTotalPrice(); // Asegurarse que el total está actualizado
            const lineasPedido = cart.map(item => ({
                idProducto: parseInt(item.id, 10), // Asegurar que es número si el backend lo espera así
                cantidad: item.quantity,
                precioUnitarioEnPedido: item.price,
                subtotalLinea: parseFloat((item.price * item.quantity).toFixed(2))
            }));

            const hasInvalidIdProducto = lineasPedido.some(linea => isNaN(linea.idProducto));
            if (hasInvalidIdProducto) {
                console.error("[CARRITO.JS] Error: At least one idProducto is NaN. Check product IDs.", lineasPedido);
                alert("Internal error processing product IDs. Contact support.");
                return;
            }
            
            const itemsJsonString = JSON.stringify(lineasPedido);

            const formData = new URLSearchParams();
            formData.append('ACTION', 'PEDIDO.CREATE');
            formData.append('idUsuario', currentUser.idUsuario.toString());
            formData.append('totalPedido', totalPedido.toFixed(2));
            formData.append('itemsJson', itemsJsonString);
            formData.append('metodoPago', selectedPaymentMethod); // Enviar método de pago seleccionado

            // console.log("[CARRITO.JS] Sending order:", Object.fromEntries(formData));


            try {
                // Deshabilitar botón para evitar múltiples envíos
                confirmPaymentBtn.disabled = true;
                confirmPaymentBtn.textContent = 'Processing...';

                const response = await fetch(SERVLET_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                });
                const responseData = await response.json();

                if (response.ok && responseData.success && responseData.order && responseData.order.id) {
                    closeModal(paymentMethodModal); // Cerrar modal de pago
                    
                    const confirmedOrderIdElement = document.getElementById('confirmed-order-id');
                    if (confirmedOrderIdElement) confirmedOrderIdElement.textContent = `#${responseData.order.id}`;
                    
                    openModal(orderConfirmationModal); // Mostrar modal de confirmación

                    localStorage.removeItem('bitBurgerCart');
                    renderCartItems(); // Actualizar vista del carrito (vaciarlo)
                } else {
                    alert(`Error processing order: ${responseData.error || 'Unknown error.'}`);
                }
            } catch (error) {
                console.error('[CARRITO.JS] Error during order processing:', error);
                alert('Connection error while processing your order.');
            } finally {
                // Reactivar botón y restaurar texto si el flujo no llevó a la confirmación
                if (paymentMethodModal && !paymentMethodModal.classList.contains('hidden')) {
                    confirmPaymentBtn.disabled = false;
                    confirmPaymentBtn.textContent = 'Confirm and Pay';
                }
            }
        });
    }


    // --- EVENT LISTENERS PARA MODIFICAR ITEMS EN EL CARRITO (como estaba) ---
    if (cartItemListContainer) {
        cartItemListContainer.addEventListener('click', (event) => {
            const target = event.target;
            const cartItemElement = target.closest('.cart-item');
            if (!cartItemElement) return;

            const itemIdStr = cartItemElement.dataset.id;
            let cart = getCart();
            const itemIndex = cart.findIndex(item => item.id === itemIdStr);

            if (itemIndex === -1) return;

            if (target.classList.contains('minus-btn')) {
                if (cart[itemIndex].quantity > 1) cart[itemIndex].quantity--;
                else cart.splice(itemIndex, 1);
                saveCart(cart);
            } else if (target.classList.contains('plus-btn')) {
                cart[itemIndex].quantity++;
                saveCart(cart);
            } else if (target.classList.contains('remove-item-btn')) {
                cart.splice(itemIndex, 1);
                saveCart(cart);
            }
        });
    }

    // --- BOTÓN X PRINCIPAL DEL CARRITO ---
    if (mainCartCloseBtn) {
        mainCartCloseBtn.addEventListener('click', () => {
            window.location.href = 'carta.html'; // O la página anterior
        });
    }

    // Renderizar el carrito al cargar la página
    renderCartItems();
});