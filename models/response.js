"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Response extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to election
      Response.belongsTo(models.Election, {
        foreignKey: "electionId",
      });
    }

    static async addResponses(voterId, electionId, options) {
      try {
        // Iterate over options and create new response
        for (let option of options) {
          await Response.create({
            voterId,
            electionId,
            questionId: option[0],
            optionId: option[1],
          });
        }
      } catch (error) {
        console.log(error);
        throw new Error("Error adding responses");
      }
    }
  }
  Response.init(
    {
      voterId: DataTypes.STRING,
      optionId: DataTypes.INTEGER,
      questionId: DataTypes.INTEGER,
      electionId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Response",
    }
  );
  return Response;
};
