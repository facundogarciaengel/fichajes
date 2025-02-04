module.exports = ({ Usuario, Fichaje }) => {
  Usuario.hasMany(Fichaje, { foreignKey: 'userId', as: 'fichajes' });
  Fichaje.belongsTo(Usuario, { foreignKey: 'userId', as: 'usuario' });
};
