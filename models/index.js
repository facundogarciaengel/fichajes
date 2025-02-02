const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const initUsuario = require('./Usuario');
const initFichaje = require('./Fichaje');
const setupRelations = require('./relations');

dotenv.config();

// Configuración de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

// Inicializar modelos
const Usuario = initUsuario(sequelize);
const Fichaje = initFichaje(sequelize);

// Configurar relaciones
setupRelations({ Usuario, Fichaje });

// Sincronizar tablas
sequelize.sync({ force: false })
  .then(() => console.log('Tablas sincronizadas correctamente'))
  .catch((err) => console.error('Error al sincronizar las tablas:', err));

// Exportar modelos y Sequelize
module.exports = { sequelize, Usuario, Fichaje };
