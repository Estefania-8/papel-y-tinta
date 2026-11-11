// ===================== CONTROLADOR =====================
// Escucha eventos del DOM, coordina el Modelo y ordena refrescar la Vista.

const Controlador = {
  idEditando: null,

  iniciar() {
    Modelo.cargar();

    // Inicializar Selects
    Vista.llenarSelect(document.querySelector("#categoria"), CATEGORIAS_LIBROS, "Seleccione una categoría");
    
    this.refrescar();

    // 1. Evento Submit: Guardar / Editar Producto
    document.querySelector("#formProducto").addEventListener("submit", (e) => {
      e.preventDefault();
      this.guardarProducto();
    });

    // 2. Delegación de eventos para la TABLA DE INVENTARIO (Editar / Eliminar)
    document.querySelector("#cuerpoTabla").addEventListener("click", (e) => {
      const boton = e.target.closest("button");
      if (!boton) return;

      const id = Number(boton.dataset.id);
      const accion = boton.dataset.accion;

      if (accion === "editar") {
        this.editarProducto(id);
      } else if (accion === "eliminar") {
        this.eliminarProducto(id);
      }
    });

    // 3. Delegación de eventos para el CATÁLOGO (Agregar al carrito)
    document.querySelector(".catalogo__contenedor").addEventListener("click", (e) => {
      const boton = e.target.closest("button");
      if (!boton) return;

      const id = Number(boton.dataset.id);
      if (boton.classList.contains("boton--carrito")) {
        this.agregarAlCarrito(id);
      }
    });

    // 4. Cancelar Edición
    document.querySelector("#formProducto").addEventListener("click", (e) => {
      if (e.target.id === "btnCancelarEdicion") {
        this.cancelarEdicion();
      }
    });

    // 5. Búsqueda en tiempo real
    document.querySelector("#buscador").addEventListener("input", () => {
      this.refrescarCatalogo();
    });

    // 6. Selección de categorías
    document.querySelector("#listaCategorias").addEventListener("click", (e) => {
      const boton = e.target.closest(".categorias__boton");
      if (boton) {
        Modelo.categoriaActual = boton.dataset.categoria;
        this.refrescar();
      }
    });

    // 7. Filtro Disponibles
    document.querySelector("#soloDisponibles").addEventListener("change", (e) => {
      Modelo.soloDisponibles = e.target.checked;
      this.refrescarCatalogo();
    });

    // 8. Vaciar Carrito
    document.querySelector("#vaciarCarrito").addEventListener("click", () => {
      Modelo.vaciarCarrito();
      this.refrescarCarrito();
    });

    // 9. Formulario de Contacto
    this.iniciarFormularioContacto();
  },

  guardarProducto() {
    const datos = Vista.leerFormularioProducto();
    const errores = Modelo.validar({ id: this.idEditando, ...datos });
    const mensajeElem = document.querySelector("#mensaje");

    if (errores.length > 0) {
      Vista.mostrarMensaje(mensajeElem, errores.join(" "), "error");
      return;
    }

    if (this.idEditando === null) {
      const nuevo = Modelo.agregar(datos);
      Vista.mostrarMensaje(mensajeElem, `Se agregó "${nuevo.nombre}" al catálogo.`, "exito");
    } else {
      Modelo.actualizar(this.idEditando, datos);
      Vista.mostrarMensaje(mensajeElem, `Producto "${datos.nombre}" actualizado correctamente.`, "exito");
      this.idEditando = null;
    }

    Vista.limpiarFormularioProducto();
    this.refrescar();
  },

  editarProducto(id) {
    const p = Modelo.buscarPorId(id);
    if (p) {
      this.idEditando = id;
      Vista.llenarFormularioProducto(p);
      window.location.hash = "#formProducto";
    }
  },

  cancelarEdicion() {
    this.idEditando = null;
    Vista.limpiarFormularioProducto();
    const mensajeElem = document.querySelector("#mensaje");
    Vista.mostrarMensaje(mensajeElem, "Edición cancelada.", "exito");
  },

  eliminarProducto(id) {
    const p = Modelo.buscarPorId(id);
    if (p && confirm(`¿Deseas eliminar "${p.nombre}" del catálogo?`)) {
      Modelo.eliminar(id);
      if (this.idEditando === id) this.cancelarEdicion();
      Vista.mostrarMensaje(document.querySelector("#mensaje"), `Se eliminó "${p.nombre}".`, "exito");
      this.refrescar();
    }
  },

  agregarAlCarrito(id) {
    const res = Modelo.agregarAlCarrito(id);
    const mensajeElem = document.querySelector("#mensaje");
    Vista.mostrarMensaje(mensajeElem, res.msj, res.ok ? "exito" : "error");
    if (res.ok) this.refrescarCarrito();
  },

  iniciarFormularioContacto() {
    const formContacto = document.querySelector("#formContacto");
    const contactoMensaje = document.querySelector("#contactoMensaje");
    const contadorMensaje = document.querySelector("#contadorMensaje");

    contactoMensaje.addEventListener("input", () => {
      const largo = contactoMensaje.value.length;
      contadorMensaje.textContent = `${largo} de 400 caracteres (mínimo 20)`;
      contadorMensaje.classList.toggle("campo__ayuda--alerta", largo > 0 && largo < 20);
    });

    formContacto.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = document.querySelector("#contactoNombre").value.trim();
      const producto = document.querySelector("#contactoProducto").value;

      Vista.mostrarMensaje(
        document.querySelector("#mensajeContacto"),
        `Gracias, ${nombre}. Recibimos su solicitud sobre "${producto}" y le responderemos pronto.`,
        "exito"
      );
      formContacto.reset();
      contadorMensaje.textContent = `0 de 400 caracteres (mínimo 20)`;
    });
  },

  refrescarCatalogo() {
    const textoBuscado = document.querySelector("#buscador").value;
    const filtrados = Modelo.obtenerFiltrados(textoBuscado);
    Vista.pintarCatalogo(filtrados);
  },

  refrescarCarrito() {
    const { totalDinero, totalUnidades } = Modelo.calcularTotalCarrito();
    Vista.pintarCarrito(Modelo.carrito, totalDinero, totalUnidades);
  },

  refrescar() {
    this.refrescarCatalogo();
    Vista.pintarTabla(Modelo.productos);
    Vista.pintarCategorias(CATEGORIAS_LIBROS, Modelo.categoriaActual, Modelo.productos);
    Vista.pintarResumen(Modelo.calcularResumen());
    this.refrescarCarrito();
    Vista.llenarSelect(
      document.querySelector("#contactoProducto"),
      Modelo.productos.map((p) => p.nombre),
      "Seleccione un producto"
    );
  }
};

document.addEventListener("DOMContentLoaded", () => Controlador.iniciar());