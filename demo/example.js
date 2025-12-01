// Datos de ejemplo para la demo
const ciudades = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Bilbao', 'Alicante'];

const datosEjemplo = [
    { id: 1, nombre: 'Juan Pérez', edad: 25, ciudad: 'Madrid', estado: 'activo' },
    { id: 2, nombre: 'Ana García', edad: 30, ciudad: 'Barcelona', estado: 'activo' },
    { id: 3, nombre: 'Carlos López', edad: 22, ciudad: 'Valencia', estado: 'inactivo' },
    { id: 4, nombre: 'María Rodríguez', edad: 28, ciudad: 'Sevilla', estado: 'activo' },
    { id: 5, nombre: 'Pedro Sánchez', edad: 35, ciudad: 'Zaragoza', estado: 'activo' },
    { id: 6, nombre: 'Laura Martínez', edad: 26, ciudad: 'Málaga', estado: 'inactivo' },
    { id: 7, nombre: 'David Fernández', edad: 32, ciudad: 'Murcia', estado: 'activo' },
    { id: 8, nombre: 'Sofía Gómez', edad: 29, ciudad: 'Palma', estado: 'activo' },
    { id: 9, nombre: 'Javier Ruiz', edad: 31, ciudad: 'Bilbao', estado: 'inactivo' },
    { id: 10, nombre: 'Elena Díaz', edad: 27, ciudad: 'Alicante', estado: 'activo' },
    { id: 11, nombre: 'Miguel Torres', edad: 24, ciudad: 'Madrid', estado: 'activo' },
    { id: 12, nombre: 'Isabel Castro', edad: 33, ciudad: 'Barcelona', estado: 'inactivo' },
    { id: 13, nombre: 'Francisco Romero', edad: 40, ciudad: 'Valencia', estado: 'activo' },
    { id: 14, nombre: 'Carmen Vargas', edad: 26, ciudad: 'Sevilla', estado: 'activo' },
    { id: 15, nombre: 'Raúl Navarro', edad: 38, ciudad: 'Zaragoza', estado: 'inactivo' }
];

// Inicializar tabla
const tabla = new RojeruTableSorterLite('demoTable', {
    data: datosEjemplo,
    columns: [
        {
            key: 'id',
            title: 'ID',
            sortable: true,
            width: '80px'
        },
        {
            key: 'nombre',
            title: 'Nombre completo',
            sortable: true,
            render: (value, row) => {
                return `<div>
                    <strong>${value}</strong><br>
                    <small style="color: #666;">ID: ${row.id}</small>
                </div>`;
            }
        },
        {
            key: 'edad',
            title: 'Edad',
            sortable: true,
            render: (value) => {
                let color = '#10b981'; // verde
                if (value < 25) color = '#ef4444'; // rojo
                if (value > 35) color = '#f59e0b'; // amarillo
                return `<span style="color: ${color}; font-weight: bold;">${value} años</span>`;
            }
        },
        {
            key: 'ciudad',
            title: 'Ciudad',
            sortable: true,
            filtrable: true
        },
        {
            key: 'estado',
            title: 'Estado',
            sortable: true,
            selectOptions: [
                { value: 'activo', label: '🟢 Activo' },
                { value: 'inactivo', label: '🔴 Inactivo' }
            ],
            render: (value) => {
                return value === 'activo'
                    ? '<span style="color: #10b981; font-weight: bold;">🟢 Activo</span>'
                    : '<span style="color: #ef4444; font-weight: bold;">🔴 Inactivo</span>';
            }
        }
    ],
    rowsPerPage: 10,
    showSearch: true,
    locale: 'es'
});

// Controles de demostración
document.getElementById('btnAdd').addEventListener('click', () => {
    const nuevoId = tabla.getTotalRecords() + 1;
    const nombres = ['Alex', 'Beatriz', 'Daniel', 'Eva', 'Fernando', 'Gabriela', 'Héctor', 'Irene', 'Jorge'];

    tabla.addRow({
        id: nuevoId,
        nombre: nombres[Math.floor(Math.random() * nombres.length)] + ' ' + ['González', 'Silva', 'Mendoza', 'Rojas', 'Vega'][Math.floor(Math.random() * 5)],
        edad: Math.floor(Math.random() * 40) + 18,
        ciudad: ciudades[Math.floor(Math.random() * ciudades.length)],
        estado: Math.random() > 0.3 ? 'activo' : 'inactivo'
    });

    // Mostrar notificación
    const toast = document.createElement('div');
    toast.textContent = `✅ Fila agregada correctamente (ID: ${nuevoId})`;
    toast.style.cssText = 'position:fixed; top:20px; right:20px; background:#10b981; color:white; padding:10px 16px; border-radius:6px; z-index:10000;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
});

document.getElementById('btnRemove').addEventListener('click', () => {
    const datosActuales = tabla.getCurrentPageData();
    if (datosActuales.length > 0) {
        tabla.removeRow(0);

        const toast = document.createElement('div');
        toast.textContent = '🗑️ Primera fila eliminada';
        toast.style.cssText = 'position:fixed; top:20px; right:20px; background:#ef4444; color:white; padding:10px 16px; border-radius:6px; z-index:10000;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
});

document.getElementById('btnClear').addEventListener('click', () => {
    tabla.clearFilters();

    const toast = document.createElement('div');
    toast.textContent = '🧹 Filtros limpiados';
    toast.style.cssText = 'position:fixed; top:20px; right:20px; background:#3b82f6; color:white; padding:10px 16px; border-radius:6px; z-index:10000;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
});

document.getElementById('btnRefresh').addEventListener('click', () => {
    tabla.refresh();

    const toast = document.createElement('div');
    toast.textContent = '🔄 Tabla actualizada';
    toast.style.cssText = 'position:fixed; top:20px; right:20px; background:#8b5cf6; color:white; padding:10px 16px; border-radius:6px; z-index:10000;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
});

document.getElementById('selectPageSize').addEventListener('change', (e) => {
    tabla.setRowsPerPage(parseInt(e.target.value));
});

// Escuchar eventos de la tabla
document.getElementById('demoTable').addEventListener('rojeru-table-updated', (e) => {
    console.log('Tabla actualizada:', {
        paginaActual: tabla.getCurrentPage(),
        totalRegistros: tabla.getTotalRecords(),
        filtros: Object.keys(tabla.filters).length
    });
});

// Mostrar información inicial en consola
console.log('=== Rojeru TableSorter Lite Demo ===');
console.log('Total de registros:', tabla.getTotalRecords());
console.log('Página actual:', tabla.getCurrentPage());
console.log('Usa los botones para interactuar con la tabla!');

// Exportar para usar en consola del navegador
window.demoTable = tabla;