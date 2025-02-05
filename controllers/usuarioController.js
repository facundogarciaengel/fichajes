const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const crearUsuario = async (req, res) => {
  const { nombre, dni, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const usuario = await Usuario.create({ nombre, dni, password: hashedPassword });
    res.status(201).json({ mensaje: 'Usuario creado con éxito', usuario });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ mensaje: 'El DNI ya está registrado' });
    }
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error al crear usuario', error });
  }
};

module.exports = { crearUsuario };


const iniciarSesion = async (req, res) => {
  const { dni, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ where: { dni } });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const esValido = bcrypt.compareSync(password, usuario.password);
    if (!esValido) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ mensaje: 'Inicio de sesión exitoso', token });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error });
  }
};

module.exports = { crearUsuario, iniciarSesion };
