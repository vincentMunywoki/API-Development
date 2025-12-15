'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
  return queryInterface.addColumn("Users", "active", {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  });
},

down: (queryInterface) => {
  return queryInterface.removeColumn("Users", "active");
}

};
