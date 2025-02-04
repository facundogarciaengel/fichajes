const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models'); // Importa Sequelize
const usuarioRoutes = require('./routes/usuario');
const moment = require('moment-timezone');
const fichajeRoutes = require('./routes/fichaje');
const reportesRoutes = require('./routes/reporteRoutes');


dotenv.config();

const app = express();

app.use(cors(({
    origin: '*',
})));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Ruta de prueba
app.get('/', (req, res) => res.send('Backend funcionando'));

// Rutas de usuario
app.use('/api/usuarios', usuarioRoutes);

//consultar hora de fichaje si se hace correctamente antes de registrar el fichaje
console.log('Hora UTC:', moment.utc().format()); // Hora UTC
console.log('Hora Buenos Aires:', moment.tz('America/Argentina/Buenos_Aires').format()); // Hora en Buenos Aires


//Rutas de fichaje
app.use('/api', fichajeRoutes);

//Rutas de reportes
app.use('/api/reportes', reportesRoutes);



// Servidor
const PORT = process.env.PORT || 3000 || "0.0.0.0";

// Iniciar el servidor solo si la conexión es exitosa
(async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Servidor conectado a la base de datos.');
      app.listen(3000, () => console.log('🚀 Servidor corriendo en http://localhost:3000'));
    } catch (error) {
      console.error('❌ No se pudo conectar a la base de datos:', error);
    }
  })();