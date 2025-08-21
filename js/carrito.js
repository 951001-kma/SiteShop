// ====== Configuración de WhatsApp ======
const STORE_NAME     = "HvitserkShop";
const WHATSAPP_PHONE = "51971124768"; // <-- TU NÚMERO con código de país, sin + ni espacios
const CURRENCY       = "$";

// ====== Estado & elementos ======
let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];

const contenedorVacio     = document.querySelector("#carrito-vacio");
const contenedorProductos = document.querySelector("#carrito-productos");
const contenedorAcciones  = document.querySelector("#carrito-acciones");
const contenedorComprado  = document.querySelector("#carrito-comprado");
const numerito            = document.querySelector("#numerito");

const btnVaciar   = document.querySelector("#carrito-acciones-vaciar");
const totalSpan   = document.querySelector("#total");
const btnComprar  = document.querySelector("#carrito-acciones-comprar");

// ====== Utilidades ======
function persistir() {
  localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function actualizarNumerito() {
  const n = productosEnCarrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  numerito && (numerito.innerText = n);
}

function totalCarrito() {
  return productosEnCarrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
}

// Arma el mensaje para WhatsApp
function buildWhatsAppMessage() {
  const encabezado = `*Pedido - ${STORE_NAME}*`;
  const items = productosEnCarrito.map((p, i) =>
    `${i + 1}. *${p.titulo}*` +
    `${p.talla ? `  |  Talla: ${p.talla}` : ""}` +
    `  |  Cant: ${p.cantidad}  |  ${CURRENCY}${p.precio} c/u  =  ${CURRENCY}${p.precio * p.cantidad}`
  ).join("\n");

  const tot = `${CURRENCY}${totalCarrito()}`;

  const facturacion = [
    "",
    "*Datos de facturación/envío:*",
    "Nombre:",
    "Documento (DNI/RUC):",
    "Teléfono:",
    "Dirección:",
    "Referencia:",
    "Método de pago: Efectivo/Transferencia/Yape/Plin",
  ].join("\n");

  const gracias = "\nGracias por su compra 🙌";

  return [encabezado, "", items, "", `*Total:* ${tot}`, "", facturacion, gracias].join("\n");
}

// ====== Render ======
function cargarProductosCarrito() {
  if (!productosEnCarrito.length) {
    contenedorVacio?.classList.remove("disabled");
    contenedorProductos?.classList.add("disabled");
    contenedorAcciones?.classList.add("disabled");
    contenedorComprado?.classList.add("disabled");
    actualizarNumerito();
    return;
  }

  contenedorVacio?.classList.add("disabled");
  contenedorProductos?.classList.remove("disabled");
  contenedorAcciones?.classList.remove("disabled");
  contenedorComprado?.classList.add("disabled");

  contenedorProductos.innerHTML = "";

  productosEnCarrito.forEach(p => {
    const div = document.createElement("div");
    div.className = "carrito-producto";
    div.innerHTML = `
      <img class="carrito-producto-imagen" src="${p.imagen || ""}" alt="${p.titulo}">
      <div class="carrito-producto-titulo">
        <small>Título</small>
        <h3>${p.titulo}</h3>
      </div>
      <div class="carrito-producto-talla">
        <small>Talla</small>
        <p>${p.talla || "-"}</p>
      </div>
      <div class="carrito-producto-cantidad">
        <small>Cantidad</small>
        <p>${p.cantidad}</p>
      </div>
      <div class="carrito-producto-precio">
        <small>Precio</small>
        <p>${CURRENCY}${p.precio}</p>
      </div>
      <div class="carrito-producto-subtotal">
        <small>Subtotal</small>
        <p>${CURRENCY}${p.precio * p.cantidad}</p>
      </div>
      <button class="carrito-producto-eliminar" title="Eliminar" data-id="${p.id}" data-talla="${p.talla || ''}">
        <i class="bi bi-trash"></i>
      </button>
    `;
    contenedorProductos.appendChild(div);
  });

  // Eliminar (id + talla)
  contenedorProductos.querySelectorAll(".carrito-producto-eliminar").forEach(b => {
    b.addEventListener("click", () => {
      const id = b.dataset.id;
      const talla = b.dataset.talla || "";
      productosEnCarrito = productosEnCarrito.filter(p => !(p.id === id && (p.talla || "") === talla));
      persistir();
      cargarProductosCarrito();
    });
  });

  // Total
  if (totalSpan) totalSpan.innerText = `${CURRENCY}${totalCarrito()}`;
  actualizarNumerito();
}

// ====== Acciones ======
// Vaciar
btnVaciar?.addEventListener("click", () => {
  productosEnCarrito = [];
  persistir();
  cargarProductosCarrito();
});

// Comprar → WhatsApp
btnComprar?.addEventListener("click", () => {
  if (!productosEnCarrito.length) {
    alert("Tu carrito está vacío.");
    return;
  }

  const message = buildWhatsAppMessage();
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");

  // Si quieres vaciar el carrito automáticamente después de abrir WhatsApp,
  // descomenta estas 4 líneas:
  // productosEnCarrito = [];
  // persistir();
  // cargarProductosCarrito();
  // (así evitas duplicados si el cliente vuelve atrás)
});

// Init
cargarProductosCarrito();
