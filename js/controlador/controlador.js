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

// ... (Todo el código que ya tenías en tu controlador) ...


// ====================================================
// ===== BÚSQUEDA EN API REST (OPEN LIBRARY) =====
// ====================================================
const btnBuscarApi = document.getElementById('btnBuscarApi');
const inputApiBusqueda = document.getElementById('inputApiBusqueda');
const resultadosApi = document.getElementById('resultadosApi');
const mensajeApi = document.getElementById('mensajeApi');

if (btnBuscarApi) {
    btnBuscarApi.addEventListener('click', async () => {
        const termino = inputApiBusqueda.value.trim();
        
        if (!termino) {
            mensajeApi.textContent = 'Por favor ingrese un título o autor para buscar.';
            mensajeApi.style.color = 'red';
            return;
        }

        mensajeApi.textContent = '🔍 Buscando en Open Library... Por favor espere.';
        mensajeApi.style.color = '#0066cc';
        resultadosApi.innerHTML = '';

        try {
            // Llamada al servicio independiente api.js
            const libros = await ServicioAPI.buscarLibrosEnLinea(termino);

            if (libros.length === 0) {
                mensajeApi.textContent = 'No se encontraron libros con ese término.';
                mensajeApi.style.color = 'orange';
                return;
            }

            mensajeApi.textContent = `Se encontraron ${libros.length} resultados:`;
            mensajeApi.style.color = 'green';

            // Renderizar los resultados devueltos por la API
            libros.forEach(libro => {
                const tarjeta = document.createElement('article');
                tarjeta.className = 'tarjeta';
                tarjeta.innerHTML = `
                    <img src="${libro.imagen}" alt="${libro.titulo}" class="tarjeta__imagen" style="max-height: 180px; object-fit: cover;">
                    <div class="tarjeta__contenido">
                        <h3 class="tarjeta__titulo">${libro.titulo}</h3>
                        <p class="tarjeta__autor"><strong>Autor:</strong> ${libro.autor}</p>
                        <p class="tarjeta__precio"><strong>Año:</strong> ${libro.anio}</p>
                        <button class="boton boton--sm" onclick="agregarDesdeApi('${libro.titulo.replace(/'/g, "\\'")}', '${libro.autor.replace(/'/g, "\\'")}', '${libro.imagen}')">
                            + Agregar al Inventario
                        </button>
                    </div>
                `;
                resultadosApi.appendChild(tarjeta);
            });

        } catch (error) {
            mensajeApi.textContent = 'Error al conectar con el servicio de Open Library.';
            mensajeApi.style.color = 'red';
            console.error(error);
        }
    });
}

// Función global para importar un libro de la API al catálogo local
window.agregarDesdeApi = function(titulo, autor, imagen) {
    const nuevoProducto = {
        id: Date.now(),
        nombre: titulo,
        autor: autor,
        precio: 45000, // Precio asignado por defecto
        existencias: 5,
        categoria: 'General',
        imagen: imagen || 'img/logo-libreria.svg',
        caracteristicas: ['Edición Digital / API Import']
    };

    // Guarda en el modelo / localStorage
    Modelo.agregarProducto(nuevoProducto);
    
    // Notifica y actualiza la vista
    alert(`¡"${titulo}" ha sido agregado exitosamente a tu inventario!`);
    if (typeof Vista !== 'undefined' && Vista.renderizar) {
        Vista.renderizar();
    } else {
        location.reload();
    }
};