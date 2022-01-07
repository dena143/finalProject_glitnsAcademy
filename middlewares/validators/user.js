const path = require("path");
const crypto = require("crypto");
const validator = require("validator");
const { promisify } = require("util");
const cloudinary = require("cloudinary").v2;

const { user } = require("../../models");
const { encodePin } = require("../../utils/bcrypt");

cloudinary.config({
  cloud_name: "drta3xh4e",
  api_key: process.env.SECRET_KEY_CLOUDINARY,
  api_secret: process.env.SECRET_API_CLOUDINARY,
});

exports.createUserValidators = async (req, res, next) => {
  try {
    const errors = [];

    if (validator.isEmpty(req.body.name, { ignore_whitespace: true })) {
      errors.push("Please input the Name!");
    }

    if (!validator.isEmail(req.body.email)) {
      errors.push("Email is not valid");
    }

    const findUser = await user.findOne({
      where: { email: req.body.email },
    });

    if (findUser) {
      errors.push("Email already registered!");
    }

    if (
      !validator.isStrongPassword(req.body.password, [
        {
          minLength: 10,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          maxLength: 20,
        },
      ])
    ) {
      errors.push(
        "password must include lowercase: min 1, uppercase: min 1, numbers: min 1, symbol: min 1, and length: min 10 characters & max 20 characters."
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      errors.push("password and confirm password didn't match!");
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors: errors });
    }

    next();
  } catch (error) {
    next(error);
  }
};

exports.upadateUserValidator = async (req, res, next) => {
  try {
    const errors = [];

    if (req.body.name) {
      if (validator.isEmpty(req.body.name, { ignore_whitespace: true })) {
        errors.push("Please input the Name!");
      }
    }

    if (req.body.email) {
      const findUser = await user.findOne({
        where: { email: req.body.email },
      });

      if (findUser && findUser.id !== req.loginUser.data.id) {
        errors.push("Email already registered!");
      }

      if (!validator.isEmail(req.body.email)) {
        errors.push("Email is not valid");
      }
    }

    if (req.body.password) {
      if (
        !validator.isStrongPassword(req.body.password, [
          {
            minLength: 10,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            maxLength: 20,
          },
        ])
      ) {
        errors.push(
          "password must include lowercase: min 1, uppercase: min 1, numbers: min 1, symbol: min 1, and length: min 10 characters & max 20 characters."
        );
      }

      if (req.body.password !== req.body.confirmPassword) {
        errors.push("password and confirm password didn't match!");
      }

      req.body.password = encodePin(req.body.password);
    }

    if (req.files) {
      const file = req.files.image;

      if (!file.mimetype.startsWith("image")) {
        errors.push("File must be an image");
      }

      if (file.size > 1000000) {
        errors.push("Image must be less than 1MB");
      }

      let fileName = crypto.randomBytes(16).toString("hex");

      file.name = `${fileName}${path.parse(file.name).ext}`;

      const move = promisify(file.mv);

      await move(`./public/images/users/${file.name}`);

      const image = await cloudinary.uploader
        .upload(`./public/images/users/${file.name}`)
        .then((result) => {
          return result.secure_url;
        });

      req.body.image = image;
    }

    if (req.body.bankName) {
      if (validator.isEmpty(req.body.bankName, { ignore_whitespace: true })) {
        errors.push("Please input bankName!");
      }
    }

    if (req.body.bankAccount) {
      if (
        validator.isEmpty(req.body.bankAccount, { ignore_whitespace: true })
      ) {
        errors.push("Please input bank account number!");
      }

      if (!validator.isInt(req.body.bankAccount)) {
        errors.push("Bank account number must be a number!");
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors: errors });
    }

    next();
  } catch (error) {
    next(error);
  }
};
