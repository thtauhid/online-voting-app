"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static async createQuestion(title, description, electionId) {
      return await this.create({ title, description, electionId });
    }

    static async getQuestionById(questionId) {
      return await this.findByPk(questionId);
    }

    static async getQuestionsByElectionId(electionId) {
      return await this.findAll({
        where: {
          electionId,
        },
      });
    }

    static async updateQuestion(userId, questionId, title, description) {
      // Check if user is the owner of the question
      return await this.update(
        { title, description },
        {
          where: {
            id: questionId,
          },
        }
      );
    }
  }
  Question.init(
    {
      title: {
        type: DataTypes.STRING,
        validate: {
          len: [5],
        },
      },
      description: DataTypes.STRING,
      electionId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Question",
    }
  );
  return Question;
};
