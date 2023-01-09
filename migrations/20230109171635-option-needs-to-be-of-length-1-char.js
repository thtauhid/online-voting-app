"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Options", "title", {
      type: Sequelize.STRING,
      validate: {
        len: [5],
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Options", "title", {
      type: Sequelize.STRING,
    });
  },
};
