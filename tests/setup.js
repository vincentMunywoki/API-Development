const sequelize = require('../config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Drop and recreate tables for clean state
});

afterAll(async () => {
  await sequelize.close(); // Close connection
});