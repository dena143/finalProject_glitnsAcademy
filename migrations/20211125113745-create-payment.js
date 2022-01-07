"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("payments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      method: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      card_number: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      card_exp_month: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      card_exp_year: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      card_cvv: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      transaction_time: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      transaction_status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      bank_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      va_numbers: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      fraud_status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("payments");
  },
};
