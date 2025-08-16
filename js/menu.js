(() => {
  const openMenu  = document.querySelector("#open-menu");
  const closeMenu = document.querySelector("#close-menu");
  const aside     = document.querySelector("aside");

  const toggle = (show) => {
    const want = typeof show === "boolean" ? show : !aside.classList.contains("aside-visible");
    aside.classList.toggle("aside-visible", want);
    // Evita scroll del body cuando el menú está abierto (móvil)
    document.body.style.overflow = want ? "hidden" : "";
  };

  openMenu?.addEventListener("click", () => toggle(true));
  closeMenu?.addEventListener("click", () => toggle(false));

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggle(false);
  });

  // Cerrar si se toca fuera del panel (solo móvil con overlay)
  aside?.addEventListener("click", (e) => {
    // si haces click en el fondo morado, no en el contenido
    if (e.target === aside && window.matchMedia("(max-width: 600px)").matches) {
      toggle(false);
    }
  });

  // (Opcional) abrir automáticamente al cargar en pantallas pequeñas
  // if (window.matchMedia("(max-width: 600px)").matches) toggle(true);
})();
