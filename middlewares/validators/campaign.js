const { campaign } = require("../../models");
const path = require("path");
const crypto = require("crypto");
const validator = require("validator");
const { promisify } = require("util");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "drta3xh4e",
  api_key: process.env.SECRET_KEY_CLOUDINARY,
  api_secret: process.env.SECRET_API_CLOUDINARY,
});

exports.createCampaignValidator = async (req, res, next) => {
  try {
    const errors = [];

    if (!(req.files && req.files.image)) {
      errors.push("Please upload the image");
    } else if (req.files.image) {
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

      await move(`./public/images/campaigns/${file.name}`);

      const image = await cloudinary.uploader
        .upload(`./public/images/campaigns/${file.name}`)
        .then((result) => {
          return result.secure_url;
        });

      req.body.image = image;
    }

    if (
      validator.isEmpty(req.body.title, {
        ignore_Whitespace: true,
      })
    ) {
      errors.push(`Title can't be empty`);
    }

    if (!validator.isInt(req.body.goal)) {
      errors.push("Goal must be a number!");
    }

    if (!validator.isDate(req.body.dueDate)) {
      errors.push("Please input due date correctly!");
    }

    if (errors.length > 0) {
      return res.status(404).json({ errors: errors });
    }
    next();
  } catch (error) {
    next(error);
  }
};

exports.editCampaignValidator = async (req, res, next) => {
  try {
    const errors = [];

    if (req.body.title) {
      if (validator.isEmpty(req.body.title, { ignore_whitespace: true })) {
        errors.push("Please input campaign title!");
      }
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

      await move(`./public/images/campaigns/${file.name}`);

      const image = await cloudinary.uploader
        .upload(`./public/images/campaigns/${file.name}`)
        .then((result) => {
          return result.secure_url;
        });

      req.body.image = image;
      console.log(req.body.image);
    }

    if (req.body.goal) {
      if (!validator.isInt(req.body.goal)) {
        errors.push("Please input goal of the campaign !");
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
