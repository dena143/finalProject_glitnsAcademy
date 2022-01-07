const { update } = require("../models");

class Update {
  static async createUpdate(req, res, next) {
    try {
      const updateCampaign = await update.create(req.body);

      const data = await update.findOne({
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "deletedAt",
            "userId",
            "campaignId",
          ],
        },
        where: { id: updateCampaign.id },
        order: [["createdAt", "DESC"]],
      });

      return res
        .status(201)
        .json({ data, message: ["Update campaign success !"] });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Update;
