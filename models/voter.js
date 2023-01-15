"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = (sequelize, DataTypes) => {
  class Voter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static async getVotersByElectionId(electionId) {
      return await Voter.findAll({
        where: {
          electionId,
        },
      });
    }

    static async addVoter(voterId, password, electionId) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return await Voter.create({
        voterId,
        password: hashedPassword,
        electionId,
      });
    }
  }
  Voter.init(
    {
      voterId: DataTypes.STRING,
      password: DataTypes.STRING,
      electionId: {
        type: DataTypes.INTEGER,
        // references: {
        //   model: "Election",
        //   key: "id",
        // },
      },
      voted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Voter",
    }
  );
  return Voter;
};
