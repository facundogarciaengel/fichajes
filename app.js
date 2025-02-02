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

console.log(app._router.stack.filter(r => r.route).map(r => r.route.path));

app.listen(PORT, "0.0.0.0", () => console.log(`Servidor corriendo en el puerto ${PORT}`));
