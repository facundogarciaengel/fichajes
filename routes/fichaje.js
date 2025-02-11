const express = require('express');
const { registrarFichaje, listarFichajes, obtenerDireccionAPI } = require('../controllers/fichajeController');
const authenticateToken = require('../midleware/authMiddleware');
const router = express.Router();


// Ruta para registrar fichajes
router.post('/fichajes', authenticateToken, registrarFichaje);
// Ruta para obtener dirección
router.get('/obtener-direccion', authenticateToken, obtenerDireccionAPI);

// Ruta para listar fichajes
router.get('/fichajes', authenticateToken, listarFichajes);

module.exports = router;

 