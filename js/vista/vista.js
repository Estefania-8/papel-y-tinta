

const Vista = {
  formateadorMoneda: new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }),

  formatearPesos(valor) {
    return this.formateadorMoneda.format(valor);
  },

  calcularIva(precio) {
    return Math.round(precio * IVA_ACTUAL);
  },

  describirExistencias(existencias) {
    if (existencias > LIMITE_POCAS_UNIDADES) return `${existencias} unidades disponibles`;
    if (existencias > 1) return `Últimas ${existencias} unidades`;
    if (existencias === 1) return "Última unidad";
    return "Agotado temporalmente";
  },

  pintarCatalogo(productos) {
    const contenedor = document.querySelector("#contenedorCatalogo");
    const contador = document.querySelector("#contador");
    contenedor.innerHTML = "";

    if (productos.length === 0) {
      const vacio = document.createElement("p");
      vacio.className = "estado-vacio";
      vacio.textContent = "No hay productos que coincidan con los filtros seleccionados.";
      contenedor.appendChild(vacio);
    } else {
      productos.forEach((p) => {
        contenedor.appendChild(this.crearTarjeta(p));
      });
    }

    const termino = productos.length === 1 ? "resultado" : "resultados";
    contador.textContent = `Mostrando ${productos.length} ${termino}.`;
  },

 crearTarjeta(p) {
    const art = document.createElement("article");
    art.className = "tarjeta";

    if (p.existencias === 0) art.classList.add("tarjeta--agotada");
    else if (p.existencias <= LIMITE_POCAS_UNIDADES) art.classList.add("tarjeta--pocas");

    const img = document.createElement("img");
    img.className = "tarjeta__imagen";
    img.src = p.imagen;
    img.alt = `Portada de ${p.nombre}`;

    const cat = document.createElement("p");
    cat.className = "tarjeta__categoria";
    cat.textContent = p.categoria;

    const titulo = document.createElement("h3");
    titulo.className = "tarjeta__titulo";
    titulo.textContent = p.nombre;

    const autor = document.createElement("p");
    autor.className = "tarjeta__autor";
    autor.textContent = `Autor: ${p.autor}`;

    const precio = document.createElement("p");
    precio.className = "tarjeta__precio";
    precio.textContent = this.formatearPesos(p.precio);

    const lista = document.createElement("ul");
    lista.className = "tarjeta__lista";
    p.caracteristicas.forEach((c) => {
      const li = document.createElement("li");
      li.textContent = c;
      lista.appendChild(li);
    });

    const estado = document.createElement("p");
    estado.className = "tarjeta__estado";
    estado.textContent = `${this.describirExistencias(p.existencias)} · IVA ${this.formatearPesos(this.calcularIva(p.precio))}`;

    const acciones = document.createElement("div");
    acciones.className = "tarjeta__acciones";

    const btnCarrito = document.createElement("button");
    btnCarrito.type = "button";
    btnCarrito.className = "boton boton--carrito";
    btnCarrito.dataset.id = p.id;
    btnCarrito.disabled = p.existencias === 0;
    btnCarrito.textContent = p.existencias > 0 ? "Agregar al carrito" : "No disponible";

    acciones.appendChild(btnCarrito);
    art.append(img, cat, titulo, autor, precio, lista, estado, acciones);
    return art;
  },

 pintarTabla(datosTabla) {
    const { filas, paginaActual, totalPaginas, totalRegistros } = datosTabla;
    const cuerpo = document.querySelector("#cuerpoTabla");
    cuerpo.innerHTML = "";

    if (filas.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 7;
      td.textContent = "No se encontraron registros con los filtros aplicados.";
      td.style.textAlign = "center";
      tr.appendChild(td);
      cuerpo.appendChild(tr);
    } else {
      filas.forEach((p) => {
        const fila = document.createElement("tr");
        if (p.existencias === 0) fila.classList.add("tabla__fila--agotada");

        const celdasTexto = [
          p.nombre,
          p.autor,
          p.categoria,
          this.formatearPesos(p.precio),
          String(p.existencias),
          p.existencias > 0 ? "Disponible" : "Agotado"
        ];

        celdasTexto.forEach((texto) => {
          const td = document.createElement("td");
          td.textContent = texto;
          fila.appendChild(td);
        });

        const tdAcciones = document.createElement("td");

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "boton boton--tabla-editar";
        btnEditar.dataset.accion = "editar";
        btnEditar.dataset.id = p.id;
        btnEditar.textContent = "Editar";

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "boton boton--tabla-eliminar";
        btnEliminar.dataset.accion = "eliminar";
        btnEliminar.dataset.id = p.id;
        btnEliminar.textContent = "Eliminar";

        tdAcciones.append(btnEditar, btnEliminar);
        fila.appendChild(tdAcciones);
        cuerpo.appendChild(fila);
      });
    }

    // Actualizar controles de paginación
    const infoPag = document.querySelector("#infoPaginacion");
    const btnAnt = document.querySelector("#btnPaginaAnterior");
    const btnSig = document.querySelector("#btnPaginaSiguiente");

    if (infoPag) {
      infoPag.textContent = `Página ${paginaActual} de ${totalPaginas} (${totalRegistros} registros)`;
    }
    if (btnAnt) btnAnt.disabled = paginaActual <= 1;
    if (btnSig) btnSig.disabled = paginaActual >= totalPaginas;
  },

  pintarCategorias(categorias, categoriaActual, productos) {
    const listaCategorias = document.querySelector("#listaCategorias");
    listaCategorias.innerHTML = "";

    const opciones = ["Todas", ...categorias];
    opciones.forEach((nombre) => {
      const cantidad = nombre === "Todas"
        ? productos.length
        : productos.filter((p) => p.categoria === nombre).length;

      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `categorias__boton ${nombre === categoriaActual ? "categorias__boton--activa" : ""}`;
      btn.dataset.categoria = nombre;

      const spanNombre = document.createElement("span");
      spanNombre.textContent = nombre;

      const spanNum = document.createElement("span");
      spanNum.className = "categorias__numero";
      spanNum.textContent = cantidad;

      btn.append(spanNombre, spanNum);
      li.appendChild(btn);
      listaCategorias.appendChild(li);
    });
  },

  pintarResumen(resumen) {
    document.querySelector("#resumenTotal").textContent = resumen.totalProductos;
    document.querySelector("#resumenAgotados").textContent = resumen.agotados;
    document.querySelector("#resumenValor").textContent = this.formatearPesos(resumen.valorInventario);
  },

  pintarCarrito(carrito, totalDinero, totalUnidades) {
    const listaCarrito = document.querySelector("#listaCarrito");
    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
      const liVacio = document.createElement("li");
      liVacio.className = "carrito__vacio";
      liVacio.textContent = "Todavía no ha agregado productos.";
      listaCarrito.appendChild(liVacio);
    } else {
      carrito.forEach((item) => {
        const li = document.createElement("li");
        const spanNombre = document.createElement("span");
        spanNombre.textContent = `${item.cantidad} × ${item.nombre}`;
        const spanPrecio = document.createElement("span");
        spanPrecio.textContent = this.formatearPesos(item.precio * item.cantidad);
        li.append(spanNombre, spanPrecio);
        listaCarrito.appendChild(li);
      });
    }

    document.querySelector("#carritoTotal").textContent = this.formatearPesos(totalDinero);
    document.querySelector("#carritoNav").textContent = totalUnidades;
  },

  pintarResultadosApi(libros) {
    const contenedor = document.querySelector("#resultadosApi");
    contenedor.innerHTML = "";

    libros.forEach((libro, indice) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta";

      const img = document.createElement("img");
      img.src = libro.imagen;
      img.alt = `Portada de ${libro.titulo}`;
      img.className = "tarjeta__imagen";

      const contenido = document.createElement("div");
      contenido.className = "tarjeta__contenido";

      const titulo = document.createElement("h3");
      titulo.className = "tarjeta__titulo";
      titulo.textContent = libro.titulo;

      const autor = document.createElement("p");
      autor.className = "tarjeta__autor";
      autor.textContent = `Autor: ${libro.autor}`;

      const anio = document.createElement("p");
      anio.className = "tarjeta__precio";
      anio.textContent = `Año: ${libro.anio}`;

      contenido.append(titulo, autor, anio);

      const acciones = document.createElement("div");
      acciones.className = "tarjeta__acciones";

      const btnAgregar = document.createElement("button");
      btnAgregar.type = "button";
      btnAgregar.className = "boton btn-agregar-api";
      btnAgregar.dataset.indice = indice;
      btnAgregar.textContent = "Agregar al Inventario";

      acciones.appendChild(btnAgregar);
      tarjeta.append(img, contenido, acciones);
      contenedor.appendChild(tarjeta);
    });
  },

  llenarSelect(selectElement, opciones, textoInicial) {
    selectElement.innerHTML = "";
    const optInicial = document.createElement("option");
    optInicial.value = "";
    optInicial.textContent = textoInicial;
    selectElement.appendChild(optInicial);

    opciones.forEach((opcion) => {
      const opt = document.createElement("option");
      opt.value = opcion;
      opt.textContent = opcion;
      selectElement.appendChild(opt);
    });
  },

  leerFormularioProducto() {
    const caracteristicasRaw = document.querySelector("#caracteristicas").value;
    const caracteristicas = caracteristicasRaw
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c !== "");

    return {
      nombre: document.querySelector("#nombre").value,
      autor: document.querySelector("#nombre_autor").value,
      precio: Number(document.querySelector("#precio").value),
      existencias: document.querySelector("#existencias").value === "" ? 0 : Number(document.querySelector("#existencias").value),
      categoria: document.querySelector("#categoria").value,
      imagen: document.querySelector("#imagen").value,
      caracteristicas
    };
  },

  llenarFormularioProducto(p) {
    document.querySelector("#nombre").value = p.nombre;
    document.querySelector("#nombre_autor").value = p.autor;
    document.querySelector("#precio").value = p.precio;
    document.querySelector("#existencias").value = p.existencias;
    document.querySelector("#categoria").value = p.categoria;
    document.querySelector("#imagen").value = p.imagen;
    document.querySelector("#caracteristicas").value = p.caracteristicas.join(", ");

    const btnSubmit = document.querySelector("#formProducto button[type='submit']");
    btnSubmit.textContent = "Guardar cambios";
    
    // Agregar botón de cancelar si no existe
    let btnCancelar = document.querySelector("#btnCancelarEdicion");
    if (!btnCancelar) {
      btnCancelar = document.createElement("button");
      btnCancelar.type = "button";
      btnCancelar.id = "btnCancelarEdicion";
      btnCancelar.className = "boton boton--secundario";
      btnCancelar.textContent = "Cancelar edición";
      document.querySelector("#formProducto .formulario__acciones").appendChild(btnCancelar);
    }
    btnCancelar.hidden = false;
  },

  limpiarFormularioProducto() {
    document.querySelector("#formProducto").reset();
    const btnSubmit = document.querySelector("#formProducto button[type='submit']");
    btnSubmit.textContent = "Guardar producto";
    const btnCancelar = document.querySelector("#btnCancelarEdicion");
    if (btnCancelar) btnCancelar.hidden = true;
  },

  mostrarMensaje(elemento, texto, tipo) {
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.className = `mensaje ${tipo === "error" ? "mensaje--error" : "mensaje--exito"}`;
  },

  descargarArchivoCSV(contenidoCSV, nombreArchivo) {
    const blob = new Blob(["\uFEFF" + contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }
};