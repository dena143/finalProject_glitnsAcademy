"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class campaign extends Model {
    static associate(models) {
      models.campaign.hasMany(models.comment, {
        foreignKey: "campaignId",
      });
      models.campaign.hasMany(models.donate, {
        foreignKey: "campaignId",
      });
      models.campaign.hasMany(models.update, {
        foreignKey: "campaignId",
      });
      models.campaign.belongsTo(models.user, {
        foreignKey: "userId",
      });
      models.campaign.belongsTo(models.category, {
        foreignKey: "categoryId",
      });
    }
  }
  campaign.init(
    {
      image: DataTypes.STRING,
      title: DataTypes.STRING,
      status: DataTypes.STRING,
      story: DataTypes.STRING,
      goal: DataTypes.INTEGER,
      deviation: DataTypes.INTEGER,
      collected: DataTypes.INTEGER,
      dueDate: DataTypes.DATEONLY,
      userId: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
      share: DataTypes.INTEGER,
      availSaldo: DataTypes.INTEGER,
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      modelName: "campaign",
    }
  );

  campaign.afterFind((instance) => {
    if (instance.length && instance.length > 0) {
      instance.forEach((el) => {
        let string = el.dataValues.goal.toString().split("").reverse();
        let string2 = el.dataValues.collected.toString().split("").reverse();
        let result = [];
        let result2 = [];

        string.map((item, i) => {
          if (i % 3 === 0 && i !== 0) {
            result.push(".");
          }
          result.push(item);
        });
        result.reverse();
        el.dataValues.jumlahGoal = `${result.join("")}`;

        string2.map((item, i) => {
          if (i % 3 === 0 && i !== 0) {
            result2.push(".");
          }
          result2.push(item);
        });
        result2.reverse();
        el.dataValues.jumlahCollected = `${result2.join("")}`;
      });
    }
  });

  return campaign;
};
