// ===================== CAPA DE PRESENTACIÓN (VISTA) =====================
// Manipula el DOM, pinta catálogos, tablas y elementos visuales. No maneja lógica directa.

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
    const contenedor = document.querySelector(".catalogo__contenedor");
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

    art.innerHTML = `
      <img class="tarjeta__imagen" src="${p.imagen}" alt="Portada de ${p.nombre}" width="640" height="420">
      <p class="tarjeta__categoria">${p.categoria}</p>
      <h3 class="tarjeta__titulo">${p.nombre}</h3>
      <p class="tarjeta__autor">Autor: ${p.autor}</p>
      <p class="tarjeta__precio">${this.formatearPesos(p.precio)}</p>
      <ul class="tarjeta__lista">
        ${p.caracteristicas.map((c) => `<li>${c}</li>`).join("")}
      </ul>
      <p class="tarjeta__estado">${this.describirExistencias(p.existencias)} · IVA ${this.formatearPesos(this.calcularIva(p.precio))}</p>
      <div class="tarjeta__acciones">
        <button type="button" class="boton boton--carrito" data-id="${p.id}" ${p.existencias === 0 ? "disabled" : ""}>
          ${p.existencias > 0 ? "Agregar al carrito" : "No disponible"}
        </button>
      </div>
    `;
    return art;
  },

  pintarTabla(productos) {
    const cuerpo = document.querySelector("#cuerpoTabla");
    cuerpo.innerHTML = "";

    productos.forEach((p) => {
      const fila = document.createElement("tr");
      if (p.existencias === 0) fila.classList.add("tabla__fila--agotada");

      fila.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.autor}</td>
        <td>${p.categoria}</td>
        <td>${this.formatearPesos(p.precio)}</td>
        <td>${p.existencias}</td>
        <td>${p.existencias > 0 ? "Disponible" : "Agotado"}</td>
        <td>
        <button type="button" class="boton boton--tabla-editar" data-accion="editar" data-id="${p.id}">Editar</button>
        <button type="button" class="boton boton--tabla-eliminar" data-accion="eliminar" data-id="${p.id}">Eliminar</button>
       </td>
      `;
      cuerpo.appendChild(fila);
    });
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
      const esActiva = nombre === categoriaActual;
      li.innerHTML = `
        <button type="button" class="categorias__boton ${esActiva ? "categorias__boton--activa" : ""}" data-categoria="${nombre}">
          <span>${nombre}</span>
          <span class="categorias__numero">${cantidad}</span>
        </button>
      `;
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
      listaCarrito.innerHTML = `<li class="carrito__vacio">Todavía no ha agregado productos.</li>`;
    } else {
      carrito.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${item.cantidad} × ${item.nombre}</span>
          <span>${this.formatearPesos(item.precio * item.cantidad)}</span>
        `;
        listaCarrito.appendChild(li);
      });
    }

    document.querySelector("#carritoTotal").textContent = this.formatearPesos(totalDinero);
    document.querySelector("#carritoNav").textContent = totalUnidades;
  },

  llenarSelect(selectElement, opciones, textoInicial) {
    selectElement.innerHTML = `<option value="">${textoInicial}</option>`;
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
    elemento.textContent = texto;
    elemento.className = `mensaje ${tipo === "error" ? "mensaje--error" : "mensaje--exito"}`;
  }
};