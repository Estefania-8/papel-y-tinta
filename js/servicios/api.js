// js/servicios/api.js
// Servicio independiente para consultar la API pública de Open Library

const ServicioAPI = {
  URL_BASE: "https://openlibrary.org/search.json",

  /**
   * Busca libros en internet mediante Open Library REST API
   * @param {string} termino - Texto o título a buscar
   * @returns {Promise<Array>} Lista de libros simplificada
   */
  async buscarLibrosEnLinea(termino) {
    if (!termino || termino.trim() === "") return [];

    try {
      const respuesta = await fetch(`${this.URL_BASE}?q=${encodeURIComponent(termino)}&limit=5`);

      // Validación de respuesta HTTP correcta (200-299)
      if (!respuesta.ok) {
        throw new Error(`Error en la petición: ${respuesta.status} ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();

      // Transformación de la respuesta con map()
      return datos.docs.map((doc) => {
        const idPortada = doc.cover_i;
        return {
          titulo: doc.title || "Título no disponible",
          autor: doc.author_name ? doc.author_name.join(", ") : "Autor desconocido",
          anio: doc.first_publish_year || "N/A",
          imagen: idPortada
            ? `https://covers.openlibrary.org/b/id/${idPortada}-M.jpg`
            : "https://via.placeholder.com/150?text=Sin+Portada"
        };
      });

    } catch (error) {
      console.error("Error en ServicioAPI:", error.message);
      throw new Error("No se pudo conectar con el catálogo en línea. Verifique su conexión.");
    }
  }
};