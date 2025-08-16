// --- Estado global ---
let productos = [];
let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];

// --- Elementos de UI ---
const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
const numerito = document.querySelector("#numerito");
const aside = document.querySelector("aside"); // para cerrar el menú en mobile

// --- Init numerito al cargar ---
actualizarNumerito();

// --- Cargar productos ---
fetch("./js/productos.json")
  .then(r => r.json())
  .then(data => {
    // Normaliza: si no hay 'imagenes', crea a partir de 'imagen'
    productos = data.map(p => {
      if (!p.imagenes) p.imagenes = p.imagen ? [p.imagen] : [];
      return p;
    });

    cargarProductos(productos);
    wireCarruseles(); // listeners (delegados) para flechas y dots
  })
  .catch(err => console.error("Error cargando productos.json:", err));

// =================== Renderización ===================
function cargarProductos(lista) {
  contenedorProductos.innerHTML = "";

  lista.forEach(producto => {
    const dots = (producto.imagenes || [])
      .map((_, i) => `<span class="dot ${i === 0 ? "active" : ""}" data-i="${i}"></span>`)
      .join("");

    // Si solo hay 1 imagen, ocultamos flechas
    const hayVariantes = producto.imagenes && producto.imagenes.length > 1;

    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <div class="producto-imagen">
        <div class="carrusel" data-id="${producto.id}">
          <button class="prev" aria-label="Imagen anterior" ${!hayVariantes ? "disabled" : ""}>&#10094;</button>
          <img src="${producto.imagenes[0] || ""}" data-index="0" class="img-producto producto-imagen" alt="${producto.titulo}">
          <button class="next" aria-label="Imagen siguiente" ${!hayVariantes ? "disabled" : ""}>&#10095;</button>
        </div>
        <div class="dots">${dots}</div>
      </div>

      <div class="producto-detalles">
        <h3 class="producto-titulo">${producto.titulo}</h3>
        <p class="producto-precio">$${producto.precio}</p>
        <button class="producto-agregar" id="${producto.id}">Agregar</button>
      </div>
    `;
    contenedorProductos.appendChild(div);
  });

  wireAgregar();
}

// =================== Categorías ===================
botonesCategorias.forEach(boton => {
  boton.addEventListener("click", (e) => {
    // UI active
    botonesCategorias.forEach(b => b.classList.remove("active"));
    e.currentTarget.classList.add("active");

    // Cerrar menú lateral en mobile
    if (aside) aside.classList.remove("aside-visible");

    if (e.currentTarget.id !== "todos") {
      const ejemplo = productos.find(p => p.categoria?.id === e.currentTarget.id);
      tituloPrincipal.innerText = ejemplo?.categoria?.nombre || "Productos";
      const filtrados = productos.filter(p => p.categoria?.id === e.currentTarget.id);
      cargarProductos(filtrados);
    } else {
      tituloPrincipal.innerText = "Todos los productos";
      cargarProductos(productos);
    }
  });
});

// =================== Agregar al carrito ===================
function wireAgregar() {
  const botonesAgregar = document.querySelectorAll(".producto-agregar");
  botonesAgregar.forEach(b => b.addEventListener("click", agregarAlCarrito));
}

function agregarAlCarrito(e) {
  const id = e.currentTarget.id;
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const existente = productosEnCarrito.find(p => p.id === id);
  if (existente) {
    existente.cantidad++;
  } else {
    productosEnCarrito.push({
      id: producto.id,
      titulo: producto.titulo,
      precio: producto.precio,
      imagen: (producto.imagenes && producto.imagenes[0]) || producto.imagen || "",
      cantidad: 1
    });
  }

  localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
  actualizarNumerito();

  // Toast
  if (window.Toastify) {
    Toastify({
      text: "Producto agregado",
      duration: 2500,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, var(--clr-main), var(--clr-main-light))",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: ".75rem"
        },
      offset: { x: '1.5rem', y: '1.5rem' }
    }).showToast();
  }
}

function actualizarNumerito() {
  const n = productosEnCarrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  if (numerito) numerito.innerText = n;
}

// =================== Carrusel (flechas + dots) ===================
// Usamos delegación para no reatachar listeners tras cada render
function wireCarruseles() {
  document.addEventListener("click", (e) => {
    // Flechas
    const btn = e.target.closest(".prev, .next");
    if (btn) {
      if (btn.disabled) return;

      const carrusel = btn.closest(".carrusel");
      const id = carrusel.dataset.id;
      const producto = productos.find(p => p.id === id);
      if (!producto || !producto.imagenes?.length) return;

      const img = carrusel.querySelector(".img-producto");
      let idx = Number(img.dataset.index) || 0;

      idx = btn.classList.contains("prev")
        ? (idx - 1 + producto.imagenes.length) % producto.imagenes.length
        : (idx + 1) % producto.imagenes.length;

      img.src = producto.imagenes[idx];
      img.dataset.index = idx;

      // Actualiza dots
      const dots = carrusel.parentElement.querySelectorAll(".dot");
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      return;
    }

    // Puntitos
    if (e.target.classList.contains("dot")) {
      const dot = e.target;
      const idx = Number(dot.dataset.i);
      const card = dot.closest(".producto");
      const carrusel = card.querySelector(".carrusel");
      const id = carrusel.dataset.id;
      const producto = productos.find(p => p.id === id);
      if (!producto || !producto.imagenes?.length) return;

      const img = carrusel.querySelector(".img-producto");
      img.src = producto.imagenes[idx];
      img.dataset.index = idx;

      card.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === idx));
    }
  });
}
