let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");

// Init
cargarProductosCarrito();

function cargarProductosCarrito() {
  if (productosEnCarrito.length > 0) {
    contenedorCarritoVacio?.classList.add("disabled");
    contenedorCarritoProductos?.classList.remove("disabled");
    contenedorCarritoAcciones?.classList.remove("disabled");
    contenedorCarritoComprado?.classList.add("disabled");

    contenedorCarritoProductos.innerHTML = "";

    productosEnCarrito.forEach(p => {
      const div = document.createElement("div");
      div.className = "carrito-producto";
      div.innerHTML = `
        <img class="carrito-producto-imagen" src="${p.imagen || ""}" alt="${p.titulo}">
        <div class="carrito-producto-titulo">
          <small>Título</small>
          <h3>${p.titulo}</h3>
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
        <button class="carrito-producto-eliminar" data-id="${p.id}"><i class="bi bi-trash"></i></button>
      `;
      contenedorCarritoProductos.appendChild(div);
    });

    // Eliminar
    document.querySelectorAll(".carrito-producto-eliminar").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        productosEnCarrito = productosEnCarrito.filter(p => p.id !== id);
        persistir();
        cargarProductosCarrito();
      });
    });

    actualizarTotal();

  } else {
    contenedorCarritoVacio?.classList.remove("disabled");
    contenedorCarritoProductos?.classList.add("disabled");
    contenedorCarritoAcciones?.classList.add("disabled");
    contenedorCarritoComprado?.classList.add("disabled");
    if (contenedorCarritoProductos) contenedorCarritoProductos.innerHTML = "";
    actualizarTotal();
  }
}

if (botonVaciar) {
  botonVaciar.addEventListener("click", () => {
    productosEnCarrito = [];
    persistir();
    cargarProductosCarrito();
  });
}

function actualizarTotal() {
  const totalCalculado = productosEnCarrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  if (contenedorTotal) contenedorTotal.innerText = `$${totalCalculado}`;
}

if (botonComprar) {
  botonComprar.addEventListener("click", () => {
    productosEnCarrito = [];
    persistir();

    contenedorCarritoVacio?.classList.add("disabled");
    contenedorCarritoProductos?.classList.add("disabled");
    contenedorCarritoAcciones?.classList.add("disabled");
    contenedorCarritoComprado?.classList.remove("disabled");
  });
}

function persistir() {
  localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}
