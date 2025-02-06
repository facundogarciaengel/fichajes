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

const listarFichajes = async (req, res) => {
  try {
    const { startDate, endDate, nombre, dni } = req.query;

    // Validaciones de fechas
    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({ mensaje: "La fecha de inicio no es válida" });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({ mensaje: "La fecha de fin no es válida" });
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ mensaje: "La fecha de inicio no puede ser mayor que la fecha de fin" });
    }

    // Construir condición de filtro
    const where = {};
    if (startDate || endDate) {
      where.fechaHora = {};
      if (startDate) {
        where.fechaHora[Op.gte] = new Date(startDate); // Desde esta fecha
      }
      if (endDate) {
        where.fechaHora[Op.lte] = new Date(endDate); // Hasta esta fecha
      }
    }

    const usuarioWhere = {};
    if (nombre) {
      usuarioWhere.nombre = { [Op.like]: `%${nombre}%` }; // Filtro por nombre
    }
    if (dni) {
      usuarioWhere.dni = dni; // Filtro por DNI
    }

    if (!Object.keys(where).length && !Object.keys(usuarioWhere).length) {
      return res.status(400).json({ mensaje: "Debe proporcionar al menos un filtro para buscar fichajes" });
    }

    // 🔹 Filtro por usuario según rol
    if (req.user.rol !== 'admin') {
      where.userId = req.user.id; // Si no es admin, solo ve sus fichajes
    }


    // Obtener fichajes de la base de datos
    const fichajes = await Fichaje.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          where: Object.keys(usuarioWhere).length ? usuarioWhere : undefined,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Convertir fechas
    const fichajesConvertidos = fichajes.map((fichaje) => ({
      ...fichaje.toJSON(),
      fechaHora: moment(fichaje.fechaHora).utcOffset("-03:00").format("YYYY-MM-DD HH:mm:ss"),
      direccion: fichaje.direccion, // Incluimos la dirección en el listado
    }));

    res.status(200).json({ mensaje: "Fichajes listados con éxito", fichajes: fichajesConvertidos });
  } catch (error) {
    console.error("Error al listar fichajes:", error);
    res.status(500).json({ mensaje: "Error al listar fichajes", error: error.message });
  }
};


module.exports = { registrarFichaje, listarFichajes };

