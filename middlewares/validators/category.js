const path = require("path");
const validator = require("validator");
const { campaign } = require("../../models");

exports.createCategoryValidator = async (req, res, next) => {
  try {
    const errors = [];
    if (validator.isEmpty(req.body.category)) {
      error.push("Category name must be filled");
    }

    if (errors.length > 0) {
      return res.status(404).json({ errors: errors });
    }
    next();
  } catch (error) {
    next(error);
  }
};
