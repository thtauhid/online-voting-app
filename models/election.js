"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Election extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static async createElection(title, adminId) {
      return await this.create({ title, adminId });
    }

    static async getSingleElection() {
      // return await this.findOne();
    }

    static async getElectionsByAdminId(adminId) {
      return await this.findAll({
        where: {
          adminId,
        },
      });
    }

    static async getElectionById(id) {
      return await this.findByPk(id);
    }
  }
  Election.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [5],
        },
      },
      adminId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Election",
    }
  );
  return Election;
};
