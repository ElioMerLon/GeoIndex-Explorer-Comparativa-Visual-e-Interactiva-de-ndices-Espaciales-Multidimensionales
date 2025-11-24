// ========== VARIABLES GLOBALES ==========
let mapManager;
let treeVisualizer;
let metricsPanel;
let currentStructure = null;
let currentStructureType = 'kdtree';
let dataPoints = [];
let selectedQueryType = null;

// Queries
let rangeQuery;
let knnQuery;
let polygonQuery;

// ========== DATOS DE EJEMPLO ==========
const medellinPOIs = [
    { lat: 6.2476, lng: -75.5658, name: 'Parque Lleras', type: 'Parque' },
    { lat: 6.2442, lng: -75.5812, name: 'Parque Botero', type: 'Cultura' },
    { lat: 6.2518, lng: -75.5636, name: 'Parque El Poblado', type: 'Parque' },
    { lat: 6.2308, lng: -75.5906, name: 'Universidad de Antioquia', type: 'Educación' },
    { lat: 6.1747, lng: -75.5978, name: 'Aeropuerto José María Córdova', type: 'Transporte' },
    { lat: 6.2914, lng: -75.5361, name: 'Parque Arví', type: 'Naturaleza' },
    { lat: 6.2303, lng: -75.5761, name: 'Plaza Mayor', type: 'Centro de Convenciones' },
    { lat: 6.2707, lng: -75.5675, name: 'Estadio Atanasio Girardot', type: 'Deporte' },
    { lat: 6.2443, lng: -75.5735, name: 'Catedral Metropolitana', type: 'Religioso' },
    { lat: 6.2490, lng: -75.5748, name: 'Museo de Antioquia', type: 'Cultura' },
    { lat: 6.2679, lng: -75.5664, name: 'Jardín Botánico', type: 'Naturaleza' },
    { lat: 6.2501, lng: -75.5641, name: 'Centro Comercial Santa Fe', type: 'Comercio' },
    { lat: 6.2092, lng: -75.5752, name: 'Cerro Nutibara', type: 'Mirador' },
    { lat: 6.1678, lng: -75.6111, name: 'Pueblito Paisa', type: 'Turismo' },
    { lat: 6.2299, lng: -75.5637, name: 'Metro Cable', type: 'Transporte' }
];

const bogotaPOIs = [
    { lat: 4.7110, lng: -74.0721, name: 'Plaza de Bolívar', type: 'Historia' },
    { lat: 4.6097, lng: -74.0817, name: 'Zona Rosa', type: 'Comercio' },
    { lat: 4.6486, lng: -74.0609, name: 'Parque 93', type: 'Parque' },
    { lat: 4.5981, lng: -74.0758, name: 'Centro Comercial Andino', type: 'Comercio' },
    { lat: 4.7595, lng: -74.0313, name: 'Usaquén', type: 'Turismo' },
    { lat: 4.6533, lng: -74.0836, name: 'Universidad Nacional', type: 'Educación' },
    { lat: 4.6682, lng: -74.0549, name: 'Parque Simón Bolívar', type: 'Parque' },
    { lat: 4.7011, lng: -74.0702, name: 'Museo del Oro', type: 'Cultura' },
    { lat: 4.6361, lng: -74.0835, name: 'Corferias', type: 'Centro de Convenciones' },
    { lat: 4.7004, lng: -74.0347, name: 'Cerro de Monserrate', type: 'Religioso' }
];

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Inicializar gestores
    mapManager = new MapManager('map', [6.2476, -75.5658], 13);
    treeVisualizer = new TreeVisualizer(mapManager);
    metricsPanel = new MetricsPanel();

    // Configurar callback de polígonos dibujados
    mapManager.onPolygonDrawn = handlePolygonDrawn;
    mapManager.onPolygonDeleted = handlePolygonDeleted;

    // Inicializar estructura por defecto
    buildStructure('kdtree');
    metricsPanel.updateStructureInfo('kdtree');
    document.getElementById('metricStructure').textContent = 'KD-Tree (k-dimensional)';

    console.log('✅ GeoIndex Explorer inicializado correctamente');
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Selector de estructura
    document.getElementById('structureSelector').addEventListener('change', function(e) {
        currentStructureType = e.target.value;
        metricsPanel.updateStructureInfo(currentStructureType);
        document.getElementById('metricStructure').textContent = this.options[this.selectedIndex].text;
        
        if (dataPoints.length > 0) {
            buildStructure(currentStructureType);
            treeVisualizer.visualize(currentStructure, currentStructureType);
        }
    });

    // Botones de carga de datos
    document.getElementById('loadMedellin').addEventListener('click', () => loadCityData(medellinPOIs, 'Medellín'));
    document.getElementById('loadBogota').addEventListener('click', () => loadCityData(bogotaPOIs, 'Bogotá'));
    document.getElementById('loadRandom').addEventListener('click', loadRandomData);
    document.getElementById('clearData').addEventListener('click', clearAllData);

    // Botones de tipo de consulta
    document.getElementById('rangeQuery').addEventListener('click', () => selectQueryType('range'));
    document.getElementById('knnQuery').addEventListener('click', () => selectQueryType('knn'));
    document.getElementById('polygonQuery').addEventListener('click', () => selectQueryType('polygon'));
    document.getElementById('windowQuery').addEventListener('click', () => selectQueryType('window'));

    // Botón de ejecutar consulta
    document.getElementById('executeQuery').addEventListener('click', executeQuery);

    // Botón de exportar resultados
    document.getElementById('exportResults').addEventListener('click', exportResults);
}

