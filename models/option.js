"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Option belongs to question
      Option.belongsTo(models.Question, {
        foreignKey: "questionId",
      });
    }

    static async createOption(title, questionId) {
      return this.create({ title, questionId });
    }

    static async getOptionById(optionId) {
      return await this.findByPk(optionId);
    }

    static async updateOption(userId, optionId, title) {
      return await this.update({ title }, { where: { id: optionId } });
    }

    static async deleteOption(userId, optionId) {
      return await this.destroy({ where: { id: optionId } });
    }

    static async deleteAllOptionsByQuestionId(questionId) {
      return await this.destroy({ where: { questionId } });
    }

    static async getOptionsByQuestionId(questionId) {
      return await this.findAll({ where: { questionId } });
    }

    static async getCountByQuestionId(questionId) {
      return await this.count({ where: { questionId } });
    }
  }
  Option.init(
    {
      title: {
        type: DataTypes.STRING,
        validate: {
          len: [1],
        },
      },
      questionId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Option",
    }
  );
  return Option;
};
