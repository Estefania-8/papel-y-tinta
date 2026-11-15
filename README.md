# Papel & Tinta — Sistema de Gestión y Catálogo de Librería Online

Aplicación web desarrollada bajo arquitectura por capas (MVC + Servicios) para la gestión de inventario, catálogo interactivo, carrito de compras y consulta de títulos en línea mediante una API REST pública.

---

## 1. Información Académica e Integrantes

* **Institución:** Institución Universitaria Pascual Bravo — Facultad de Ingeniería (Ingeniería de Software, Nivel 6)
* **Asignatura:** Herramientas de Programación III (ET0056) — Grupo 053 (Periodo 2026-2)
* **Docente:** Luis Fernando Londoño López
* **Integrantes:**
  1. Estefanía Chavarría Patiño

---

## 2. Enlace a la Aplicación Publicada y Ejecución Local

* **Aplicación en vivo (GitHub Pages):** [https://estefania-8.github.io/papel-y-tinta/]`
* **Repositorio en GitHub:** [https://github.com/Estefania-8/papel-y-tinta]

### Cómo ejecutar el proyecto en VS Code (Live Server)
1. Clonar o descargar este repositorio en el equipo local.
2. Abrir la carpeta raíz del proyecto (`papel-y-tinta`) en **Visual Studio Code**.
3. Instalar la extensión **Live Server** (de Ritwick Dey) si no está instalada.
4. Hacer clic derecho sobre el archivo `index.html` y seleccionar **Open with Live Server** (o presionar **Go Live** en la barra inferior).

---

## 3. Estructura del Proyecto (Arquitectura por Capas)

El software separa estrictamente sus responsabilidades en cuatro capas independientes:

Papel & Tinta/
├── css/
│   └── estilos.css              # Hoja de estilos responsiva (Grid, Flexbox, variables y BEM)
├── img/                         # Recursos gráficos locales (logos,   portadas e iconos SVG)
├── js/
│   ├── controlador/
│   │   └── controlador.js       # Gestión de eventos, delegación y coordinación Modelo-Vista
│   ├── modelo/
│   │   └── modelo.js            # Lógica de negocio, validaciones, CRUD, arreglos y localStorage
│   ├── servicios/
│   │   └── api.js               # Consumo asíncrono de la API REST externa (Open Library)
│   ├── vista/
│   │   └── vista.js             # Manipulación segura del DOM (textContent) y renderizado
│   └── app.js                   # Punto de arranque de la aplicación (DOMContentLoaded)
├── index.html                   # Estructura semántica y accesible en HTML5
└── README.md                    # Documentación principal del        repositorio

 ## 4. Normas de Codificación Aplicadas
 * **Nomenclatura JavaScript:** camelCase para variables, funciones y métodos (calcularTotalCarrito, obtenerDatosTabla). Constantes globales en MAYUSCULAS_CON_GUION_BAJO (CLAVE_STORAGE, IVA_ACTUAL).

* **Nomenclatura CSS:** Metodología BEM (bloque__elemento--modificador, ej. .tarjeta__titulo, .menu__enlace--activo) y variables CSS en :root.

* **Seguridad y limpieza:** Uso de textContent en lugar de innerHTML para renderizar datos ingresados por el usuario (prevención de XSS). Código indentado a 2 espacios, comentado en español y libre de console.log de prueba o código muerto.

 ## 5.Documentación de la API REST Consumida
El sistema integra el catálogo global de Open Library para buscar libros por título o autor e importarlos directamente al inventario local.

* **API:** Open Library Search API (gratuita, sin clave de autenticación).

* **URL Base:** https://openlibrary.org/search.json

* **Endpoint:** /search.json

* **Método HTTP:** GET

* **Parámetros de consulta:**

* **q:** Término de búsqueda codificado con encodeURIComponent() (título o autor).

* **limit:** Cantidad máxima de resultados solicitados (limit=5).

## 6. Documentación Oficial Consultada

## 1.MDN Web Docs — Fetch API (fetch, async/await, Response.ok):

* **Enlace:** https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch

* **Uso en el proyecto:** Implementación de peticiones HTTP asíncronas en servicios/api.js, validación de respuestas exitosas con response.ok y captura de errores de red mediante try/catch.

## 2. MDN Web Docs — Array.prototype.sort() y métodos de arreglos (map, filter, find, reduce):

* **Enlace:** https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/sort

* **Uso en el proyecto:** Ordenamiento dinámico por columnas (alfabético con localeCompare y numérico), filtrado combinado, cálculos de resumen de inventario y totales del carrito en modelo.js.

## 3.MDN Web Docs — Node.textContent y prevención de XSS:

* **Enlace:** https://developer.mozilla.org/es/docs/Web/API/Node/textContent

* **Uso en el proyecto:** Renderizado seguro de los datos ingresados por los usuarios en las tarjetas del catálogo y las filas de la tabla en vista.js, evitando la ejecución de código HTML malicioso.

## 4.MDN Web Docs — Window.localStorage:

* **Enlace:** https://developer.mozilla.org/es/docs/Web/API/Window/localStorage

* **Uso en el proyecto:** Persistencia local del catálogo de productos en formato JSON (JSON.stringify y JSON.parse) para conservar los cambios al recargar el navegador.


## 5.Open Library Developers — Search API Documentation:

* **Enlace:** https://openlibrary.org/dev/docs/api/search

* **Uso en el proyecto:** Consulta de la estructura de parámetros (q, limit) y construcción de las URLs de portadas (covers.openlibrary.org) mediante el campo cover_i.

## 7. Créditos de Recursos Externos
* **Portadas e información bibliográfica dinámica:** Obtenidas en tiempo real desde la API pública de Open Library (covers.openlibrary.org).

* **Iconografía y logotipo:** Archivos SVG propios ubicados en la carpeta img/ (logo-libreria.svg, instagram.svg, facebook.svg, X.svg).