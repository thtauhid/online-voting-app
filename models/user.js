"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Election, {
        foreignKey: "adminId",
      });
    }

    static async createUser(name, email, password) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return await this.create({ name, email, password: hashedPassword });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
