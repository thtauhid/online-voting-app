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
      // belongs to user
      Election.belongsTo(models.User, {
        foreignKey: "adminId",
      });

      // Elction has many question
      Election.hasMany(models.Question, {
        foreignKey: "electionId",
        as: "questions",
      });

      // Election has many voters
      Election.hasMany(models.Voter, {
        foreignKey: "electionId",
        as: "voters",
      });

      // Election has many responses
      Election.hasMany(models.Response, {
        foreignKey: "electionId",
        as: "responses",
      });
    }

    static async createElection(title, adminId, url) {
      return await this.create({ title, adminId, url });
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
      return await this.findByPk(id, {
        include: [
          {
            model: sequelize.models.Question,
            as: "questions",
            // attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "count"]],
          },
          {
            model: sequelize.models.Voter,
            as: "voters",
            // attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "count"]],
          },
        ],
      });
    }

    static async changeElectionUrl(electionId, url) {
      const election = await this.getElectionById(electionId);

      if (!election) throw new Error("Election not found");

      election.url = url;
      return await election.save();
    }

    static async getFullElectionById(id) {
      return await this.findByPk(id, {
        include: [
          {
            model: sequelize.models.Question,
            as: "questions",
            include: [
              {
                model: sequelize.models.Option,
                as: "options",
              },
            ],
          },
        ],
      });
    }

    static async launchElection(electionid) {
      const election = await this.findByPk(electionid);
      if (!election) throw new Error("Election not found");

      election.status = "lanuched";
      return await election.save();
    }

    static async endElection(electionId) {
      const election = await this.findByPk(electionId);
      if (!election) throw new Error("Election not found");

      election.status = "completed";
      return await election.save();
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
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [5],
        },
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("created", "lanuched", "completed"),
        defaultValue: "created",
      },
    },
    {
      sequelize,
      modelName: "Election",
    }
  );
  return Election;
};
