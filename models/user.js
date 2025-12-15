"use strict";
const { Model } = require("sequelize");
const slugify = require("slugify");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here and Relationships
      User.hasOne(models.Profile, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      }); //One-to-One
      User.hasMany(models.Post, { foreignKey: "userId", onDelete: "CASCADE" }); //One-to-Many
    }
  }
  User.init(
  {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    name: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
  },
    {
      sequelize,
      modelName: "User",
      timestamps: true, // Adds createdAt
      paranoid: true, //Soft-deletes: adds deletedAt

      //**Add hooks for hashing pasword */
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  return User;
};
