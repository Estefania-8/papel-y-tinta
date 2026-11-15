// ===================== CONTROLADOR =====================
// Escucha eventos del DOM, coordina el Modelo y ordena refrescar la Vista.

const Controlador = {
  idEditando: null,
  resultadosApiActuales: [],

  iniciar() {
    Modelo.cargar();

    // Inicializar Selects
    Vista.llenarSelect(document.querySelector("#categoria"), CATEGORIAS_LIBROS, "Seleccione una categoría");
    Vista.llenarSelect(document.querySelector("#filtroTablaCategoria"), CATEGORIAS_LIBROS, "Todas las categorías");

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
    document.querySelector("#contenedorCatalogo").addEventListener("click", (e) => {
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

    // 5. Búsqueda en tiempo real en catálogo
    document.querySelector("#buscador").addEventListener("input", () => {
      this.refrescarCatalogo();
    });

    // 6. Selección de categorías en barra lateral
    document.querySelector("#listaCategorias").addEventListener("click", (e) => {
      const boton = e.target.closest(".categorias__boton");
      if (boton) {
        Modelo.categoriaActual = boton.dataset.categoria;
        this.refrescar();
      }
    });

    // 7. Filtro Disponibles en barra lateral
    document.querySelector("#soloDisponibles").addEventListener("change", (e) => {
      Modelo.soloDisponibles = e.target.checked;
      this.refrescarCatalogo();
    });

    // 8. Vaciar Carrito
    document.querySelector("#vaciarCarrito").addEventListener("click", () => {
      Modelo.vaciarCarrito();
      this.refrescarCarrito();
    });

    // 9. Controles de la TABLA DE DATOS
    this.iniciarEventosTabla();

    // 10. Consumo de API REST (Open Library)
    this.iniciarEventosApi();

    // 11. Formulario de Contacto
    this.iniciarFormularioContacto();
  },

  iniciarEventosTabla() {
    document.querySelector("#buscadorTabla").addEventListener("input", (e) => {
      Modelo.tablaFiltros.busqueda = e.target.value;
      Modelo.tablaFiltros.paginaActual = 1;
      this.refrescarTabla();
    });

    document.querySelector("#filtroTablaCategoria").addEventListener("change", (e) => {
      Modelo.tablaFiltros.categoria = e.target.value || "Todas";
      Modelo.tablaFiltros.paginaActual = 1;
      this.refrescarTabla();
    });

    document.querySelector("#filtroTablaEstado").addEventListener("change", (e) => {
      Modelo.tablaFiltros.estado = e.target.value;
      Modelo.tablaFiltros.paginaActual = 1;
      this.refrescarTabla();
    });

    document.querySelectorAll(".tabla th[data-orden]").forEach((th) => {
      th.style.cursor = "pointer";
      th.addEventListener("click", () => {
        const campo = th.dataset.orden;
        if (Modelo.tablaFiltros.ordenCampo === campo) {
          Modelo.tablaFiltros.ordenDir = Modelo.tablaFiltros.ordenDir === "asc" ? "desc" : "asc";
        } else {
          Modelo.tablaFiltros.ordenCampo = campo;
          Modelo.tablaFiltros.ordenDir = "asc";
        }
        this.refrescarTabla();
      });
    });

    document.querySelector("#btnPaginaAnterior").addEventListener("click", () => {
      if (Modelo.tablaFiltros.paginaActual > 1) {
        Modelo.tablaFiltros.paginaActual--;
        this.refrescarTabla();
      }
    });

    document.querySelector("#btnPaginaSiguiente").addEventListener("click", () => {
      Modelo.tablaFiltros.paginaActual++;
      this.refrescarTabla();
    });

    document.querySelector("#btnExportarCsv").addEventListener("click", () => {
      const csv = Modelo.generarCSV();
      Vista.descargarArchivoCSV(csv, "inventario_papel_y_tinta.csv");
    });
  },

  iniciarEventosApi() {
    const btnBuscarApi = document.querySelector("#btnBuscarApi");
    const inputApi = document.querySelector("#inputApiBusqueda");
    const mensajeApi = document.querySelector("#mensajeApi");
    const resultadosApi = document.querySelector("#resultadosApi");

    btnBuscarApi.addEventListener("click", async () => {
      const termino = inputApi.value.trim();

      if (!termino) {
        Vista.mostrarMensaje(mensajeApi, "Por favor ingrese un título o autor para buscar.", "error");
        return;
      }

      Vista.mostrarMensaje(mensajeApi, "🔍 Buscando en Open Library... Por favor espere.", "exito");
      resultadosApi.innerHTML = "";

      try {
        const libros = await ServicioAPI.buscarLibrosEnLinea(termino);
        this.resultadosApiActuales = libros;

        if (libros.length === 0) {
          Vista.mostrarMensaje(mensajeApi, "No se encontraron libros con ese término.", "error");
          return;
        }

        Vista.mostrarMensaje(mensajeApi, `Se encontraron ${libros.length} resultados en línea:`, "exito");
        Vista.pintarResultadosApi(libros);
      } catch (error) {
        Vista.mostrarMensaje(mensajeApi, error.message, "error");
      }
    });

    resultadosApi.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-agregar-api");
      if (!btn) return;

      const libro = this.resultadosApiActuales[Number(btn.dataset.indice)];
      if (!libro) return;

      const errores = Modelo.validar({
        id: null,
        nombre: libro.titulo,
        autor: libro.autor,
        precio: 45000,
        existencias: 5,
        categoria: "Narrativa y Ficción",
        imagen: libro.imagen
      });

      if (errores.length > 0) {
        Vista.mostrarMensaje(mensajeApi, errores.join(" "), "error");
        return;
      }

      Modelo.agregar({
        nombre: libro.titulo,
        autor: libro.autor,
        precio: 45000,
        existencias: 5,
        categoria: "Narrativa y Ficción",
        imagen: libro.imagen,
        caracteristicas: ["Pasta blanda", "Importado desde Open Library", "Edición estándar"]
      });

      Vista.mostrarMensaje(mensajeApi, `✓ "${libro.titulo}" fue agregado al inventario correctamente.`, "exito");
      this.refrescar();
    });
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
      const mensajeElem = document.querySelector("#mensaje");
      Vista.mostrarMensaje(mensajeElem, `✓ Se eliminó "${p.nombre}" del inventario.`, "exito");
      mensajeElem.scrollIntoView({ behavior: "smooth", block: "center" });
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

  refrescarTabla() {
    const datosTabla = Modelo.obtenerDatosTabla();
    Vista.pintarTabla(datosTabla);
  },

  refrescarCarrito() {
    const { totalDinero, totalUnidades } = Modelo.calcularTotalCarrito();
    Vista.pintarCarrito(Modelo.carrito, totalDinero, totalUnidades);
  },

  refrescar() {
    this.refrescarCatalogo();
    this.refrescarTabla();
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