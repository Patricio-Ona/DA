let platoActual = '';
let descripcionActual = '';
let imagenesActuales = [];
let precioActual = 0;
const cart = [];
const IVA_RATE = 0.15;

function abrirModal(nombrePlato, descripcion, imagenes, precio, mostrarSabor = false) {
    // Asegúrate de que el modal existe
    const modal = document.getElementById("modal");
    if (!modal) {
        console.error("Modal no encontrado.");
        return;
    }

    platoActual = nombrePlato;
    descripcionActual = descripcion;
    imagenesActuales = imagenes;
    precioActual = precio;

    // Mostrar el modal
    modal.style.display = "flex"; // Esta línea genera el error si el modal no existe

    // Establecer el título, descripción y precio
    document.getElementById("modal-title").textContent = platoActual;
    document.getElementById("modal-desc").textContent = descripcionActual;
    document.getElementById("modal-price").textContent = `Precio: $${precioActual.toFixed(2)}`;

    // Establecer la primera imagen como principal
    document.getElementById("main-img").src = imagenes[0];

    // Mostrar u ocultar la selección de sabor según el plato
    document.getElementById("batido-sabor").style.display = mostrarSabor ? "block" : "none";

    // Reiniciar la cantidad a 1 al abrir el modal
    document.getElementById("cantidad").value = 1;

    // Generar las imágenes en miniatura
    const contenedorMiniaturas = document.getElementById("modal-img-container");
    contenedorMiniaturas.innerHTML = '';
    imagenes.forEach((imgSrc, index) => {
        const img = document.createElement("img");
        img.src = imgSrc;
        img.className = "modal-img" + (index === 0 ? " active" : "");
        img.onclick = function () {
            seleccionarImagenPrincipal(imgSrc);
        };
        contenedorMiniaturas.appendChild(img);
    });
}
    

function seleccionarImagenPrincipal(src) {
    document.getElementById("main-img").src = src;
    const miniaturas = document.querySelectorAll(".modal-img");
    miniaturas.forEach((img) => img.classList.remove("active"));
    document.querySelector(`.modal-img[src="${src}"]`).classList.add("active");
}

function cerrarModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
}

function comprarProducto() {
    const cantidad = parseInt(document.getElementById("cantidad").value, 10);
    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Por favor, selecciona una cantidad válida.");
        return;
    }

    addToCart(platoActual, precioActual, cantidad);
    alert(`Has añadido ${cantidad} unidad(es) de ${platoActual} al carrito.`);
    cerrarModal();
}

function addToCart(itemName, itemPrice, quantity) {
    const existingItem = cart.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ name: itemName, price: itemPrice, quantity: quantity });
    }

    updateCart();
}

function abrirCarrito() {
    updateCart();
    document.getElementById("cart-modal").style.display = "flex";
}

function cerrarCarrito() {
    document.getElementById("cart-modal").style.display = "none";
}

function updateCart() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";

    let subtotal = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            ${item.name} (x${item.quantity})
            <span>$${itemTotal.toFixed(2)}</span>
            <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${index})">Eliminar</button>
        `;
        cartItems.appendChild(li);
    });

    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;

    document.getElementById("subtotal").innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById("iva").innerText = `$${iva.toFixed(2)}`;
    document.getElementById("total").innerText = `$${total.toFixed(2)}`;
}

function eliminarDelCarrito(index) {
    cart.splice(index, 1);
    updateCart();
}

function checkout() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    alert("¡Compra realizada con éxito!");
    cart.length = 0;
    cerrarCarrito();
    updateCart();
}
