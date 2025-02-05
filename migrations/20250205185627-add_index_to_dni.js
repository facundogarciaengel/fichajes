/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('usuarios', ['dni'], {
      unique: true,
      name: 'usuarios_dni_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('usuarios', 'usuarios_dni_idx');
  }
};
