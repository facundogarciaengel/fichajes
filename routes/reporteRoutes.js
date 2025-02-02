const express = require('express');
const { exportarFichajesCSV, exportarFichajesExcel } = require('../controllers/reporteController');

const router = express.Router();

router.get('/fichajes/csv', exportarFichajesCSV);
router.get('/fichajes/excel', exportarFichajesExcel);

module.exports = router;
// 🔹 En este archivo se definen las rutas para exportar fichajes en formato CSV y Excel. Se importan las funciones exportarFichajesCSV y exportarFichajesExcel del controlador reportesController.js y se asignan a las rutas correspondientes.