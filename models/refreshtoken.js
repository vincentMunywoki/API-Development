'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
          
    static associate(models) {
      // define association here
      RefreshToken.belongsTo(models.User, {foreignKey: 'userId' });
    }
  }
  RefreshToken.init({
    token: { type: DataTypes.STRING, allowNull: false },
    expiryDate:{ type: DataTypes.DATE, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    sequelize,
    modelName: 'RefreshToken',
    timestamps: true,
    paranoid: true
  });
  return RefreshToken;
};