// ========== CONSTRUCCIÓN DE ESTRUCTURAS ==========
function buildStructure(structureType) {
    const bounds = mapManager.getBounds();

    switch (structureType) {
        case 'kdtree':
            currentStructure = new KDTree(dataPoints);
            rangeQuery = new RangeQuery(currentStructure);
            knnQuery = new NearestNeighborQuery(currentStructure);
            break;

        case 'quadtree':
            currentStructure = new Quadtree(bounds, 4, 8);
            dataPoints.forEach(point => currentStructure.insert(point));
            rangeQuery = new RangeQuery(currentStructure);
            knnQuery = new NearestNeighborQuery(currentStructure);
            break;

        case 'gridfile':
            currentStructure = new GridFile(bounds, 4, 10);
            dataPoints.forEach(point => currentStructure.insert(point));
            rangeQuery = new RangeQuery(currentStructure);
            knnQuery = new NearestNeighborQuery(currentStructure);
            break;

        case 'rtree':
            currentStructure = new RTree(9, 4);
            dataPoints.forEach(point => currentStructure.insert(point));
            rangeQuery = new RangeQuery(currentStructure);
            knnQuery = new NearestNeighborQuery(currentStructure);
            polygonQuery = new PolygonIntersectionQuery(currentStructure);
            break;
    }

    console.log(`✅ Estructura ${structureType} construida con ${dataPoints.length} puntos`);
}

// ========== CARGA DE DATOS ==========
function loadCityData(cityData, cityName) {
    dataPoints = [...cityData];
    
    // Mostrar puntos en el mapa
    mapManager.addDataPoints(dataPoints);
    
    // Construir estructura
    buildStructure(currentStructureType);
    
    // Visualizar estructura
    treeVisualizer.visualize(currentStructure, currentStructureType);
    
    // Actualizar métricas
    metricsPanel.updateDataInfo(`✅ ${cityName} cargado: ${cityData.length} puntos de interés (OSM)`);
    metricsPanel.updateMetrics({
        pointsCount: dataPoints.length,
        nodesVisited: 0,
        time: 0,
        resultsCount: 0
    });

    console.log(`✅ Cargados ${cityData.length} puntos de ${cityName}`);
}

function loadRandomData() {
    const count = parseInt(document.getElementById('pointCount').value) || 50;
    const bounds = mapManager.getBounds();
    
    dataPoints = RandomDataGenerator.generateUniformPoints(count, bounds);
    
    // Mostrar puntos en el mapa
    mapManager.addDataPoints(dataPoints);
    
    // Construir estructura
    buildStructure(currentStructureType);
    
    // Visualizar estructura
    treeVisualizer.visualize(currentStructure, currentStructureType);
    
    // Actualizar métricas
    metricsPanel.updateDataInfo(`✅ ${count} puntos aleatorios generados`);
    metricsPanel.updateMetrics({
        pointsCount: dataPoints.length,
        nodesVisited: 0,
        time: 0,
        resultsCount: 0
    });

    console.log(`✅ Generados ${count} puntos aleatorios`);
}

function clearAllData() {
    dataPoints = [];
    currentStructure = null;
    
    mapManager.clearAll();
    treeVisualizer.clear();
    metricsPanel.resetMetrics();
    metricsPanel.updateDataInfo('No hay datos cargados');
    metricsPanel.clearQueryStatus();
    
    selectedQueryType = null;
    document.querySelectorAll('.query-btn').forEach(btn => {
        btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    });

    console.log('✅ Datos limpiados');
}

// ========== SELECCIÓN DE TIPO DE CONSULTA ==========
function selectQueryType(type) {
    selectedQueryType = type;
    
    // Actualizar estilos de botones
    document.querySelectorAll('.query-btn').forEach(btn => {
        btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    });
    event.target.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    
    // Actualizar estado
    const queryNames = {
        range: 'Consulta de Rango Circular',
        knn: 'K-Vecinos Más Cercanos',
        polygon: 'Intersección de Polígono',
        window: 'Ventana Rectangular'
    };
    
    metricsPanel.updateQueryStatus(`✓ ${queryNames[type]} seleccionada`, true);

    // Habilitar/deshabilitar control de dibujo
    if (type === 'polygon') {
        mapManager.enableDrawing();
        metricsPanel.updateQueryStatus(`✓ ${queryNames[type]} - Dibuje un polígono en el mapa`, true);
    } else {
        mapManager.disableDrawing();
    }

    console.log(`✅ Tipo de consulta seleccionado: ${type}`);
}

