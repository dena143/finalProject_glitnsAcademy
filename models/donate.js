"use strict";
const moment = require("moment");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class donate extends Model {
    static associate(models) {
      models.donate.belongsTo(models.user, {
        foreignKey: "userId",
      });
      models.donate.belongsTo(models.campaign, {
        foreignKey: "campaignId",
      });
      models.donate.belongsTo(models.payment, {
        foreignKey: "paymentId",
      });
    }
  }
  donate.init(
    {
      amount: DataTypes.INTEGER,
      name: DataTypes.STRING,
      message: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      campaignId: DataTypes.INTEGER,
      paymentId: DataTypes.INTEGER,
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      modelName: "donate",
    }
  );

  donate.afterFind((instance) => {
    if (instance.length && instance.length > 0) {
      instance.forEach((el) => {
        let waktu = new Date(el.dataValues.updatedAt).toLocaleString();
        let string = el.dataValues.amount.toString().split("").reverse();
        let result = [];

        el.dataValues.donateTime = moment(
          waktu,
          "MM/DD/YYYY hh:mm:ss A"
        ).fromNow();

        string.map((item, i) => {
          if (i % 3 === 0 && i !== 0) {
            result.push(".");
          }
          result.push(item);
        });
        result.reverse();
        el.dataValues.jumlahDonasi = `Rp ${result.join("")}`;
      });
    }
  });

  return donate;
};
