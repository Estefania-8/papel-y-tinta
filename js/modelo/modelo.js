// ===================== CAPA DE DATOS Y NEGOCIO (MODELO) =====================
// Administra el estado de la aplicación, persistencia en localStorage y validaciones.

const CLAVE_STORAGE = "papelytinta";
const IVA_ACTUAL = 0.19;
const LIMITE_POCAS_UNIDADES = 10;
const CATEGORIAS_LIBROS = ["Narrativa y Ficción", "Manga y comic", "Desarrollo personal", "Infantil y Juvenil"];

const Modelo = {
  productos: [],
  carrito: [],
  categoriaActual: "Todas",
  soloDisponibles: false,

  // Inicializa o recupera los datos desde localStorage
  cargar() {
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if (guardado) {
      this.productos = JSON.parse(guardado);
    } else {
      this.productos = [
        {
          id: 1, nombre: "Habitos atomicos", autor: "James Clear", categoria: "Desarrollo personal",
          precio: 45000, existencias: 12, imagen: "img/habitos-atomicos.jpg",
          caracteristicas: ["Pasta dura", "Tiene 300 paginas", "Tiene letra grande"]
        },
        {
          id: 2, nombre: "One Piece - Vol.1", autor: "Eiichiro Oda", categoria: "Manga y comic",
          precio: 35000, existencias: 0, imagen: "img/manga-one-piece.jpg",
          caracteristicas: ["Pasta blanda", "Tiene 200 paginas", "Los dibujos son a blanco y negro"]
        },
        {
          id: 3, nombre: "Cien años de soledad", autor: "Gabriel Garcia Marquez", categoria: "Narrativa y Ficción",
          precio: 50000, existencias: 8, imagen: "img/cien_anos_soledad.jpg",
          caracteristicas: ["Pasta dura", "Tiene 500 paginas ", "Tiene letra pequeña"]
        },
        {
          id: 4, nombre: "El principito", autor: "Antonie de Saint-Exupéry", categoria: "Infantil y Juvenil",
          precio: 60000, existencias: 34, imagen: "img/el-principito.jpg",
          caracteristicas: ["Pasta dura", "Tiene 120 paginas", "Tiene letra grande"]
        }
      ];
      this.guardar();
    }
  },

  guardar() {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(this.productos));
  },

  // Reglas de negocio requeridas por la especificación
  validar({ id, nombre, autor, precio, existencias, categoria, imagen }) {
    const errores = [];

    // Regla 1: Nombre con longitud mínima y requerido
    if (!nombre || nombre.trim().length < 3) {
      errores.push("El nombre del producto debe tener al menos 3 caracteres.");
    }

    // Regla 2: Evitar duplicados (sin importar mayúsculas/minúsculas)
    const existeDuplicado = this.productos.some(
      (p) => p.nombre.toLowerCase() === nombre.trim().toLowerCase() && p.id !== id
    );
    if (existeDuplicado) {
      errores.push(`Ya existe un producto con el nombre "${nombre.trim()}".`);
    }

    // Regla 3: Autor requerido y con formato adecuado
    if (!autor || autor.trim().length < 3) {
      errores.push("El nombre del autor debe tener al menos 3 caracteres.");
    }

    // Regla 4: Precio numérico mayor a cero
    if (isNaN(precio) || precio <= 0) {
      errores.push("El precio debe ser mayor a 0.");
    }

    // Regla 5: Existencias enteras no negativas
    if (!Number.isInteger(existencias) || existencias < 0) {
      errores.push("Las existencias deben ser un número entero mayor o igual a 0.");
    }

    // Regla 6: Categoría válida elegida
    if (!CATEGORIAS_LIBROS.includes(categoria)) {
      errores.push("Debe seleccionar una categoría válida.");
    }

    if (!imagen || imagen.trim() === "") {
      errores.push("Debe ingresar la ruta o URL de la imagen.");
    }

    return errores;
  },

  // CREATE
  agregar(datos) {
    const nuevoId = this.productos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const nuevoProducto = {
      id: nuevoId,
      nombre: datos.nombre.trim(),
      autor: datos.autor.trim(),
      categoria: datos.categoria,
      precio: datos.precio,
      existencias: datos.existencias,
      imagen: datos.imagen.trim(),
      caracteristicas: datos.caracteristicas
    };
    this.productos.push(nuevoProducto);
    this.guardar();
    return nuevoProducto;
  },

  // READ
  buscarPorId(id) {
    return this.productos.find((p) => p.id === id);
  },

  // UPDATE
  actualizar(id, datos) {
    this.productos = this.productos.map((p) =>
      p.id === id
        ? {
            ...p,
            nombre: datos.nombre.trim(),
            autor: datos.autor.trim(),
            categoria: datos.categoria,
            precio: datos.precio,
            existencias: datos.existencias,
            imagen: datos.imagen.trim(),
            caracteristicas: datos.caracteristicas
          }
        : p
    );
    this.guardar();
  },

  // DELETE
  eliminar(id) {
    this.productos = this.productos.filter((p) => p.id !== id);
    this.eliminarDelCarrito(id);
    this.guardar();
  },

  // Operaciones del Carrito
  agregarAlCarrito(id) {
    const producto = this.buscarPorId(id);
    if (!producto || producto.existencias <= 0) return { ok: false, msj: "Producto no disponible." };

    const itemCarrito = this.carrito.find((item) => item.id === id);
    if (itemCarrito) {
      if (itemCarrito.cantidad >= producto.existencias) {
        return { ok: false, msj: `No hay más unidades disponibles de "${producto.nombre}".` };
      }
      itemCarrito.cantidad++;
    } else {
      this.carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      });
    }
    return { ok: true, msj: `"${producto.nombre}" agregado al carrito.` };
  },

  eliminarDelCarrito(id) {
    this.carrito = this.carrito.filter((item) => item.id !== id);
  },

  vaciarCarrito() {
    this.carrito = [];
  },

  // Datos calculados mediante REDUCE
  calcularResumen() {
    const totalProductos = this.productos.length;
    const agotados = this.productos.filter((p) => p.existencias === 0).length;
    const valorInventario = this.productos.reduce((suma, p) => suma + p.precio * p.existencias, 0);

    return { totalProductos, agotados, valorInventario };
  },

  calcularTotalCarrito() {
    const totalDinero = this.carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    const totalUnidades = this.carrito.reduce((suma, item) => suma + item.cantidad, 0);
    return { totalDinero, totalUnidades };
  },

  obtenerFiltrados(textoBuscado) {
    const texto = textoBuscado.trim().toLowerCase();
    return this.productos.filter((p) => {
      const coincideTexto = p.nombre.toLowerCase().includes(texto) || p.autor.toLowerCase().includes(texto);
      const coincideCat = this.categoriaActual === "Todas" || p.categoria === this.categoriaActual;
      const coincideDisp = !this.soloDisponibles || p.existencias > 0;
      return coincideTexto && coincideCat && coincideDisp;
    });
  }
};