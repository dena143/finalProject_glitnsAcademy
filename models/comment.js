"use strict";
const moment = require("moment");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class comment extends Model {
    static associate(models) {
      models.comment.belongsTo(models.user, {
        foreignKey: "userId",
      });
      models.comment.belongsTo(models.campaign, {
        foreignKey: "campaignId",
      });
    }
  }
  comment.init(
    {
      comment: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      campaignId: DataTypes.INTEGER,
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      modelName: "comment",
    }
  );

  comment.afterFind((instance) => {
    if (instance.length && instance.length > 0) {
      instance.forEach((el) => {
        let waktu = new Date(el.dataValues.createdAt).toLocaleString();
        el.dataValues.commentTime = moment(
          waktu,
          "MM/DD/YYYY hh:mm:ss A"
        ).fromNow();
      });
    }
  });

  return comment;
};
