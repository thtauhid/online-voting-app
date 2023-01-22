"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // voterid should be unique
    // voterId has to be of minimum 3 chars
    await queryInterface.changeColumn("Voters", "voterId", {
      type: Sequelize.STRING,
      unique: true,
      validate: {
        len: [3],
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Voters", "voterId", {
      type: Sequelize.STRING,
      unique: false,
      validate: {
        len: [0],
      },
    });
  },
};
