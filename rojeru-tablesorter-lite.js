/*!
 * (c) 2025 Rogelio Urieta Camacho (RojeruSan)
 * Released under the MIT License
  * MIT License
 *
 * Copyright (c) 2025 Rogelio Urieta Camacho (RojeruSan)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? module.exports = factory()
        : typeof define === 'function' && define.amd
            ? define(factory)
            : (global.RojeruTableSorterLite = factory());
})(this, function () {
    'use strict';

    // ========== UTILIDADES BÁSICAS ==========
    const throttle = (func, delay) => {
        let timeout;
        return function (...args) {
            if (!timeout) {
                timeout = setTimeout(() => {
                    func.apply(this, args);
                    timeout = null;
                }, delay);
            }
        };
    };

    const crearToast = (mensaje, tipo = 'info') => {
        let contenedor = document.getElementById('rojeru-toasts');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'rojeru-toasts';
            contenedor.setAttribute('aria-live', 'polite');
            contenedor.setAttribute('aria-atomic', 'true');
            Object.assign(contenedor.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: '10000',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            });
            document.body.appendChild(contenedor);
        }
        const toast = document.createElement('div');
        toast.textContent = mensaje;
        toast.className = 'rojeru-toast';
        toast.setAttribute('role', 'alert');
        Object.assign(toast.style, {
            padding: '10px 16px',
            borderRadius: '6px',
            color: '#fff',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '300px',
            wordBreak: 'break-word',
            textAlign: 'center',
            backgroundColor: tipo === 'success' ? '#28a745' : '#17a2b8'
        });
        contenedor.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('salida');
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 300);
        }, 2000);
    };

    // ========== TRADUCCIONES BÁSICAS ==========
    const traduccionesPorDefecto = {
        es: {
            buscadorPlaceholder: 'Buscar en toda la tabla...',
            sinResultados: 'No se encontraron resultados',
            intentaOtrosTerminos: 'Intenta con otros términos o quita los filtros.',
            tablaVacia: 'La tabla está vacía.',
            cargando: 'Cargando datos...',
            todos: '<-- Todos -->',
            mostrarRegistros: (desde, hasta, total, filtrado) =>
                `Mostrando ${desde}–${hasta} de ${total} registros${filtrado ? ' (filtrados)' : ''}`,
            aceptar: 'Aceptar',
            cancelar: 'Cancelar',
            filtrar: 'Filtrar'
        },
        en: {
            buscadorPlaceholder: 'Search entire table...',
            sinResultados: 'No results found',
            intentaOtrosTerminos: 'Try different terms or clear filters.',
            tablaVacia: 'Table is empty.',
            cargando: 'Loading data...',
            todos: '<-- All -->',
            mostrarRegistros: (desde, hasta, total, filtrado) =>
                `Showing ${desde}–${hasta} of ${total} records${filtrado ? ' (filtered)' : ''}`,
            aceptar: 'Accept',
            cancelar: 'Cancel',
            filtrar: 'Filter'
        }
    };

    // ========== CLASE PRINCIPAL LITE ==========
    class RojeruTableSorterLite {
        /**
         * @param {string} containerId
         * @param {Object} options
         */
        constructor(containerId, options = {}) {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error(`Container with ID "${containerId}" not found.`);
                return;
            }

            this.options = this.normalizeOptions(options);
            this.filters = {};
            this.globalSearch = '';
            this.currentPage = 1;
            this.totalRecords = 0;
            this.fullData = [];
            this.filterCache = null;

            this.initialize();
        }

        normalizeOptions(options) {
            const merged = {
                data: [],
                columns: [],
                rowsPerPage: 10,
                sortBy: null,
                sortOrder: 'asc',
                showSearch: true,
                locale: 'es',
                translations: traduccionesPorDefecto,
                ...options
            };

            // Validar columnas
            merged.columns.forEach((col, i) => {
                if (!col.key) {
                    col.key = `col_${i}`;
                    console.warn(`Column ${i} missing "key", auto-assigned: ${col.key}`);
                }
                if (!col.title && !col.titulo) {
                    col.title = `Column ${i}`;
                    console.warn(`Column ${i} missing "title", auto-assigned: ${col.title}`);
                }
                if (col.titulo && !col.title) col.title = col.titulo;

                // Establecer valores por defecto
                col.sortable = col.sortable !== undefined ? col.sortable : true;
                col.filtrable = col.filtrable !== undefined ? col.filtrable : true;

                // Si tiene selectOptions, asegurar que sean correctos
                if (col.selectOptions || col.opcionesSelect) {
                    const optionsList = col.selectOptions || col.opcionesSelect;
                    if (!Array.isArray(optionsList)) {
                        console.warn(`Column ${col.key}: selectOptions should be an array`);
                        col.selectOptions = [];
                    } else {
                        // Normalizar opciones
                        col.selectOptions = optionsList.map(opt => {
                            if (typeof opt === 'string') {
                                return { value: opt, label: opt };
                            }
                            return opt;
                        });
                    }
                }
            });

            if (options.translations || options.traducciones) {
                const tr = options.translations || options.traducciones;
                merged.translations = {
                    ...traduccionesPorDefecto,
                    es: { ...traduccionesPorDefecto.es, ...tr.es },
                    en: { ...traduccionesPorDefecto.en, ...tr.en }
                };
            }

            return merged;
        }

        t(key, ...args) {
            const tr = this.options.translations[this.options.locale] || this.options.translations.es;
            const value = tr[key];
            if (typeof value === 'function') return value(...args);
            return value || `[${key}]`;
        }

        initialize() {
            this.renderStructure();
            this.loadData(this.options.data);
            window.addEventListener('resize', throttle(() => this.adjustWrapperHeight(), 300));
        }

        renderStructure() {
            let searchHTML = '';
            if (this.options.showSearch) {
                searchHTML = `<div class="rojeru-tablesorter-buscador">
                    <input type="text" placeholder="${this.t('buscadorPlaceholder')}" 
                           id="buscador-global-${this.container.id}" class="form-control">
                </div>`;
            }

            this.container.innerHTML = `
            <div class="rojeru-tablesorter-contenedor">
                <div class="rojeru-tablesorter-herramientas">
                    ${searchHTML}
                </div>
                <div class="rojeru-tablesorter-wrapper" id="wrapper-${this.container.id}">
                    <table class="rojeru-tablesorter" id="tabla-${this.container.id}">
                        <thead id="thead-${this.container.id}"></thead>
                        <tbody id="tbody-${this.container.id}"></tbody>
                    </table>
                </div>
                <div class="rojeru-tablesorter-paginacion">
                    <div class="rojeru-tablesorter-paginacion-info" id="info-paginacion-${this.container.id}"></div>
                    <div class="rojeru-tablesorter-paginacion-controles">
                        <div class="rojeru-tablesorter-paginacion-botones" id="botones-paginacion-${this.container.id}"></div>
                    </div>
                </div>
            </div>`;

            this.renderHeader();

            if (this.options.showSearch) {
                const searchInput = document.getElementById(`buscador-global-${this.container.id}`);
                if (searchInput) {
                    searchInput.value = this.globalSearch;
                    searchInput.addEventListener('input', throttle((e) => {
                        this.globalSearch = e.target.value.trim().toLowerCase();
                        this.currentPage = 1;
                        this.filterCache = null; // Invalidar cache
                        this.updateTable();
                    }, 300));
                }
            }

            this.adjustWrapperHeight();
        }

        adjustWrapperHeight() {
            const wrapper = document.getElementById(`wrapper-${this.container.id}`);
            if (!wrapper || window.innerWidth <= 768) return;

            const tools = this.container.querySelector('.rojeru-tablesorter-herramientas');
            const pagination = this.container.querySelector('.rojeru-tablesorter-paginacion');
            let subtractHeight = 200;

            if (tools) subtractHeight += tools.offsetHeight;
            if (pagination) subtractHeight += pagination.offsetHeight;

            wrapper.style.maxHeight = `calc(100vh - ${subtractHeight}px)`;
        }

        renderHeader() {
            const thead = document.getElementById(`thead-${this.container.id}`);
            thead.innerHTML = '';
            const tr = document.createElement('tr');

            this.options.columns.forEach(col => {
                const th = document.createElement('th');
                if (col.width || col.ancho) th.style.minWidth = col.width || col.ancho;

                const titleSpan = document.createElement('span');
                titleSpan.textContent = col.title || col.titulo;
                th.appendChild(titleSpan);

                // Ordenamiento
                const isSortable = col.sortable !== false;
                const sortSpan = document.createElement('span');
                sortSpan.className = 'rojeru-orden';
                if (!isSortable) {
                    sortSpan.classList.add('no-ordenable');
                }
                sortSpan.innerHTML = '<i class="fas fa-sort"></i>';

                if (isSortable) {
                    sortSpan.addEventListener('click', () => {
                        if (this.options.sortBy === col.key) {
                            this.options.sortOrder = this.options.sortOrder === 'asc' ? 'desc' : 'asc';
                        } else {
                            this.options.sortBy = col.key;
                            this.options.sortOrder = 'asc';
                        }
                        this.currentPage = 1;
                        this.filterCache = null; // Invalidar cache
                        this.updateTable();
                    });
                }
                th.appendChild(sortSpan);

                // Filtros
                const filterDiv = document.createElement('div');
                filterDiv.className = 'rojeru-filtro-container';

                const isFilterable = col.filtrable !== false;
                if (col.selectOptions || col.opcionesSelect) {
                    const optionsList = col.selectOptions || col.opcionesSelect;
                    if (optionsList && optionsList.length > 0) {
                        const select = document.createElement('select');
                        select.className = 'form-control rojeru-filtro-select';
                        select.dataset.colKey = col.key;
                        if (!isFilterable) select.disabled = true;

                        const defaultOption = document.createElement('option');
                        defaultOption.value = '';
                        defaultOption.textContent = this.t('todos');
                        select.appendChild(defaultOption);

                        optionsList.forEach(opt => {
                            const option = document.createElement('option');
                            option.value = String(opt.value);
                            option.textContent = opt.label || String(opt.value);
                            if (this.filters[col.key] === String(opt.value)) {
                                option.selected = true;
                            }
                            select.appendChild(option);
                        });

                        if (isFilterable) {
                            select.addEventListener('change', (e) => {
                                const value = e.target.value;
                                if (value) {
                                    this.filters[col.key] = value;
                                } else {
                                    delete this.filters[col.key];
                                }
                                this.currentPage = 1;
                                this.filterCache = null; // Invalidar cache
                                this.updateTable();
                            });
                        }
                        filterDiv.appendChild(select);
                    }
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form-control form-control-sm rojeru-filtro';
                    input.dataset.colKey = col.key;
                    input.placeholder = `${this.t('filtrar') || 'Filter'} ${col.title || col.titulo}`;
                    input.value = this.filters[col.key] || '';

                    if (!isFilterable) {
                        input.disabled = true;
                    } else {
                        input.addEventListener('input', throttle((e) => {
                            const value = e.target.value.trim();
                            if (value) {
                                this.filters[col.key] = value;
                            } else {
                                delete this.filters[col.key];
                            }
                            this.currentPage = 1;
                            this.filterCache = null; // Invalidar cache
                            this.updateTable();
                        }, 300));
                    }
                    filterDiv.appendChild(input);
                }
                th.appendChild(filterDiv);
                tr.appendChild(th);
            });

            thead.appendChild(tr);
            this.updateSortIcons();
        }

        updateSortIcons() {
            const thead = document.getElementById(`thead-${this.container.id}`);
            if (!thead) return;
            const spans = thead.querySelectorAll('.rojeru-orden');
            spans.forEach(span => {
                const th = span.closest('th');
                const columnIndex = Array.from(th.parentNode.children).indexOf(th);
                const col = this.options.columns[columnIndex];
                if (!col) return;

                const isSortable = col.sortable !== false;
                span.classList.remove('activo');
                span.innerHTML = '<i class="fas fa-sort"></i>';

                if (isSortable && this.options.sortBy === col.key) {
                    span.classList.add('activo');
                    span.innerHTML = this.options.sortOrder === 'asc'
                        ? '<i class="fas fa-sort-up"></i>'
                        : '<i class="fas fa-sort-down"></i>';
                }
            });
        }

        loadData(data) {
            this.fullData = Array.isArray(data) ? [...data] : [];
            this.filters = {};
            this.globalSearch = '';
            this.currentPage = 1;
            this.filterCache = null; // Invalidar cache

            // Limpiar inputs si existen
            const searchInput = document.getElementById(`buscador-global-${this.container.id}`);
            if (searchInput) searchInput.value = '';

            this.updateTable();
        }

        updateTable() {
            const filtered = this.getFilteredData();
            this.totalRecords = filtered.length;
            const realLimit = this.getRealLimit();
            const start = (this.currentPage - 1) * realLimit;
            const paginated = filtered.slice(start, start + realLimit);

            this.renderBody(paginated);
            this.renderPagination(this.totalRecords);
            this.updateSortIcons();
        }

        getFilteredData() {
            // Usar cache si está disponible
            if (this.filterCache) {
                return this.filterCache;
            }

            const searchColumns = this.options.columns.map(col => col.key);
            let filtered = this.fullData.filter(row => {
                // Búsqueda global
                if (this.globalSearch) {
                    const matchesGlobal = searchColumns.some(key => {
                        const value = row[key];
                        return value != null &&
                            String(value).toLowerCase().includes(this.globalSearch);
                    });
                    if (!matchesGlobal) return false;
                }

                // Filtros por columna
                for (const [colKey, filterValue] of Object.entries(this.filters)) {
                    if (!filterValue) continue;

                    const col = this.options.columns.find(c => c.key === colKey);
                    if (!col || col.filtrable === false) continue;

                    const cellValue = row[colKey];
                    const cellStr = cellValue != null ? String(cellValue) : '';
                    const filterStr = String(filterValue).toLowerCase();

                    // Para selects, comparación exacta (case-insensitive)
                    if (col.selectOptions || col.opcionesSelect) {
                        if (cellStr.toLowerCase() !== filterStr) {
                            return false;
                        }
                    } else {
                        // Para inputs de texto, búsqueda parcial
                        if (!cellStr.toLowerCase().includes(filterStr)) {
                            return false;
                        }
                    }
                }

                return true;
            });

            // Ordenamiento
            if (this.options.sortBy) {
                const col = this.options.columns.find(c => c.key === this.options.sortBy);
                if (col && col.sortable !== false) {
                    filtered.sort((a, b) => {
                        const key = this.options.sortBy;
                        const aVal = a[key] != null ? String(a[key]).toLowerCase() : '';
                        const bVal = b[key] != null ? String(b[key]).toLowerCase() : '';

                        if (aVal < bVal) return this.options.sortOrder === 'asc' ? -1 : 1;
                        if (aVal > bVal) return this.options.sortOrder === 'asc' ? 1 : -1;
                        return 0;
                    });
                }
            }

            // Guardar en cache
            this.filterCache = filtered;
            return filtered;
        }

        renderBody(data) {
            const tbody = document.getElementById(`tbody-${this.container.id}`);
            if (!tbody) return;

            if (data.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = this.options.columns.length;
                td.style.textAlign = 'center';
                td.style.padding = '2.5rem';
                td.style.color = '#6c757d';

                const message = this.globalSearch || Object.keys(this.filters).length > 0
                    ? this.t('intentaOtrosTerminos')
                    : this.t('tablaVacia');

                td.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                    <i class="fas fa-search fa-2x" style="color: #dee2e6;"></i>
                    <div>
                        <strong>${this.t('sinResultados')}</strong><br>
                        <small style="font-weight: normal;">${message}</small>
                    </div>
                </div>`;
                tr.appendChild(td);
                tbody.innerHTML = '';
                tbody.appendChild(tr);
                return;
            }

            const fragment = document.createDocumentFragment();
            const isMobile = window.innerWidth <= 768;

            data.forEach(row => {
                const tr = document.createElement('tr');

                if (isMobile) {
                    const td = document.createElement('td');
                    td.colSpan = this.options.columns.length;
                    const cardContainer = document.createElement('div');
                    cardContainer.className = 'rojeru-tarjeta-movil';

                    this.options.columns.forEach(col => {
                        const fieldDiv = document.createElement('div');
                        fieldDiv.className = 'rojeru-campo-movil';

                        const label = document.createElement('div');
                        label.className = 'rojeru-etiqueta-movil';
                        label.textContent = `${col.title || col.titulo}:`;

                        const valueDiv = document.createElement('div');
                        valueDiv.className = 'rojeru-valor-movil';
                        const value = row[col.key];

                        if (typeof col.render === 'function') {
                            const rendered = col.render(value, row);
                            if (typeof rendered === 'string') {
                                valueDiv.innerHTML = rendered;
                            } else if (rendered instanceof HTMLElement) {
                                valueDiv.appendChild(rendered);
                            } else {
                                valueDiv.textContent = rendered ?? '';
                            }
                        } else {
                            valueDiv.textContent = value ?? '';
                        }

                        // Resaltar búsqueda
                        if (this.globalSearch) {
                            this.highlightText(valueDiv, this.globalSearch);
                        }

                        fieldDiv.appendChild(label);
                        fieldDiv.appendChild(valueDiv);
                        cardContainer.appendChild(fieldDiv);
                    });

                    td.appendChild(cardContainer);
                    tr.appendChild(td);
                } else {
                    this.options.columns.forEach(col => {
                        const td = document.createElement('td');
                        td.setAttribute('data-title', col.title || col.titulo);
                        Object.assign(td.style, {
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                            verticalAlign: 'top',
                            padding: '0.5rem'
                        });

                        const value = row[col.key];
                        let text = value ?? '';

                        if (typeof col.render === 'function') {
                            const rendered = col.render(value, row);
                            if (typeof rendered === 'string') {
                                td.innerHTML = rendered;
                            } else if (rendered instanceof HTMLElement) {
                                td.appendChild(rendered);
                            } else {
                                td.textContent = rendered ?? '';
                            }
                        } else {
                            td.textContent = text;
                        }

                        // Resaltar búsqueda
                        if (this.globalSearch) {
                            this.highlightText(td, this.globalSearch);
                        }

                        tr.appendChild(td);
                    });
                }

                fragment.appendChild(tr);
            });

            tbody.innerHTML = '';
            tbody.appendChild(fragment);
        }

        highlightText(element, searchText) {
            const text = element.textContent;
            if (!text || !searchText) return;
            const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            const parts = text.split(regex);
            if (parts.length <= 1) return;

            element.innerHTML = '';
            parts.forEach(part => {
                if (part.toLowerCase() === searchText.toLowerCase()) {
                    const mark = document.createElement('mark');
                    mark.style.background = '#fff3cd';
                    mark.style.color = '#856404';
                    mark.textContent = part;
                    element.appendChild(mark);
                } else {
                    element.appendChild(document.createTextNode(part));
                }
            });
        }

        renderPagination(total) {
            const info = document.getElementById(`info-paginacion-${this.container.id}`);
            const buttons = document.getElementById(`botones-paginacion-${this.container.id}`);
            if (!info || !buttons) return;

            const realLimit = this.getRealLimit();
            const from = total === 0 ? 0 : (this.currentPage - 1) * realLimit + 1;
            const to = Math.min(this.currentPage * realLimit, total);
            const totalPages = Math.ceil(total / realLimit);
            const filtered = this.globalSearch || Object.keys(this.filters).length > 0;

            info.textContent = this.t('mostrarRegistros', from, to, total, filtered);
            info.className = 'card-title pagedisplay';
            buttons.innerHTML = '';

            // Botón Primera Página
            const firstBtn = document.createElement('button');
            firstBtn.type = 'button';
            firstBtn.className = `btn btn-sm btn-primary rojeru-boton-celda first${this.currentPage === 1 ? ' disabled' : ''}`;
            firstBtn.innerHTML = '<i class="fas fa-angle-double-left"></i>';
            firstBtn.disabled = this.currentPage === 1;
            if (this.currentPage > 1) {
                firstBtn.addEventListener('click', () => {
                    this.currentPage = 1;
                    this.updateTable();
                });
            }

            // Botón Página Anterior
            const prevBtn = document.createElement('button');
            prevBtn.type = 'button';
            prevBtn.className = `btn btn-sm btn-primary rojeru-boton-celda prev${this.currentPage === 1 ? ' disabled' : ''}`;
            prevBtn.innerHTML = '<i class="fas fa-angle-left"></i>';
            prevBtn.disabled = this.currentPage === 1;
            if (this.currentPage > 1) {
                prevBtn.addEventListener('click', () => {
                    this.currentPage--;
                    this.updateTable();
                });
            }

            // Selector de página
            const pageSelect = document.createElement('select');
            pageSelect.className = 'form-control form-control-sm custom-select px-4 mx-1 rojeru-boton-celda pagenum';
            pageSelect.disabled = totalPages <= 1;
            for (let i = 1; i <= totalPages; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                option.selected = i === this.currentPage;
                pageSelect.appendChild(option);
            }
            pageSelect.addEventListener('change', (e) => {
                const newPage = parseInt(e.target.value, 10);
                if (!isNaN(newPage) && newPage !== this.currentPage) {
                    this.currentPage = newPage;
                    this.updateTable();
                }
            });

            // Botón Página Siguiente
            const nextBtn = document.createElement('button');
            nextBtn.type = 'button';
            nextBtn.className = `btn btn-sm btn-primary rojeru-boton-celda next${this.currentPage === totalPages || total === 0 ? ' disabled' : ''}`;
            nextBtn.innerHTML = '<i class="fas fa-angle-right"></i>';
            nextBtn.disabled = this.currentPage === totalPages || total === 0;
            if (this.currentPage < totalPages && total > 0) {
                nextBtn.addEventListener('click', () => {
                    this.currentPage++;
                    this.updateTable();
                });
            }

            // Botón Última Página
            const lastBtn = document.createElement('button');
            lastBtn.type = 'button';
            lastBtn.className = `btn btn-sm btn-primary rojeru-boton-celda last${this.currentPage === totalPages || total === 0 ? ' disabled' : ''}`;
            lastBtn.innerHTML = '<i class="fas fa-angle-double-right"></i>';
            lastBtn.disabled = this.currentPage === totalPages || total === 0;
            if (this.currentPage < totalPages && total > 0) {
                lastBtn.addEventListener('click', () => {
                    this.currentPage = totalPages;
                    this.updateTable();
                });
            }

            // Selector de registros por página
            const sizeSelect = document.createElement('select');
            sizeSelect.className = 'form-control form-control-sm custom-select rojeru-boton-celda px-1 pagesize';
            const sizeOptions = [
                { value: 10, text: '10' },
                { value: 25, text: '25' },
                { value: 50, text: '50' },
                { value: 100, text: '100' }
            ];
            sizeOptions.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.text;
                option.selected = opt.value === this.options.rowsPerPage;
                sizeSelect.appendChild(option);
            });
            sizeSelect.addEventListener('change', (e) => {
                this.options.rowsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.filterCache = null; // Invalidar cache
                this.updateTable();
            });

            buttons.style.display = 'flex';
            buttons.style.alignItems = 'center';
            buttons.style.gap = '0.5rem';
            buttons.appendChild(firstBtn);
            buttons.appendChild(prevBtn);
            buttons.appendChild(pageSelect);
            buttons.appendChild(nextBtn);
            buttons.appendChild(lastBtn);
            buttons.appendChild(sizeSelect);
        }

        getRealLimit() {
            return parseInt(this.options.rowsPerPage) || 10;
        }

        // Métodos públicos
        destroy() {
            window.removeEventListener('resize', this.adjustWrapperHeight);
            console.log(`RojeruTableSorterLite on "${this.container.id}" destroyed.`);
        }

        refresh() {
            this.filterCache = null; // Invalidar cache
            this.updateTable();
        }

        setData(newData) {
            this.fullData = Array.isArray(newData) ? [...newData] : [];
            this.currentPage = 1;
            this.filterCache = null; // Invalidar cache
            this.updateTable();
        }

        addRow(rowData, prepend = true) {
            if (prepend) {
                this.fullData.unshift(rowData);
            } else {
                this.fullData.push(rowData);
            }
            this.currentPage = 1;
            this.filterCache = null; // Invalidar cache
            this.updateTable();
        }

        removeRow(index) {
            if (index >= 0 && index < this.fullData.length) {
                this.fullData.splice(index, 1);
                const realLimit = this.getRealLimit();
                const totalPages = Math.ceil(this.fullData.length / realLimit);
                if (this.currentPage > totalPages && totalPages > 0) {
                    this.currentPage = totalPages;
                }
                this.filterCache = null; // Invalidar cache
                this.updateTable();
            }
        }

        getSelectedData() {
            return this.getFilteredData();
        }

        getCurrentPageData() {
            const filtered = this.getFilteredData();
            const realLimit = this.getRealLimit();
            const start = (this.currentPage - 1) * realLimit;
            return filtered.slice(start, start + realLimit);
        }

        getTotalRecords() {
            return this.totalRecords;
        }

        getCurrentPage() {
            return this.currentPage;
        }

        setCurrentPage(page) {
            const realLimit = this.getRealLimit();
            const totalPages = Math.ceil(this.totalRecords / realLimit);
            if (page >= 1 && page <= totalPages) {
                this.currentPage = page;
                this.updateTable();
            }
        }

        setRowsPerPage(rows) {
            this.options.rowsPerPage = rows;
            this.currentPage = 1;
            this.filterCache = null; // Invalidar cache
            this.updateTable();
        }

        clearFilters() {
            this.filters = {};
            this.globalSearch = '';
            this.currentPage = 1;
            this.filterCache = null; // Invalidar cache

            // Limpiar inputs
            const searchInput = document.getElementById(`buscador-global-${this.container.id}`);
            if (searchInput) searchInput.value = '';

            // Limpiar inputs de filtro
            const filterInputs = this.container.querySelectorAll('.rojeru-filtro, .rojeru-filtro-select');
            filterInputs.forEach(input => {
                if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0;
                } else {
                    input.value = '';
                }
            });

            this.updateTable();
        }

        getOptions() {
            return { ...this.options };
        }

        updateOptions(newOptions) {
            this.options = this.normalizeOptions({ ...this.options, ...newOptions });
            this.filterCache = null; // Invalidar cache
            this.renderStructure();
            this.loadData(this.fullData);
        }

        // Método estático para creación rápida
        static create(containerId, options) {
            return new RojeruTableSorterLite(containerId, options);
        }
    }

    return RojeruTableSorterLite;
});