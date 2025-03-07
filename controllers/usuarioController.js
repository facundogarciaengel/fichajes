const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const crearUsuario = async (req, res) => {
  const { nombre, dni, password } = req.body; // 👀 Eliminamos rol del body para evitar registros manuales como admin
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const usuario = await Usuario.create({ nombre, dni, password: hashedPassword, rol: 'usuario' }); // Siempre es usuario por defecto
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

  if (!dni || !password) {
    return res.status(400).json({ mensaje: "DNI y contraseña son obligatorios" });
  }

  try {
    const usuario = await Usuario.findOne({
      where: { dni },
      attributes: ["id", "dni", "password", "rol"],
      raw: true  // ✅ Esto convierte el resultado en un objeto plano
   });
   

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const esValido = bcrypt.compareSync(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }
    console.log("Usuario encontrado:", usuario.id, usuario.rol);

    // 🚀 Generamos el token con ID y ROL
    const payload = { id: usuario.id, rol: usuario.rol };
console.log("Payload antes de firmar el token:", payload);

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });


    res.json({
      mensaje: "Inicio de sesión exitoso",
      token, // ✅ Devuelve el token correcto
      usuario: { id: usuario.id, rol: usuario.rol } // ✅ Para verificar el rol en la respuesta
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ mensaje: "Error al iniciar sesión", error: error.message });
  }
};




const cambiarRolUsuario = async (req, res) => {
  const { id } = req.params;
  const { nuevoRol } = req.body;

  if (!['usuario', 'admin'].includes(nuevoRol)) {
    return res.status(400).json({ mensaje: 'Rol no válido' });
  }

  try {
    const usuarioSolicitante = await Usuario.findByPk(req.user.id);
    if (usuarioSolicitante.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No autorizado para cambiar roles' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    usuario.rol = nuevoRol;
    await usuario.save();

    res.status(200).json({ mensaje: `Rol de usuario actualizado a ${nuevoRol}` });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ mensaje: 'Error al cambiar rol', error });
  }
};




module.exports = { crearUsuario, iniciarSesion, cambiarRolUsuario};
