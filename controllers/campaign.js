const { Op } = require("sequelize");
const sequelize = require("sequelize");
const moment = require("moment");
const Redis = require("redis");

const redis = Redis.createClient({
  url: (process.env.REDIS_TLS_URL, process.env.REDIS_URL),
  tls: {
    rejectUnauthorized: false,
  },
});

redis.on("error", function (error) {
  console.error(`❗️ Redis Error: ${error}`);
});

redis.on("ready", () => {
  console.log("✅ 💃 redis have ready !");
});

redis.on("connect", () => {
  console.log("✅ 💃 connect redis success !");
});

const {
  campaign,
  user,
  category,
  donate,
  comment,
  update,
} = require("../models");

const DEFAULT_EXPIRATION = 3600;

const getPagination = (page, size) => {
  const limit = size ? +size : 12;
  const offset = (page - 1) * limit || 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: campaigns } = data;
  const currentPage = page ? +page : 1;
  const nextPage = page ? +page + 1 : 2;
  const prevPage = page ? +page - 1 : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, campaigns, totalPages, currentPage, prevPage, nextPage };
};

class Campaigns {
  static async getHomePage(req, res, next) {
    try {
      const trendingCampaign = await campaign.findAll({
        attributes: [
          "id",
          "image",
          "title",
          "story",
          "share",
          "goal",
          "collected",
          "status",
        ],
        include: [{ model: user, attributes: ["name", "image"] }],
        where: { status: "open" },
        limit: 1,
        order: [
          ["share", "DESC"],
          ["createdAt", "DESC"],
        ],
      });

      const newCampaign = await campaign.findAll({
        attributes: [
          "id",
          "image",
          "title",
          "goal",
          "collected",
          "deviation",
          "status",
        ],
        include: [
          { model: user, attributes: ["name"] },
          { model: category, attributes: ["category"] },
        ],
        where: { status: "open" },
        limit: 3,
        order: [["createdAt", "DESC"]],
      });

      return res
        .status(200)
        .json({ status: 200, trendingCampaign, newCampaign });
    } catch (error) {
      next(error);
    }
  }

