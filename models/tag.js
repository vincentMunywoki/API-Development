'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here and relationships
      Tag.belongsToMany(models.Post, { through: 'PostTags' }); // Many-to-Many
    }
  }
  Tag.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
  }, {
    sequelize,
    modelName: 'Tag',
    timestamps: true,
    paranoid: true
  });
  return Tag;
};