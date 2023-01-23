"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Elections", "url", {
      type: Sequelize.STRING,
      unique: true,
    });

    await queryInterface.addColumn("Elections", "status", {
      type: Sequelize.ENUM("created", "lanuched", "completed"),
      defaultValue: "created",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Elections", "url");
    await queryInterface.removeColumn("Elections", "status");
  },
};
