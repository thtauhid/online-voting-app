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
      // Voter belongs to election
      Voter.belongsTo(models.Election, {
        foreignKey: "electionId",
      });
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

    static async getVoterById(voterId) {
      return await Voter.findOne({
        where: {
          voterId,
        },
      });
    }

    static async deleteVoter(adminId, voterId) {
      const voter = await Voter.findByPk(voterId);
      if (!voter) throw new Error("Voter not found");

      // todo: check if adminId is the same as voter.electionId -> adminId

      await voter.destroy();
    }

    static async verifyVoterAndElection(voterId, electionId) {
      const find = await Voter.findOne({
        where: {
          voterId,
          electionId,
        },
      });
      if (!find) throw new Error("Voter not found");
      return { verified: true };
    }

    static async updateVoterStatus(voterId, status) {
      try {
        const voter = await Voter.getVoterById(voterId);
        voter.voted = status;
        await voter.save();
      } catch (error) {
        console.log(error);
        throw new Error("Error updating voter status");
      }
    }
  }
  Voter.init(
    {
      voterId: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          len: [3],
        },
      },
      password: DataTypes.STRING,
      electionId: DataTypes.INTEGER,
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
