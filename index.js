// Rojeru TableSorter Lite
// Versión gratuita y ligera

const RojeruTableSorterLite = require('./rojeru-tablesorter-lite.js');

// Si estamos en un entorno de navegador, también exponer globalmente
if (typeof window !== 'undefined') {
    window.RojeruTableSorterLite = RojeruTableSorterLite;
}

module.exports = RojeruTableSorterLite;