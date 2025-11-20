'use strict';
const {
  Model
} = require('sequelize');
const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here and relationships
      Post.belongsTo(models.User, {foreignKey: 'userId'}); //One-to-many
      Post.belongsToMany(models.Tag, { through: 'PostTags' }); // Many-to-Many 
    }
  }
  Post.init({
    title: {type: DataTypes.STRING, allowNull:false },
    content: DataTypes.TEXT,
    slug: DataTypes.STRING,
    userId: {type: DataTypes.INTEGER, allowNull: false }
  }, {
    sequelize,
    modelName: 'Post',
    timestamps:true,
    paranoid:true,
    hooks: {
      beforeCreate: (post) => {
        post.slug = slugify(post.title, { lower: true, strict: true }); //Auto-generate slug
      },
      beforeUpdate: (post) => {
        if (post.changed('title')) {
          post.slug = slugify(post.title, {lower: true, strict: true });
        }
      }
    }
  });
  return Post;
};