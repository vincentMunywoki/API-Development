'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PasswordResetToken extends Model {
    static associate(models) {
      // define association here
      PasswordResetToken.belongsTo(models.User, { foreignKey: 'userId'});
    }
  }
  PasswordResetToken.init({
    token: { type: DataTypes.STRING, allowNull: false },
    expiryDate: { type: DataTypes.DATE, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    sequelize,
    modelName: 'PasswordResetToken',
    timestamps: true,
    paranoid: true
  });
  return PasswordResetToken;
};