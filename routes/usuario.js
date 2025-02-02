const express = require('express');
const { crearUsuario, iniciarSesion } = require('../controllers/usuarioController');
const router = express.Router();

router.post('/registro', crearUsuario);
router.post('/login', iniciarSesion);

module.exports = router;
