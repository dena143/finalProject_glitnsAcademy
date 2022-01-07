"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class category extends Model {
    static associate(models) {
      models.category.hasMany(models.campaign, {
        foreignKey: "categoryId",
      });
    }
  }
  category.init(
    {
      category: DataTypes.STRING,
      quotes: DataTypes.STRING,
      categoryImage: DataTypes.STRING,
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      modelName: "category",
    }
  );
  return category;
};
