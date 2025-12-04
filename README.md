# Rojeru TableSorter Lite

Versión gratuita y ligera de Rojeru TableSorter - Una librería JavaScript para crear tablas HTML dinámicas con ordenamiento, filtrado y paginación.

## Características

- ✅ Ordenamiento por columnas (ascendente/descendente)
- ✅ Filtrado por columnas (texto y select)
- ✅ Búsqueda global en toda la tabla
- ✅ Paginación con navegación completa
- ✅ Vista responsiva (modo tarjeta en móviles)
- ✅ Sin dependencias externas
- ✅ Peso ligero (~25KB minificado)
- ✅ Compatible con todos los navegadores modernos
- ✅ API simple y documentada

## Instalación

### NPM
```bash
npm install rojeru-tablesorter-lite
```
## CDN
```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rojeru-tablesorter-lite@latest/rojeru-tablesorter-lite.min.css">

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/rojeru-tablesorter-lite@latest/rojeru-tablesorter-lite.min.js"></script>

<!-- Font Awesome (opcional, para íconos) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
```
## Uso básico
```html
<div id="miTabla"></div>
// Inicializar con datos
const tabla = new RojeruTableSorterLite('miTabla', {
data: [
{ id: 1, nombre: 'Juan', edad: 25, ciudad: 'Madrid' },
{ id: 2, nombre: 'Ana', edad: 30, ciudad: 'Barcelona' },
{ id: 3, nombre: 'Carlos', edad: 22, ciudad: 'Valencia' }
],
columns: [
{ key: 'id', title: 'ID', sortable: true },
{ key: 'nombre', title: 'Nombre', sortable: true },
{ key: 'edad', title: 'Edad', sortable: true },
{ key: 'ciudad', title: 'Ciudad', sortable: true }
],
rowsPerPage: 10,
showSearch: true,
locale: 'es' // o 'en'
});
```
## Configuración de columnas
Cada columna puede tener estas propiedades:
```javascript
{
    key: 'id',                  // Clave única (requerido)
    title: 'ID',               // Título de la columna
    width: '100px',           // Ancho fijo (opcional)
    sortable: true,           // Permitir ordenamiento
    filtrable: true,          // Permitir filtrado
    selectOptions: [          // Opciones para select (opcional)
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' }
    ],
    render: (value, row) => { // Función de renderizado (opcional)
        return `<strong>${value}</strong>`;
    }
}
```
## Métodos de la API
```javascript
// Obtener datos filtrados actuales
const datos = tabla.getSelectedData();

// Obtener datos de la página actual
const paginaActual = tabla.getCurrentPageData();

// Cambiar a página específica
tabla.setCurrentPage(2);

// Cambiar registros por página
tabla.setRowsPerPage(25);

// Agregar nueva fila
tabla.addRow({ id: 4, nombre: 'Laura', edad: 28, ciudad: 'Sevilla' });

// Eliminar fila por índice
tabla.removeRow(0);

// Limpiar todos los filtros
tabla.clearFilters();

// Actualizar datos
tabla.setData(nuevosDatos);

// Refrescar tabla
tabla.refresh();

// Destruir instancia
tabla.destroy();
```
## Eventos personalizados
La tabla emite eventos que puedes escuchar:
```javascript
document.getElementById('miTabla').addEventListener('rojeru-table-updated', (e) => {
    console.log('Tabla actualizada:', e.detail);
});

document.getElementById('miTabla').addEventListener('rojeru-page-changed', (e) => {
    console.log('Página cambiada:', e.detail.page);
});
```
## Ejemplos avanzados
```javascript
const tabla = new RojeruTableSorterLite('miTabla', {
    data: productos,
    columns: [
        { 
            key: 'nombre', 
            title: 'Producto',
            render: (value, row) => {
                return `<div class="producto">
                    <strong>${value}</strong><br>
                    <small>${row.categoria}</small>
                </div>`;
            }
        },
        { 
            key: 'precio', 
            title: 'Precio',
            render: (value) => {
                return `$${value.toFixed(2)}`;
            }
        },
        { 
            key: 'estado', 
            title: 'Estado',
            selectOptions: [
                { value: 'disponible', label: '🟢 Disponible' },
                { value: 'agotado', label: '🔴 Agotado' },
                { value: 'reservado', label: '🟡 Reservado' }
            ]
        }
    ]
});
```
## Con datos dinámicos desde API
```javascript
// Cargar datos desde API
fetch('https://api.ejemplo.com/datos')
    .then(response => response.json())
    .then(data => {
        const tabla = new RojeruTableSorterLite('miTabla', {
            data: data,
            columns: [
                { key: 'id', title: 'ID' },
                { key: 'nombre', title: 'Nombre' },
                { key: 'email', title: 'Email' },
                { key: 'fecha', title: 'Fecha' }
            ]
        });
        
        // Guardar referencia para usar la API después
        window.miTabla = tabla;
    });
```
## Soporte móvil
En dispositivos móviles, la tabla se convierte automáticamente en vista de tarjetas:
Cada fila se muestra como una tarjeta
Los encabezados se ocultan
Los datos se organizan verticalmente
Los filtros se mantienen funcionales
## Personalización CSS
Puedes sobrescribir los estilos CSS:
```css
/* Cambiar colores */
.rojeru-tablesorter-contenedor {
    --primary-color: #4f46e5;
    --hover-color: #f3f4f6;
}

/* Estilos personalizados */
.rojeru-tablesorter th {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.rojeru-boton-celda {
    background: var(--primary-color);
    color: white;
}
```

