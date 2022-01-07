const path = require("path");
const validator = require("validator");

exports.createDonateValidator = async (req, res, next) => {
  try {
    const errors = [];

    if (
      validator.isEmpty(req.body.amount, {
        ignore_Whitespace: true,
      })
    ) {
      errors.push("amount cannot empty!");
    }

    if (!validator.isInt(req.body.amount)) {
      errors.push("amount must be a number!");
    }

    if (
      validator.isEmpty(req.body.name, {
        ignore_Whitespace: true,
      })
    ) {
      errors.push("name cannot empty!");
    }

    if (req.body.method == "Credit or Debit Card") {
      if (
        validator.isEmpty(req.body.card_number, {
          ignore_Whitespace: true,
        })
      ) {
        errors.push("Card number cannot empty!");
      }

      if (
        validator.isEmpty(req.body.card_exp_month, {
          ignore_Whitespace: true,
        })
      ) {
        errors.push("Expired date cannot empty!");
      }

      if (
        validator.isEmpty(req.body.card_exp_year, {
          ignore_Whitespace: true,
        })
      ) {
        errors.push("Expired date cannot empty!");
      }

      if (!validator.isLength(req.body.card_cvv, { min: 3, max: 3 })) {
        errors.push("Please input cvv number correctly!");
      }

      if (!validator.isInt(req.body.card_cvv)) {
        errors.push("Please input cvv number correctly!");
      }
    }

    if (errors.length > 0) {
      return res.status(404).json({ errors: errors });
    }

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
