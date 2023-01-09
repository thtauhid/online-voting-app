"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Elections", "description");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Elections", "description", {
      type: Sequelize.STRING,
    });
  },
};
