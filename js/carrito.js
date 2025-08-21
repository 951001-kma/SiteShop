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
        <p>$${p.precio}</p>
      </div>
      <div class="carrito-producto-subtotal">
        <small>Subtotal</small>
        <p>$${p.precio * p.cantidad}</p>
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
  const total = productosEnCarrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  if (totalSpan) totalSpan.innerText = `$${total}`;
  actualizarNumerito();
}

function actualizarNumerito() {
  const n = productosEnCarrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  numerito && (numerito.innerText = n);
}

function persistir() {
  localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

// Vaciar
btnVaciar?.addEventListener("click", () => {
  productosEnCarrito = [];
  persistir();
  cargarProductosCarrito();
});

// Comprar (simple)
btnComprar?.addEventListener("click", () => {
  productosEnCarrito = [];
  persistir();

  contenedorVacio?.classList.add("disabled");
  contenedorProductos?.classList.add("disabled");
  contenedorAcciones?.classList.add("disabled");
  contenedorComprado?.classList.remove("disabled");
  actualizarNumerito();
});

// Init
cargarProductosCarrito();