## Vanilla JavaScript (Sin framework)
```javascript
// Funciona directamente
const tabla = new RojeruTableSorterLite('miTabla', options);
```

## React
```javascript
import { useEffect, useRef } from 'react';
import 'rojeru-tablesorter-lite/dist/rojeru-tablesorter-lite.css';

function MiTablaComponent() {
    const tableRef = useRef(null);
    const tablaInstance = useRef(null);

    useEffect(() => {
        // Crear contenedor si no existe
        if (!document.getElementById('mi-tabla-react')) {
            const div = document.createElement('div');
            div.id = 'mi-tabla-react';
            tableRef.current.appendChild(div);
        }

        // Inicializar tabla
        tablaInstance.current = new window.RojeruTableSorterLite('mi-tabla-react', {
            data: datos,
            columns: columnas
        });

        return () => {
            // Limpiar al desmontar
            if (tablaInstance.current) {
                tablaInstance.current.destroy();
            }
        };
    }, []);

    return <div ref={tableRef} />;
}
```
## Versión mejorada para React con hooks:
```javascript
import { useEffect, useRef, useState } from 'react';
import RojeruTableSorterLite from 'rojeru-tablesorter-lite';
import 'rojeru-tablesorter-lite/dist/rojeru-tablesorter-lite.css';

function RojeruTable({ data, columns, options = {} }) {
    const containerRef = useRef(null);
    const [tableId] = useState(`rojeru-table-${Math.random().toString(36).substr(2, 9)}`);
    const instanceRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Configuración completa
        const config = {
            data,
            columns,
            rowsPerPage: 10,
            showSearch: true,
            ...options
        };

        // Inicializar tabla
        instanceRef.current = new RojeruTableSorterLite(tableId, config);

        return () => {
            if (instanceRef.current) {
                instanceRef.current.destroy();
            }
        };
    }, [tableId]);

    // Actualizar datos cuando cambien
    useEffect(() => {
        if (instanceRef.current && data) {
            instanceRef.current.setData(data);
        }
    }, [data]);

    return <div id={tableId} ref={containerRef} />;
}
```
## Vue 2/Vue 3
```vue
<template>
  <div>
    <div :id="tableId" ref="tableContainer"></div>
  </div>
</template>

<script>
import RojeruTableSorterLite from 'rojeru-tablesorter-lite';
import 'rojeru-tablesorter-lite/dist/rojeru-tablesorter-lite.css';

export default {
  name: 'RojeruTable',
  props: {
    data: Array,
    columns: Array,
    options: Object
  },
  data() {
    return {
      tableId: `rojeru-table-${Date.now()}`,
      instance: null
    };
  },
  mounted() {
    this.initTable();
  },
  beforeDestroy() {
    this.destroyTable();
  },
  watch: {
    data: {
      handler(newData) {
        if (this.instance) {
          this.instance.setData(newData);
        }
      },
      deep: true
    }
  },
  methods: {
    initTable() {
      const config = {
        data: this.data,
        columns: this.columns,
        rowsPerPage: 10,
        showSearch: true,
        ...this.options
      };

      this.instance = new RojeruTableSorterLite(this.tableId, config);
    },
    destroyTable() {
      if (this.instance) {
        this.instance.destroy();
        this.instance = null;
      }
    },
    // Métodos expuestos
    refresh() {
      if (this.instance) this.instance.refresh();
    },
    clearFilters() {
      if (this.instance) this.instance.clearFilters();
    }
  }
};
</script>
```
## Angular
```javascript
// rojeru-table.component.ts
import { Component, Input, OnChanges, OnDestroy, ElementRef, SimpleChanges } from '@angular/core';
import * as RojeruTableSorterLite from 'rojeru-tablesorter-lite';
import 'rojeru-tablesorter-lite/dist/rojeru-tablesorter-lite.css';

declare var RojeruTableSorterLite: any;

@Component({
  selector: 'app-rojeru-table',
  template: '<div [id]="tableId"></div>',
  styleUrls: ['./rojeru-table.component.css']
})
export class RojeruTableComponent implements OnChanges, OnDestroy {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() options: any = {};

  tableId: string = `rojeru-table-${Math.random().toString(36).substr(2, 9)}`;
  private instance: any;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.initTable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && this.instance) {
      this.instance.setData(this.data);
    }
  }

  ngOnDestroy() {
    this.destroyTable();
  }

  private initTable() {
    const config = {
      data: this.data,
      columns: this.columns,
      rowsPerPage: 10,
      showSearch: true,
      ...this.options
    };

    this.instance = new RojeruTableSorterLite(this.tableId, config);
  }

  private destroyTable() {
    if (this.instance) {
      this.instance.destroy();
    }
  }

  // Métodos públicos
  public refresh(): void {
    if (this.instance) this.instance.refresh();
  }

  public clearFilters(): void {
    if (this.instance) this.instance.clearFilters();
  }
}
```
## jQuery (si aún se usa)
```javascript
// Plugin wrapper para jQuery
(function($) {
  $.fn.rojeruTable = function(options) {
    return this.each(function() {
      const id = $(this).attr('id') || `rojeru-${Math.random().toString(36).substr(2, 9)}`;
      $(this).attr('id', id);
      
      const instance = new RojeruTableSorterLite(id, options);
      
      // Guardar referencia
      $(this).data('rojeru-instance', instance);
    });
  };
  
  // Métodos
  $.fn.rojeruTableMethod = function(method, ...args) {
    const instance = $(this).data('rojeru-instance');
    if (instance && typeof instance[method] === 'function') {
      return instance[method](...args);
    }
  };
})(jQuery);

// Uso
$('#miTabla').rojeruTable({
  data: datos,
  columns: columnas
});

// Llamar métodos
$('#miTabla').rojeruTableMethod('refresh');
$('#miTabla').rojeruTableMethod('clearFilters');
```

# Comparación entre versión Lite y Pro

| Característica      | Lite | Pro |
|---------------------|------|-----|
| Ordenamiento        | ✅   | ✅  |
| Filtrado básico     | ✅   | ✅  |
| Paginación          | ✅   | ✅  |
| Búsqueda global     | ✅   | ✅  |
| Vista móvil         | ✅   | ✅  |
| Exportar Excel/PDF  | ❌   | ✅  |
| Selección múltiple  | ❌   | ✅  |
| Scroll infinito     | ❌   | ✅  |
| Filtros de fecha    | ❌   | ✅  |
| Modo servidor       | ❌   | ✅  |
| Hooks/eventos       | Básicos | Avanzados |
| Imágenes/badges     | ❌   | ✅  |
| Modo oscuro         | ❌   | ✅  |