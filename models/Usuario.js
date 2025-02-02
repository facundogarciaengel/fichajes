const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define(
    'Usuario',
    {
      nombre: { type: DataTypes.STRING, allowNull: false },
      dni: { type: DataTypes.STRING, unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: 'usuarios',
      timestamps: true,
    }
  );

  return Usuario;
};
