module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'user'),
      defaultValue: 'user'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'role');
  }
};
