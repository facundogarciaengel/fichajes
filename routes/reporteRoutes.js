const express = require('express');
const { exportarFichajesCSV, exportarFichajesExcel } = require('../controllers/reporteController');
const router = express.Router();
const authenticateToken = require('../midleware/authMiddleware');

// 🔹 Middleware para verificar si el usuario es administrador
const verificarAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren permisos de administrador' });
    }
    next();
  };
  


router.get('/fichajes/csv', authenticateToken, verificarAdmin, exportarFichajesCSV);
router.get('/fichajes/excel', authenticateToken, verificarAdmin, exportarFichajesExcel);

module.exports = router;
// 🔹 En este archivo se definen las rutas para exportar fichajes en formato CSV y Excel. Se importan las
//  funciones exportarFichajesCSV y
//  exportarFichajesExcel del controlador reportesController.js y se asignan a las rutas correspondientes.