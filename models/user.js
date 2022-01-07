"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    static associate(models) {
      models.user.hasMany(models.campaign, {
        foreignKey: "userId",
      });
      models.user.hasMany(models.comment, {
        foreignKey: "userId",
      });
      models.user.hasMany(models.donate, {
        foreignKey: "userId",
      });
    }
  }
  user.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      image: DataTypes.STRING,
      bankName: DataTypes.STRING,
      bankAccount: DataTypes.INTEGER,
      role: DataTypes.STRING,
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      modelName: "user",
    }
  );

  return user;
};
