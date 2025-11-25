'use strict';

module.exports = {
  up: async (queryInterdface, Sequelize) => {
    await queryInterdface.addColumn('Users', 'verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },
  down: async (queryInterdface, Sequelize) => {
    await queryInterdface.removeColumn('Users', 'verified');
  }
};