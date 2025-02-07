const express = require('express');
const { crearUsuario, iniciarSesion, cambiarRolUsuario } = require('../controllers/usuarioController');
const router = express.Router();
const authenticateToken = require("../midleware/authMiddleware");
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

 

router.post('/registro', crearUsuario);
router.post('/login', iniciarSesion);

//Para cambiar el rol de un usuario
router.put('/cambiar-rol/:id', authenticateToken, cambiarRolUsuario);

router.post('/crear-admin', async (req, res) => {
    try {
      const hashedPassword = bcrypt.hashSync('ClaveAdminSegura123', 10);
      const admin = await Usuario.create({
        nombre: 'Admin Inicial',
        dni: '99999999',
        password: hashedPassword,
        rol: 'admin',
      });
      console.log("Administrador creado:", admin);
  
      res.status(201).json({ mensaje: 'Administrador creado con éxito', admin });
    } catch (error) {
      console.error('Error al crear administrador:', error);
      res.status(500).json({ mensaje: 'Error al crear administrador', error });
    }
  });
  


module.exports = router;
