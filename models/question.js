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
      return await this.update(
        { title, description },
        {
          where: {
            id: questionId,
          },
        }
      );
    }

    // In order to delete a question, we need to delete all the options associated with it.
    // Use deleteAllOptionsByQuestionId() to delete all associated options.
    // It can be found in models/option.js file.
    static async deleteQuestion(userId, questionId) {
      return await this.destroy({ where: { id: questionId } });
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
