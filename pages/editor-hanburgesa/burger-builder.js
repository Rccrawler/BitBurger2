document.addEventListener('DOMContentLoaded', () => {
    const ingredientesDisponibles = document.querySelectorAll('.ingrediente');
    const listaOrden = document.getElementById('lista');
    const vistaHamburguesa = document.getElementById('vista');
    const displayTotal = document.getElementById('total-precio');
    const sendCartButton = document.querySelector('#encargar-btn .button'); // For disabling

    function anadirIngrediente(nombre, imgData, heightData, limite, precio) {
        const limiteNumerico = parseInt(limite, 10);
        if (!isNaN(limiteNumerico) && limiteNumerico > 0) {
            const itemsActuales = listaOrden.querySelectorAll('li');
            let contadorActual = 0;
            itemsActuales.forEach(item => { if (item.textContent === nombre) { contadorActual++; } });
            if (contadorActual >= limiteNumerico) {
                alert(`¡Limit reached! You can only add ${limiteNumerico} of '${nombre}'.`);
                return;
            }
        }

        const li = document.createElement('li');
        li.textContent = nombre;
        li.dataset.img = imgData;
        li.dataset.height = heightData; // This might not be used anymore if CSS handles layers
        li.dataset.price = precio || "0";
        li.draggable = true;
        li.title = 'Double click to remove';

        agregarListenersDragDrop(li);
        agregarListenerEliminar(li);

        listaOrden.appendChild(li);
        renderHamburguesa();
        actualizarPrecioTotal();
    }

    function actualizarPrecioTotal() {
        let total = 0;
        const itemsActuales = listaOrden.querySelectorAll('li');

        itemsActuales.forEach(item => {
            const precioItem = parseFloat(item.dataset.price);
            if (!isNaN(precioItem)) {
                total += precioItem;
            }
        });
        
        const tieneIngredientes = itemsActuales.length > 0;

        if (tieneIngredientes) { // Only add base price if there are ingredients
            total += 2; // Base price for the burger "assembly" or bun base not listed as ingredient
        }
        
        displayTotal.textContent = `Total: $${total.toFixed(2)}`;

        // Enable/disable cart button
        if (sendCartButton) {
            if (tieneIngredientes) {
                sendCartButton.disabled = false;
                sendCartButton.classList.remove('disabled-button-style'); // Add a class for styling disabled state if needed
            } else {
                sendCartButton.disabled = true;
                sendCartButton.classList.add('disabled-button-style');
            }
        }
    }

    function agregarListenersDragDrop(item) {
        item.addEventListener('dragstart', (e) => { 
            item.classList.add('dragging'); 
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            // The renderHamburguesa call was originally in a setTimeout(0)
            // This is usually to ensure the DOM updates (drag operation finishes) before re-rendering.
            // It might still be beneficial.
            setTimeout(() => {
                 renderHamburguesa();
                 actualizarPrecioTotal(); // Also update price after reorder
            }, 0);
        });
    }

    function agregarListenerEliminar(item) {
        item.addEventListener('dblclick', () => {
            item.remove();
            renderHamburguesa();
            actualizarPrecioTotal();
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect(); 
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) { 
                return { offset: offset, element: child }; 
            } else { 
                return closest; 
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function renderHamburguesa() {
        vistaHamburguesa.innerHTML = ''; 
        const capas = listaOrden.querySelectorAll('li');
        capas.forEach((li) => {
            const img = document.createElement('img'); 
            // IMPORTANT: Path to ingredients
            img.src = 'ingredientes/' + li.dataset.img; 
            img.alt = li.textContent; 
            img.classList.add('capa');
            img.onerror = () => { 
                console.error(`Error loading image: ${img.src}`); 
                img.alt = `Error loading ${li.textContent}`; 
            }
            vistaHamburguesa.appendChild(img);
        });
    }

    ingredientesDisponibles.forEach(ing => {
      ing.addEventListener('click', () => {
        const limite = ing.dataset.limit;
        const precio = ing.dataset.price;
        anadirIngrediente(ing.textContent, ing.dataset.img, ing.dataset.height, limite, precio);
      });
    });

    listaOrden.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        const itemArrastrado = document.querySelector('#lista li.dragging'); 
        if (!itemArrastrado) return;
        
        const afterElement = getDragAfterElement(listaOrden, e.clientY);
        
        if (afterElement === undefined) { // Changed from null, as reduce might return undefined if array empty or all offsets are positive
            listaOrden.appendChild(itemArrastrado);
        } else { 
            listaOrden.insertBefore(itemArrastrado, afterElement); 
        }
    });
    
    if (sendCartButton) {
        sendCartButton.addEventListener('click', function() {
            if (this.disabled) return;

            // Logic for "sending to cart"
            // For now, just a console log and visual feedback
            console.log("Order submitted!");
            const items = [];
            listaOrden.querySelectorAll('li').forEach(li => items.push(li.textContent));
            console.log("Items:", items);
            console.log("Total:", displayTotal.textContent);

            // You might want to clear the order or navigate away
            // listaOrden.innerHTML = '';
            // renderHamburguesa();
            // actualizarPrecioTotal();
            // alert("Burger sent to your virtual cart!");
        });
    }

    renderHamburguesa();
    actualizarPrecioTotal(); // Initial call to set price and button state
});