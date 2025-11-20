'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here and relationships
      Profile.belongsTo(models.User, { foreignKey: 'userId' }); // One-to-One
    }
  }
  Profile.init({
    bio: DataTypes.TEXT,
    location: DataTypes.STRING,
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true }
  }, {
    sequelize,
    modelName: 'Profile',
    timestamps: true,
    paranoid: true
  });
  return Profile;
};