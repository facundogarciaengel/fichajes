const { Fichaje, Usuario } = require('../models');
const moment = require('moment-timezone');
const { Op, Model, where } = require('sequelize');
const axios = require('axios');



//Función para obtener la dirección a partir de las coordenadas
const obtenerDireccion = async (coordenadas) => {
  try {
    const apiKey = 'AIzaSyBq6q5RaIyajDkj07RjmWznT26EB5imZmk'; // Tu nueva API Key de Google Maps
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        latlng: coordenadas,
        key: apiKey,
        language: 'es',
        location_type: 'ROOFTOP', // Precisión de la dirección
      },
    });

    if (response.data.status === 'OK') {
      const direccion = response.data.results[0]?.formatted_address || 'Dirección no encontrada';
      console.log('Dirección obtenida de Google Maps:', direccion);
      return direccion;
    } else {
      console.error('Error en la geolocalización:', response.data.status);
      return 'Dirección no disponible';
    }
  } catch (error) {
    console.error('Error al obtener la dirección:', error.message);
    return 'Dirección no disponible';
  }
};

const obtenerDireccionAPI = async (req, res) => {
  const { coordenadas } = req.query; // Recibe las coordenadas desde el frontend

  if (!coordenadas) {
    return res.status(400).json({ mensaje: 'Coordenadas no proporcionadas' });
  }

  try {
    const direccion = await obtenerDireccion(coordenadas);
    return res.status(200).json({ direccion });
  } catch (error) {
    console.error('Error obteniendo dirección:', error);
    return res.status(500).json({ mensaje: 'Error obteniendo dirección' });
  }
};


const registrarFichaje = async (req, res) => {
  const { coordenadas } = req.body;

  try {
    //Obtener la direccion a partir de las coordenadas
    const direccion = await obtenerDireccion(coordenadas);
    console.log('Direccion enviada al modelo Fichaje:', direccion);
    const ultimoFichaje = await Fichaje.findOne({
      where: {  userId: req.user.id },
      order: [['fechaHora', 'DESC']],
    });

    let tipoFichaje = 'entrada'; // Por defecto, es una entrada
    if (ultimoFichaje && ultimoFichaje.tipo === 'entrada') {
      tipoFichaje = 'salida'; // Si el último fichaje fue una entrada, entonces es una salida
    }

    //Crear el fichaje con la direccion
    const fichaje = await Fichaje.create({
      userId: req.user.id, // El ID del usuario autenticado
      fechaHora: moment.utc().toDate(), // Hora del fichaje
      coordenadas, // Coordenadas recibidas
      direccion, // Dirección obtenida
      tipo: tipoFichaje,
    });

    res.status(201).json({ mensaje: 'Fichaje registrado', fichaje });
  } catch (error) {
    console.error('Error al registrar fichaje:', error);
    res.status(500).json({ mensaje: 'Error al registrar fichaje', error: error.message });
  }
};

//Función para listar los fichajes

const listarFichajes = async (req, res) => {
  try {
    const { startDate, endDate, nombre, dni, userId } = req.query; // ✅ Agregado userId como filtro extra

    // ✅ Validaciones de fechas
    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({ mensaje: "La fecha de inicio no es válida" });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({ mensaje: "La fecha de fin no es válida" });
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ mensaje: "La fecha de inicio no puede ser mayor que la fecha de fin" });
    }

    // ✅ Construcción de filtros
    const where = {};
    if (startDate || endDate) {
      where.fechaHora = {};
      if (startDate) where.fechaHora[Op.gte] = new Date(startDate);
      if (endDate) where.fechaHora[Op.lte] = new Date(endDate);
    }

    const usuarioWhere = {};
    if (nombre) usuarioWhere.nombre = { [Op.like]: `%${nombre}%` };
    if (dni) usuarioWhere.dni = dni;
    if (userId) usuarioWhere.id = userId; // Intento de filtrar por ID

    // 🚨 Restricciones para usuarios que no son administradores
    if (req.user.rol !== "admin") {
      // 🚫 Bloquear filtros que intenten acceder a otros usuarios
      if (
        (dni && dni !== req.user.dni) || 
        (nombre && nombre !== req.user.nombre) || 
        (userId && userId !== req.user.id.toString()) 
      ) {
        return res.status(403).json({
          mensaje: "No tienes permisos para ver fichajes de otros usuarios.",
        });
      }

      where.userId = req.user.id; // Un usuario normal solo ve sus fichajes
    }

    // ✅ Si es admin y no pasó filtros, limitamos la consulta a 100 fichajes
    const limiteResultados = req.user.rol === "admin" && !Object.keys(where).length ? 100 : null;

    // ✅ Obtener fichajes de la base de datos
    const fichajes = await Fichaje.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: "usuario",
          where: Object.keys(usuarioWhere).length ? usuarioWhere : undefined,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: limiteResultados,
    });

    // ✅ Manejo cuando no hay fichajes
    if (fichajes.length === 0) {
      return res.status(404).json({
        mensaje: req.user.rol !== "admin"
          ? "No tienes fichajes registrados en tu cuenta."
          : "No se encontraron fichajes en la base de datos.",
        fichajes: [],
      });
    }

    // ✅ Convertir fechas y preparar respuesta
    const fichajesConvertidos = fichajes.map((fichaje) => ({
      id: fichaje.id,
      usuario: fichaje.usuario?.nombre || "Desconocido",
      dni: fichaje.usuario?.dni || "No disponible",
      fechaHora: moment(fichaje.fechaHora).utcOffset("-03:00").format("YYYY-MM-DD HH:mm:ss"),
      coordenadas: fichaje.coordenadas,
      direccion: fichaje.direccion || "No disponible",
      tipo: fichaje.tipo,
    }));

    res.status(200).json({
      mensaje: "Fichajes listados con éxito",
      fichajes: fichajesConvertidos,
    });
  } catch (error) {
    console.error("Error al listar fichajes:", error);
    res.status(500).json({ mensaje: "Error al listar fichajes", error: error.message });
  }
};


module.exports = { registrarFichaje, listarFichajes, obtenerDireccionAPI };

