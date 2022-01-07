"use strict";
const moment = require("moment");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class update extends Model {
    static associate(models) {
      models.update.belongsTo(models.campaign, {
        foreignKey: "campaignId",
      });
    }
  }
  update.init(
    {
      update: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      campaignId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "update",
    }
  );

  update.afterFind((instance) => {
    if (instance.length && instance.length > 0) {
      instance.forEach((el) => {
        let string = el.dataValues.amount.toString().split("").reverse();
        let result = [];

        let waktu = new Date(el.dataValues.createdAt).toLocaleString();
        el.dataValues.updateTime = moment(waktu).calendar({
          lastDay: "[Yesterday]",
          sameDay: "[Today]",
          nextDay: "[Tomorrow]",
          lastWeek: "[Last] dddd",
          nextWeek: "[Next] dddd",
          sameElse: "L",
        });

        string.map((item, i) => {
          if (i % 3 === 0 && i !== 0) {
            result.push(".");
          }
          result.push(item);
        });
        result.reverse();
        el.dataValues.jumlahWithdrawl = `Rp ${result.join("")}`;
      });
    }
  });

  return update;
};
