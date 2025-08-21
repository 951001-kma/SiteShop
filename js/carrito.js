// ====== Versión (para verificar en consola) ======
console.log("carrito.js v4 cargado en:", location.hostname);

// ====== Config ======
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

// ====== Utils ======
const persistir = () => localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
const actualizarNumerito = () => numerito && (numerito.innerText = productosEnCarrito.reduce((a, p) => a + (p.cantidad || 0), 0));
const totalCarrito = () => productosEnCarrito.reduce((a, p) => a + p.precio * p.cantidad, 0);

function buildWhatsAppMessage() {
  const encabezado = `*Pedido - ${STORE_NAME}*`;
  const items = productosEnCarrito.map((p, i) =>
    `${i + 1}. *${p.titulo}*${p.talla ? ` | Talla: ${p.talla}` : ""} | Cant: ${p.cantidad} | ${CURRENCY}${p.precio} c/u = ${CURRENCY}${p.precio * p.cantidad}`
  ).join("\n");
  const tot = `${CURRENCY}${totalCarrito()}`;
  const fact = [
    "", "*Datos de facturación/envío:*",
    "Nombre:",
    "Documento (DNI/RUC):",
    "Teléfono:",
    "Dirección:",
    "Referencia:",
    "Método de pago: Efectivo/Transferencia/Yape/Plin"
  ].join("\n");
  return [encabezado, "", items, "", `*Total:* ${tot}`, "", fact, "\nGracias por su compra 🙌"].join("\n");
}

// Fallback robusto para WhatsApp (wa.me → api.whatsapp)
function abrirWhatsApp(phone, text) {
  const msg = encodeURIComponent(text);
  const waUrl  = `https://wa.me/${phone}?text=${msg}`;
  const apiUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`;

  // Redirige en la misma pestaña (mejor que window.open en móviles)
  try {
    window.location.assign(waUrl);
    // Si por cualquier motivo no se fue (caché raro, bloqueos), intenta api.whatsapp
    setTimeout(() => {
      if (document.visibilityState === "visible") {
        window.location.assign(apiUrl);
      }
    }, 1000);
  } catch {
    window.location.href = apiUrl;
  }
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
      <div class="carrito-producto-titulo"><small>Título</small><h3>${p.titulo}</h3></div>
      <div class="carrito-producto-talla"><small>Talla</small><p>${p.talla || "-"}</p></div>
      <div class="carrito-producto-cantidad"><small>Cantidad</small><p>${p.cantidad}</p></div>
      <div class="carrito-producto-precio"><small>Precio</small><p>${CURRENCY}${p.precio}</p></div>
      <div class="carrito-producto-subtotal"><small>Subtotal</small><p>${CURRENCY}${p.precio * p.cantidad}</p></div>
      <button class="carrito-producto-eliminar" title="Eliminar" data-id="${p.id}" data-talla="${p.talla || ""}">
        <i class="bi bi-trash"></i>
      </button>
    `;
    contenedorProductos.appendChild(div);
  });

  contenedorProductos.querySelectorAll(".carrito-producto-eliminar").forEach(b => {
    b.addEventListener("click", () => {
      const id = b.dataset.id, talla = b.dataset.talla || "";
      productosEnCarrito = productosEnCarrito.filter(p => !(p.id === id && (p.talla || "") === talla));
      persistir(); cargarProductosCarrito();
    });
  });

  totalSpan && (totalSpan.innerText = `${CURRENCY}${totalCarrito()}`);
  actualizarNumerito();
}

// ====== Acciones ======
btnVaciar?.addEventListener("click", () => {
  productosEnCarrito = [];
  persistir();
  cargarProductosCarrito();
});

btnComprar?.addEventListener("click", () => {
  if (!productosEnCarrito.length) {
    alert("Tu carrito está vacío.");
    return;
  }
  const message = buildWhatsAppMessage();
  abrirWhatsApp(WHATSAPP_PHONE, message);

  // Si quieres vaciar el carrito después de iniciar WhatsApp, descomenta:
  // productosEnCarrito = []; persistir(); cargarProductosCarrito();
});

// Init
cargarProductosCarrito();
