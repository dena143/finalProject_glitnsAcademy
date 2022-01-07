const { comment, campaign, user } = require("../models");
const moment = require("moment");
class Comment {
  async getAllComment(req, res, next) {
    try {
      let data = await comment.findAll({
        attributes: ["comment", "createdAt", "updatedAt"],

        include: [
          {
            model: campaign,
            attributes: ["id"],
          },
          {
            model: user,
            attributes: ["id", "name", "image"],
          },
        ],
        where: { campaignId: req.query.id },
        order: [["id", "desc"]],
      });

      if (data.length === 0) {
        return res
          .status(404)
          .json({ status: 404, message: "The Comment not found" });
      }

      let commentTime = [];
      for (let i = 0; i < data.length; i++) {
        const getCreatedAt = data[i].dataValues.createdAt;
        const formatDate = new Date(getCreatedAt).toLocaleString();
        const parseTime = moment(formatDate, "MM/DD/YYYY, h:mm:ss A").fromNow();
        commentTime.push(parseTime);
      }

      res.status(200).json({
        status: 200,
        totalComment: data.length,
        success: true,
        commentTime,
        message: "Success get all comment data",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createComment(req, res, next) {
    try {
      const newData = await comment.create({
        comment: req.body.comment,
        campaignId: req.params.id,
        userId: req.loginUser.data.id,
      });

      const data = await comment.findOne({
        where: {
          id: newData.id,
        },
        attributes: ["comment", "createdAt"],
        include: [
          {
            model: user,
            attributes: ["name", "image"],
          },
        ],
      });

      return res
        .status(201)
        .json({ status: 201, data, message: ["Success add your comment"] });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new Comment();