// ========== EJECUCIÓN DE CONSULTAS ==========
function executeQuery() {
    if (!selectedQueryType) {
        alert('⚠️ Por favor seleccione un tipo de consulta primero');
        return;
    }

    if (dataPoints.length === 0) {
        alert('⚠️ Por favor cargue datos primero');
        return;
    }

    mapManager.clearQueryLayers();

    const timer = new Timer('Query Execution');
    timer.start();

    let result;

    try {
        switch (selectedQueryType) {
            case 'range':
                result = executeRangeQuery();
                break;
            case 'knn':
                result = executeKNNQuery();
                break;
            case 'polygon':
                result = executePolygonQuery();
                break;
            case 'window':
                result = executeWindowQuery();
                break;
        }

        timer.stop();

        if (result) {
            // Actualizar métricas
            const metrics = {
                pointsCount: dataPoints.length,
                nodesVisited: result.metrics.nodesVisited,
                time: result.metrics.time,
                resultsCount: result.results.length,
                loadFactor: currentStructure.getLoadFactor ? currentStructure.getLoadFactor() + '%' : 'N/A'
            };

            metricsPanel.updateMetrics(metrics);
            metricsPanel.updateComparison(currentStructureType, result.metrics.time, dataPoints.length);

            console.log(`✅ Consulta ejecutada en ${result.metrics.time.toFixed(2)}ms - ${result.results.length} resultados`);
        }
    } catch (error) {
        console.error('❌ Error ejecutando consulta:', error);
        alert('Error ejecutando la consulta: ' + error.message);
    }
}

function executeRangeQuery() {
    const center = mapManager.getCenter();
    const radius = parseFloat(document.getElementById('searchRadius').value) / 111320 || 0.018;

    const result = rangeQuery.executeWithVisualization(center, radius, mapManager.map);
    
    mapManager.addQueryLayers(result.layers);
    
    return result;
}

function executeKNNQuery() {
    const center = mapManager.getCenter();
    const k = parseInt(document.getElementById('kValue').value) || 5;

    const result = knnQuery.executeWithVisualization(center, k, mapManager.map);
    
    mapManager.addQueryLayers(result.layers);
    
    return result;
}

function executePolygonQuery() {
    const drawnLayers = mapManager.drawnItems.getLayers();
    
    if (drawnLayers.length === 0) {
        alert('⚠️ Por favor dibuje un polígono en el mapa primero');
        return null;
    }

    const layer = drawnLayers[drawnLayers.length - 1];
    const latlngs = layer.getLatLngs()[0];
    const polygon = latlngs.map(ll => ({ lat: ll.lat, lng: ll.lng }));

    if (!polygonQuery) {
        polygonQuery = new PolygonIntersectionQuery(currentStructure);
    }

    const result = polygonQuery.executeWithVisualization(polygon, mapManager.map);
    
    // Limpiar capas anteriores excepto el polígono dibujado
    mapManager.clearQueryLayers();
    result.layers.slice(1).forEach(layer => mapManager.addQueryLayers([layer]));
    
    return result;
}

function executeWindowQuery() {
    const center = mapManager.getCenter();
    const bounds = mapManager.getBounds();
    const latDiff = (bounds.maxLat - bounds.minLat) * 0.3;
    const lngDiff = (bounds.maxLng - bounds.minLng) * 0.3;

    const queryBounds = {
        minLat: center.lat - latDiff / 2,
        maxLat: center.lat + latDiff / 2,
        minLng: center.lng - lngDiff / 2,
        maxLng: center.lng + lngDiff / 2
    };

    const timer = new Timer('Window Query');
    timer.start();

    const results = currentStructure.windowQuery(queryBounds);
    const nodesVisited = currentStructure.getNodesVisited();

    timer.stop();

    mapManager.showWindowQuery(queryBounds, results.map(r => ({ point: r })));

    return {
        results: results,
        metrics: {
            time: timer.getElapsedTime(),
            nodesVisited: nodesVisited,
            resultsCount: results.length
        }
    };
}

// ========== MANEJO DE POLÍGONOS DIBUJADOS ==========
function handlePolygonDrawn(polygon) {
    console.log('Polígono dibujado:', polygon);
    if (selectedQueryType === 'polygon') {
        metricsPanel.updateQueryStatus('✓ Polígono dibujado - Presione "Ejecutar Consulta"', true);
    }
}

function handlePolygonDeleted() {
    console.log('Polígono eliminado');
    mapManager.clearQueryLayers();
}

// ========== EXPORTACIÓN DE RESULTADOS ==========
function exportResults() {
    const report = metricsPanel.generatePerformanceReport();
    
    // Agregar información adicional
    report.structure = currentStructureType;
    report.dataPoints = dataPoints.length;
    report.lastQuery = selectedQueryType;

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geoindex_results_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('✅ Resultados exportados exitosamente');
    console.log('✅ Resultados exportados');
}

// ========== UTILIDADES ==========
console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║        🗺️  GeoIndex Explorer v1.0                   ║
║                                                      ║
║   Comparativa Visual e Interactiva de               ║
║   Índices Espaciales Multidimensionales             ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
`);