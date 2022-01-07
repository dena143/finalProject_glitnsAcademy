const { category } = require("../models");

class Categorys {
  async getAllCategory(req, res, next) {
    try {
      let data = await category.findAll({
        atributes: {
          exclude: ["createdAt", "updatedAt", "deletedAt"],
        },
      });

      if (data.length === 0) {
        return next({
          message: "There are no campaigns for this category yet",
          statusCode: 404,
        });
      }
      res.status(200).json({
        status: 200,
        success: true,
        message: `Success get all category`,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const insertData = await category.create(req.body);
      const data = await category.findOne({
        where: { id: insertData.id },
      });

      res.status(201).json({
        status: 201,
        success: true,
        message: "Success create category",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new Categorys();
