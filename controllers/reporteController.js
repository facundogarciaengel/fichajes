const { Fichaje, Usuario } = require('../models');
const { Op } = require('sequelize');
const { Parser } = require('json2csv'); // Para CSV
const ExcelJS = require('exceljs'); // Para Excel
const moment = require('moment-timezone');

// 🔹 Función para exportar fichajes en CSV
const exportarFichajesCSV = async (req, res) => {
  try {
    const { startDate, endDate, nombre, dni } = req.query;

    // Construir condiciones de filtro
    const where = {};
    if (startDate || endDate) {
      where.fechaHora = {};
      if (startDate) where.fechaHora[Op.gte] = new Date(startDate);
      if (endDate) where.fechaHora[Op.lte] = new Date(endDate);
    }

    // Filtro por usuario
    const usuarioWhere = {};
    if (nombre) usuarioWhere.nombre = { [Op.like]: `%${nombre}%` };
    if (dni) usuarioWhere.dni = dni;

    // Obtener fichajes
    const fichajes = await Fichaje.findAll({
      where,
      include: [{ model: Usuario, as: 'usuario', where: usuarioWhere }],
      order: [['createdAt', 'DESC']],
    });
    //Verificar si hay fichajes antes de formatear datos
    if (fichajes.length === 0) {
      return res.status(404).json({ mensaje: 'No hay fichajes para exportar' });
    }

    // Formatear datos
    const fichajesFormat = fichajes.map((fichaje) => ({
      ID: fichaje.id,
      Usuario: fichaje.usuario.nombre,
      DNI: fichaje.usuario.dni,
      Fecha_Hora: moment(fichaje.fechaHora).utcOffset('-03:00').format('YYYY-MM-DD HH:mm:ss'),
      Coordenadas: fichaje.coordenadas,
      Direccion: fichaje.direccion || 'No disponible',
    }));

    // Convertir a CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(fichajesFormat);

    // Enviar archivo CSV
    res.header('Content-Type', 'text/csv');
    res.attachment('reporte_fichajes.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error al generar el reporte CSV:', error);
    res.status(500).json({ mensaje: 'Error al generar reporte CSV', error: error.message });
  }
};

// 🔹 Función para exportar fichajes en Excel
const exportarFichajesExcel = async (req, res) => {
  try {
    const fichajes = await Fichaje.findAll({
      include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'dni'] }],
      order: [['fechaHora', 'DESC']],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fichajes');

    // Definir encabezados
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Usuario', key: 'usuario', width: 20 },
      { header: 'DNI', key: 'dni', width: 15 },
      { header: 'Fecha Hora', key: 'fechaHora', width: 20 },
      { header: 'Coordenadas', key: 'coordenadas', width: 25 },
      { header: 'Dirección', key: 'direccion', width: 40 },
    ];

    // Agregar datos
    fichajes.forEach((fichaje) => {
      worksheet.addRow({
        id: fichaje.id,
        usuario: fichaje.usuario.nombre,
        dni: fichaje.usuario.dni,
        fechaHora: moment(fichaje.fechaHora).utcOffset('-03:00').format('YYYY-MM-DD HH:mm:ss'),
        coordenadas: fichaje.coordenadas,
        direccion: fichaje.direccion || 'No disponible',
      });
    });

    // Aplicar estilos (opcional)
    worksheet.getRow(1).font = { bold: true };

    // Enviar archivo Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Fichajes.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al generar el reporte Excel:', error);
    res.status(500).json({ mensaje: 'Error al generar reporte Excel', error: error.message });
  }
};

module.exports = { exportarFichajesCSV, exportarFichajesExcel };
