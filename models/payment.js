"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.payment.hasMany(models.donate, {
        foreignKey: "paymentId",
      });
    }
  }
  payment.init(
    {
      method: DataTypes.STRING,
      card_number: DataTypes.STRING,
      card_exp_month: DataTypes.STRING,
      card_exp_year: DataTypes.STRING,
      card_cvv: DataTypes.INTEGER,
      transaction_time: DataTypes.STRING,
      transaction_status: DataTypes.STRING,
      bank_name: DataTypes.STRING,
      va_numbers: DataTypes.INTEGER,
      fraud_status: DataTypes.STRING,
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      modelName: "payment",
    }
  );
  return payment;
};
