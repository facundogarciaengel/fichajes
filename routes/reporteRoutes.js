const express = require('express');
const { exportarFichajesCSV, exportarFichajesExcel } = require('../controllers/reporteController');
const router = express.Router();
const authenticateToken = require('../midleware/authMiddleware');


router.get('/fichajes/csv', authenticateToken, exportarFichajesCSV);
router.get('/fichajes/excel', authenticateToken, exportarFichajesExcel);

module.exports = router;
// 🔹 En este archivo se definen las rutas para exportar fichajes en formato CSV y Excel. Se importan las
//  funciones exportarFichajesCSV y
//  exportarFichajesExcel del controlador reportesController.js y se asignan a las rutas correspondientes.