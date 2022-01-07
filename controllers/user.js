const validator = require("validator");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const { Op } = require("sequelize");

const { user, campaign, donate, category } = require("../models");
const { encodePin, compare } = require("../utils/bcrypt");
const { generateToken, decodeToken } = require("../utils/jwt");

class Users {
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const hashPassword = encodePin(password);

      const newUser = await user.create({
        name,
        email,
        password: hashPassword,
        image:
          " https://res.cloudinary.com/drta3xh4e/image/upload/v1638357160/nuw3pv0vdee8bk8zlx4q.png",
      });

      const dataUser = await user.findOne({
        attributes: ["id", "name", "email", "image"],
        where: {
          id: newUser.id,
        },
      });

      const payload = { data: dataUser.dataValues };
      const token = generateToken(payload);

      return res.status(201).json({
        status: 201,
        token,
        dataUser,
        message: ["Your account has been created"],
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserDetail(req, res, next) {
    try {
      const id = req.loginUser.data.id;
      const userData = await user.findOne({
        attributes: [
          "id",
          "name",
          "email",
          "bankName",
          "bankAccount",
          "image",
          "role",
        ],
        where: {
          id,
        },
      });

      res.status(200).json({
        status: 200,
        data: userData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const dataUser = await user.findOne({
        // attributes: {
        //   exclude: ["password", "createdAt", "updatedAt", "deletedAt"],
        // },
        where: {
          email,
        },
      });

      if (!validator.isEmail(email)) {
        return res.status(400).json({
          status: 400,
          message: "Please input email correctly!",
        });
      }

      if (!dataUser) {
        return res.status(401).json({
          status: 401,
          message: "Please signup first!",
        });
      }

      const hashPass = dataUser.password;
      const compareResult = compare(password, hashPass);

      if (dataUser.email && !compareResult) {
        return res.status(400).json({
          status: 400,
          message: "Please input password correctly!",
        });
      }

      const payload = { data: dataUser.dataValues };
      const token = generateToken(payload);
      return res.status(200).json({
        status: 200,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      await user.update(req.body, { where: { id: req.loginUser.data.id } });

      const data = await user.findOne({
        attributes: {
          exclude: ["password", "createdAt", "updatedAt", "deletedAt"],
        },
        where: { id: req.loginUser.data.id },
      });
      return res.status(201).json({
        status: 201,
        data,
        message: ["Your profil has been updated!"],
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyCampaign(req, res, next) {
    try {
      let data = await campaign.findAll({
        attributes: [
          "id",
          "image",
          "title",
          "goal",
          "collected",
          "deviation",
          "createdAt",
          "status",
        ],
        include: [
          { model: user, attributes: ["name"] },
          { model: category, attributes: ["category"] },
        ],
        where: {
          [Op.and]: [{ userId: req.loginUser.data.id }, { status: "open" }],
        },
        limit: 4,
        order: [["createdAt", "DESC"]],
      });

      if (data.length === 0) {
        return res
          .status(404)
          .json({ status: 404, message: ["Campaign not found"] });
      }

      return res.status(200).json({ status: 200, data });
    } catch (error) {
      next(error);
    }
  }

  static async getMyDonate(req, res, next) {
    try {
      let data = await donate.findAll({
        attributes: ["amount", "name", "message", "updatedAt"],
        include: [
          {
            model: campaign,
            attributes: ["id", "title", "status"],
            where: {
              status: "open",
            },
          },
        ],
        where: {
          [Op.and]: [
            { userId: req.loginUser.data.id },
            { amount: { [Op.gt]: 0 } },
          ],
        },
        limit: 4,
        order: [["createdAt", "desc"]],
      });

      if (data.length === 0) {
        return res
          .status(404)
          .json({ status: 404, message: "You haven't donate yet!" });
      }

      res.status(200).json({
        status: 200,
        message: "Horee! your donations is success",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const data = await user.findOne({
        where: { email: req.body.email },
      });

      let payload = { data: data.email };
      let userId = generateToken(payload);

      let link = `https://talikasih.netlify.app/resetPassword/${userId}`;

      var transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "talikasihofficial@gmail.com",
          pass: process.env.PASSWORD_GMAIL,
        },
      });

      const handlebarOptions = {
        viewEngine: {
          partialsDir: path.resolve("./views"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./views"),
      };

      transport.use("compile", hbs(handlebarOptions));

      const mailOptions = {
        from: "talikasihofficial@gmail.com",
        to: data.email,
        subject: "Reset Password Confirmation",
        template: `forgotPassword`,
        context: {
          link,
        },
      };

      transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          next(error);
        } else {
          return res.status(200).json({
            userId,
            message: ["Link for reset password was sent to email"],
          });
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
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
        return res.status(404).json({
          message:
            "password must include lowercase: min 1, uppercase: min 1, numbers: min 1, symbol: min 1, and length: min 10 characters & max 20 characters.",
        });
      }

      if (req.body.password !== req.body.confirmPassword) {
        return res
          .status(404)
          .json({ message: "password and confirm password didn't match!" });
      }

      let password = encodePin(req.body.password);
      let { data } = decodeToken(req.params.token);
      await user.update(
        { password },
        {
          where: { email: data },
        }
      );

      return res
        .status(201)
        .json({ message: "Your password has been changed!" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Users;
