const { Sequelize } = require('sequelize');

// Configuración de Sequelize
const database = 'fingertech_biometrics';
const username = 'Facundo'; // Reemplazar con tu usuario real
const password = 'Garden1921'; // Reemplazar con tu contraseña real
const host = 'localhost';

console.log('Credenciales utilizadas para conectar:');
console.log(`Database: ${database}`);
console.log(`Username: ${username}`);
console.log(`Password: ${password}`);
console.log(`Host: ${host}`);

const sequelize = new Sequelize(database, username, password, {
  host,
  dialect: 'mysql',
});

// Verificación de asociaciones
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos.');

    // Aquí puedes continuar con el resto de tu lógica, como sincronizar tablas o verificar asociaciones
    await sequelize.sync();
    console.log('Tablas sincronizadas correctamente.');
  } catch (error) {
    console.error('Error al verificar asociaciones:', error);
  } finally {
    await sequelize.close();
  }
})();
