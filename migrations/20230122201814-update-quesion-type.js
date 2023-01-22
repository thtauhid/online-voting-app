"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change question description to text
    await queryInterface.changeColumn("Questions", "description", {
      type: Sequelize.TEXT,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Questions", "description", {
      type: Sequelize.STRING,
    });
  },
};