  static async getDetailCampaign(req, res, next) {
    try {
      const detailCampaign = await campaign.findOne({
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        include: [
          { model: user, attributes: ["name", "image"] },
          { model: category, attributes: ["category"] },
        ],
        where: { id: req.params.id },
      });

      let start = moment(new Date());
      let end = moment(new Date(detailCampaign.dataValues.dueDate));
      let remainingTime = end.diff(start, "days");
      if (remainingTime > 0) {
        remainingTime;
      } else if (remainingTime <= 0) {
        remainingTime = 0;
      }

      const updateCampaign = await update.findAll({
        attributes: ["update", "amount", "createdAt"],
        where: { campaignId: detailCampaign.id },
        order: [["createdAt", "DESC"]],
      });

      const donatur = await donate.findAll({
        attributes: ["message", "name", "amount", "createdAt", "updatedAt"],
        include: [{ model: user, attributes: ["image"] }],
        where: {
          [Op.and]: [
            { campaignId: detailCampaign.id },
            { amount: { [Op.gt]: 0 } },
          ],
        },
        order: [["createdAt", "DESC"]],
      });

      const komen = await comment.findAll({
        attributes: ["comment", "createdAt"],
        include: [{ model: user, attributes: ["name", "image"] }],
        where: { campaignId: detailCampaign.id },
        order: [["createdAt", "DESC"]],
      });

      let related = await campaign.findAll({
        attributes: [
          "id",
          "image",
          "title",
          "goal",
          "collected",
          "deviation",
          "status",
        ],
        include: [
          { model: user, attributes: ["name"] },
          { model: category, attributes: ["category"] },
        ],
        where: {
          [Op.and]: [
            { categoryId: detailCampaign.dataValues.categoryId },
            { status: "open" },
          ],
        },
        limit: 3,
      });

      let string = detailCampaign.goal.toString().split("").reverse();
      let string2 = detailCampaign.collected.toString().split("").reverse();
      let string3 = detailCampaign.availSaldo.toString().split("").reverse();
      let result = [];
      let result2 = [];
      let result3 = [];

      string.map((item, i) => {
        if (i % 3 === 0 && i !== 0) {
          result.push(".");
        }
        result.push(item);
      });
      result.reverse();
      let jumlahGoal = `${result.join("")}`;

      string2.map((item, i) => {
        if (i % 3 === 0 && i !== 0) {
          result2.push(".");
        }
        result2.push(item);
      });
      result2.reverse();
      let jumlahCollected = `${result2.join("")}`;

      string3.map((item, i) => {
        if (i % 3 === 0 && i !== 0) {
          result3.push(".");
        }
        result3.push(item);
      });
      result3.reverse();
      let jumlahAvailSaldo = `${result3.join("")}`;

      return res.status(200).json({
        status: 200,
        detailCampaign,
        jumlahGoal,
        jumlahCollected,
        jumlahAvailSaldo,
        remainingTime,
        updateCampaign,
        donatur,
        komen,
        related,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllCampaign(req, res, next) {
    try {
      const dataNewest = await campaign.findAll({
        attributes: [
          "id",
          "image",
          "title",
          "goal",
          "collected",
          "deviation",
          "status",
        ],

        include: [
          { model: user, attributes: ["name"] },
          { model: category, attributes: ["category"] },
        ],
        where: {
          status: "open",
        },
        limit: 3,
        order: [["createdAt", "DESC"]],
      });

      const dataUrgent = await campaign.findAll({
        attributes: [
          "id",
          "image",
          "title",
          "goal",
          "collected",
          "deviation",
          "status",
        ],
        include: [
          { model: user, attributes: ["name"] },
          { model: category, attributes: ["category"] },
        ],
        where: {
          status: "open",
        },
        limit: 3,
        order: [
          ["deviation", "DESC"],
          ["createdAt", "ASC"],
        ],
      });

      const gainedMomentum = await campaign.findAll({
        attributes: [
          "id",
          "image",
          "title",
          "goal",
          "collected",
          "deviation",
          "status",
        ],
        include: [
          { model: user, attributes: ["name"] },
          { model: category, attributes: ["category"] },
        ],
        where: {
          status: "open",
        },
        limit: 3,
        order: [
          ["deviation", "ASC"],
          ["createdAt", "ASC"],
        ],
      });

      let allData = { dataNewest, gainedMomentum, dataUrgent };

      await redis.setex(
        "dataRedis",
        DEFAULT_EXPIRATION,
        JSON.stringify(allData)
      );

      redis.get("dataRedis", function (err, data) {
        return res.status(200).json(JSON.parse(data));
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllByCategory(req, res, next) {
    try {
      const { page, size, kategori, sort } = req.query;

      const { limit, offset } = getPagination(page, size);
      let data = "";

      if (kategori && sort == "Newest") {
        data = await campaign.findAndCountAll({
          attributes: [
            "id",
            "image",
            "title",
            "goal",
            "collected",
            "deviation",
          ],
          include: [
            { model: user, attributes: ["name"] },
            {
              model: category,
              attributes: ["category", "quotes", "categoryImage"],
            },
          ],
          where: { [Op.and]: [{ categoryId: kategori }, { status: "open" }] },
          limit,
          offset,
          order: [["createdAt", "DESC"]],
        });
      } else if (kategori && sort == "Most urgent") {
        data = await campaign.findAndCountAll({
          attributes: [
            "id",
            "image",
            "title",
            "goal",
            "collected",
            "deviation",
          ],
          include: [
            { model: user, attributes: ["name"] },
            {
              model: category,
              attributes: ["category", "quotes", "categoryImage"],
            },
          ],
          where: { [Op.and]: [{ categoryId: kategori }, { status: "open" }] },
          limit,
          offset,
          order: [
            ["deviation", "DESC"],
            ["createdAt", "ASC"],
          ],
        });
      } else if (kategori && sort == "Popular") {
        data = await campaign.findAndCountAll({
          attributes: [
            "id",
            "image",
            "title",
            "goal",
            "collected",
            "deviation",
          ],
          include: [
            { model: user, attributes: ["name"] },
            {
              model: category,
              attributes: ["category", "quotes", "categoryImage"],
            },
          ],
          where: { [Op.and]: [{ categoryId: kategori }, { status: "open" }] },
          limit,
          offset,
          order: [
            ["deviation", "ASC"],
            ["createdAt", "ASC"],
          ],
        });
      } else if (kategori && sort == "Less donation") {
        data = await campaign.findAndCountAll({
          attributes: [
            "id",
            "image",
            "title",
            "goal",
            "collected",
            "deviation",
          ],
          include: [
            { model: user, attributes: ["name"] },
            {
              model: category,
              attributes: ["category", "quotes", "categoryImage"],
            },
          ],
          where: { [Op.and]: [{ categoryId: kategori }, { status: "open" }] },
          limit,
          offset,
          order: [["deviation", "DESC"]],
        });
      } else {
        data = await campaign.findAndCountAll({
          attributes: [
            "id",
            "image",
            "title",
            "goal",
            "collected",
            "deviation",
          ],
          include: [
            { model: user, attributes: ["name"] },
            {
              model: category,
              attributes: ["category", "quotes", "categoryImage"],
            },
          ],
          where: { [Op.and]: [{ categoryId: kategori }, { status: "open" }] },
          limit,
          offset,
        });
      }

      if (data.rows.length === 0) {
        return res.status(404).json({ errors: ["The Campaign not found"] });
      }

      await redis.setex("dataRedis2", DEFAULT_EXPIRATION, JSON.stringify(data));

      redis.get("dataRedis2", function (err, data) {
        data = JSON.parse(data);
        return res.status(200).json(getPagingData(data, page, limit));
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCampaignBySearch(req, res, next) {
    try {
      const { page, size, search } = req.query;
      const { limit, offset } = getPagination(page, size);

      let data = await campaign.findAndCountAll({
        where: {
          [Op.and]: [
            {
              title: {
                [Op.iLike]: `%${search}%`,
              },
            },
            { status: "open" },
          ],
        },
        attributes: ["id", "image", "title", "goal", "collected", "deviation"],
        include: [
          { model: user, attributes: ["name"] },
          { model: category, attributes: ["category"] },
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      if (data.rows.length === 0) {
        return res.status(404).json({ errors: ["The Campaign not found"] });
      }

      await redis.setex("dataRedis3", DEFAULT_EXPIRATION, JSON.stringify(data));

      redis.get("dataRedis3", function (err, data) {
        data = JSON.parse(data);
        return res.status(200).json(getPagingData(data, page, limit));
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRelatedByCategory(req, res, next) {
    try {
      let data = await campaign.findAll({
        attributes: [
          "id",
          "image",
          "title",
          "goal",
          "collected",
          "deviation",
          "status",
        ],
        include: [
          { model: user, attributes: ["name"] },
          { model: category, attributes: ["category"] },
        ],
        where: {
          [Op.and]: [{ categoryId: req.params.id }, { status: "open" }],
        },
        limit: 3,
      });

      if (data.length === 0) {
        return res.status(404).json({ errors: ["Campaign not found"] });
      }

      return res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async createCampaign(req, res, next) {
    try {
      const { image, title, categoryId, goal, dueDate, story } = req.body;

      const createCampaign = await campaign.create({
        image,
        title,
        goal,
        deviation: goal,
        collected: 0,
        dueDate,
        story,
        userId: req.loginUser.data.id,
        categoryId: categoryId,
        share: 0,
        availSaldo: 0,
        status: "open",
      });

      const data = await campaign.findOne({
        attributes: {
          exclude: ["createdAt", "updatedAt", "deletedAt"],
        },
        where: { id: createCampaign.id },
      });

      return res
        .status(201)
        .json({
          status: 201,
          data,
          message: ["The Campaign has been created!"],
        });
    } catch (error) {
      next(error);
    }
  }
  static async sharing(req, res, next) {
    try {
      const cam = await campaign.findOne({
        where: {
          id: req.params.id,
        },
      });

      const tambah = parseInt(cam.share) + 1;

      await campaign.update(
        { share: tambah },
        { where: { id: req.params.id } }
      );

      return res.status(201).json({
        status: 201,
        message: [" Updated value for share campaigns "],
      });
    } catch (error) {
      next(error);
    }
  }

  static async editCampaign(req, res, next) {
    try {
      await campaign.update(req.body, { where: { id: req.params.id } });

      const data = await campaign.findOne({
        attributes: {
          exclude: [
            "deviation",
            "userId",
            "categoryId",
            "createdAt",
            "updatedAt",
            "deletedAt",
          ],
        },
        where: { id: req.params.id },
      });
      return res.status(201).json({
        status: 201,
        data,
        message: ["Campaign has been updated!"],
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCampaign(req, res, next) {
    try {
      const deletekampanye = await campaign.findOne({
        where: { id: req.params.id },
      });

      if (deletekampanye === null) {
        return res
          .status(404)
          .json({ status: 500, message: "Campaign not found!" });
      }

      if (
        deletekampanye.userId !== req.loginUser.data.id &&
        req.loginUser.data.role === "user"
      ) {
        return res
          .status(404)
          .json({ errors: " No edit access to this campaign!" });
      }

      await campaign.destroy({ where: { id: req.params.id } });

      res
        .status(200)
        .json({ status: 200, success: true, message: "Successfull Delete" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Campaigns;
