const { sequelize } = require('../database/database'); // Conexión a BD
const initUsuario = require('./Usuario');
const initFichaje = require('./Fichaje');
const setupRelations = require('./relations');

// Inicializar modelos
const Usuario = initUsuario(sequelize);
const Fichaje = initFichaje(sequelize);

// Configurar relaciones
setupRelations({ Usuario, Fichaje });

// Sincronizar tablas con control de errores
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    await sequelize.sync();
    console.log('✅ Tablas sincronizadas correctamente.');
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
  }
})();

module.exports = { Usuario, Fichaje, sequelize };
