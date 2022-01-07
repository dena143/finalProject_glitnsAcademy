const express = require("express");

const {
  adminPage,
  getAllCampaign,
  getAllByCategory,
  getCampaignBySearch,
  getRelatedByCategory,
  getDetailCampaign,
  sharing,
} = require("../controllers/campaign");

const router = express.Router();

router.get("/all", getAllCampaign);
router.get("/category", getAllByCategory);
router.get("/search", getCampaignBySearch);
router.get("/related/:id", getRelatedByCategory);
router.get("/details/:id", getDetailCampaign);
router.patch("/count/:id", sharing);

module.exports = router;
