GeoIndex Explorer - Documentación del Proyecto

Descripción:
GeoIndex Explorer es una aplicación de demostración y visualización para comparar e
interactuar con distintos índices espaciales (KD-Tree, Quadtree, Grid File simulado y R-Tree).
Permite cargar conjuntos de puntos, ejecutar consultas espaciales (rango, K-NN, intersección
con polígono, ventana) y visualizar métricas y nodos visitados en el mapa.

Estructura del proyecto:
- `index.html`: Interfaz principal que carga librerías y módulos.
- `style.css`: Estilos de la aplicación.
- `main.js`: Lógica de la aplicación (control de UI, carga de datos y ejecución de consultas).
- `data/`
  - `samplePoints.json`: Fichero de ejemplo con puntos de interés.
- `modules/`
  - `kdTree.js`: Implementación del KD-Tree (k-dimensional).
  - `quadTree.js`: Implementación del Quadtree (particionamiento por región).
  - `gridFile.js`: Implementación/simulación de Grid File.
  - `rTree.js`: Implementación del R-Tree (basada en MBRs).
- `queries/`
  - `rangeQuery.js`: Búsqueda por rango circular / ventana.
  - `nearestNeighbor.js`: Algoritmo K-vecinos cercanos.
  - `polygonIntersection.js`: Intersección y tests con polígonos.
- `utils/`
  - `geometryUtils.js`: Funciones geométricas de apoyo (distancias, conversiones, etc.).
  - `randomDataGenerator.js`: Generador de puntos aleatorios para pruebas.
  - `timer.js`: Utilidad para medir tiempos de ejecución.
- `visualization/`
  - `map.js`: Inicialización del mapa (Leaflet) y renderizado de puntos / capas.
  - `treeVisualizer.js`: Dibuja límites/nodos visitados de las estructuras sobre el mapa.
  - `metricsPanel.js`: Actualiza panel de métricas en la interfaz.

Dependencias (CDN usadas desde `index.html`):
- `Leaflet` (mapas).
- `Leaflet Draw` (herramientas para dibujar polígonos/áreas en el mapa).

Arranque y ejecución (recomendado):
1) Abrir con servidor local (recomendado para evitar problemas de CORS al cargar JSON):
   - Con Python: `python -m http.server 8000`
   - Abrir en navegador: `http://localhost:8000`
2) Alternativamente, abrir `index.html` directamente en el navegador (puede fallar cargar archivos locales).

Flujo de trabajo básico en la UI:
- Seleccione la estructura en `Estructura de Índice Espacial`.
- Cargue datos: `Cargar Medellín`, `Cargar Bogotá` (si están implementados), o generar `Datos Aleatorios`.
- Seleccione tipo de consulta (Rango, K-NN, Intersección polígono, Ventana) y parámetros (radio, K).
- Presione `Ejecutar Consulta` para ver resultados en el mapa y métricas en el panel.

Formato esperado de datos:
- `data/samplePoints.json` debe contener una lista de puntos con latitud/longitud y propiedades opcionales.
  Ejemplo simple: [{"id":1, "lat":6.2442, "lng":-75.5812, "name":"Punto A"}, ...]

Descripción breve de módulos y responsabilidades:
- `kdTree.js`:
  - Construcción del KD-Tree a partir de una lista de puntos.
  - Búsqueda K-NN y búsqueda por rango usando poda basada en hiperplanos.
- `quadTree.js`:
  - Estructura por región (división en 4 cuadrantes).
  - Soporta inserción, consulta por rango / ventana y recorrido para visualización.
- `gridFile.js`:
  - Simulación de Grid File (rejilla espacial) para comparar comportamiento.
  - Ideal para ver efectos de factor de carga y celdas con distintos tamaños.
- `rTree.js`:
  - Implementación básica de R-Tree (MBRs) y operaciones de búsqueda por intersección.
- `queries/*.js`:
  - Contienen funciones que, dadas una estructura y parámetros, ejecutan la consulta y devuelven
    resultados + métricas (nodos visitados, tiempo, puntos analizados).
- `visualization/*`:
  - Gestionan la capa de puntos, la visualización de nodos visitados (amarillo), resultados (verde),
    y la zona de consulta (rojo translúcido).

Métricas mostradas y su significado:
- `Puntos Analizados`: número de puntos cuyos valores fueron comprobados en la consulta.
- `Nodos Visitados`: cantidad de nodos/MBRs/celdas que el algoritmo tuvo que inspeccionar.
- `Tiempo de Búsqueda`: tiempo transcurrido en ms medido por `timer.js`.
- `Resultados`: número de puntos devueltos por la consulta.
- `Factor de Carga`: métrica relevante para Grid File (ratio de puntos por celda) o estructuras de partición.

Extensiones y buenas prácticas:
- Para añadir más datos, colocar archivos JSON en `data/` y adaptar `main.js` para ofrecer el botón de carga.
- Para añadir otra estructura espacial, crear `modules/nombreEstructura.js` con la API mínima esperada:
  - `build(points)`, `rangeQuery(params)`, `knnQuery(params)` y funciones auxiliares para visualización.
- Para mejorar la UI, `visualization/treeVisualizer.js` es el punto de entrada para dibujar nodos; seguir su
  formato para añadir nuevas capas.

Depuración y problemas comunes:
- Mapa en blanco: verificar conexión CDN de Leaflet en `index.html` y consola del navegador.
- JSON no carga: ejecutar servidor local (ver sección Arranque).
- Consultas lentas: habilitar métricas y revisar `Nodos Visitados` para identificar poda deficiente.

Contribuciones y créditos:
- Proyecto educativo/demostrativo. Se recomienda documentar cambios y mantener claridad en la API de cada módulo.

Licencia:
- No se incluye licencia explícita en este repositorio. Añadir `LICENSE` si se desea publicar.

Contacto / Siguientes pasos recomendados:
- Probar con distintos tamaños de dataset en `data/samplePoints.json`.
- Añadir tests unitarios para las operaciones de cada estructura (`tests/`).
- Mejorar visualización de métricas comparativas con D3.js (opcional).

Fin de la documentación básica.
