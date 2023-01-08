"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Colum adminId
    await queryInterface.addColumn("Elections", "adminId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
    });
    // Mark adminId as foreign key
    await queryInterface.addConstraint("Elections", {
      fields: ["adminId"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
    });

    // Mark title as required
    await queryInterface.changeColumn("Elections", "title", {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5],
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove adminId
    await queryInterface.removeColumn("Elections", "adminId");
    // Remove title required
    await queryInterface.changeColumn("Elections", "title", {
      type: Sequelize.STRING,
    });
  },
};
