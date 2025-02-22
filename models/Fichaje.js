const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Fichaje = sequelize.define(
    'Fichaje',
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      fechaHora: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      coordenadas: { type: DataTypes.STRING, allowNull: false },
      direccion: { type: DataTypes.STRING, allowNull: true },
      tipo: { 
        type: DataTypes.ENUM('entrada', 'salida'), 
        allowNull: false, 
        defaultValue: 'entrada' 
      },
    },
    {
      tableName: 'fichajes',
      timestamps: true,
    }
  );

  return Fichaje;
};
