const path = require("path");
const validator = require("validator");

exports.createCommentValidator = async (req, res, next) => {
  try {
    const errors = [];

    if (validator.isEmpty(req.body.comment, { ignore_whitespace: true })) {
      errors.push("Comment cannot be empty!");
    }

    if (errors.length > 0) {
      return res.status(404).json({ errors: errors });
    }

    next();
  } catch (error) {
    res.status(500).json({
      status: 500,
      errors: "Internal Server Error validator create comment!",
      message: error,
    });
  }
};
