const express = require("express");

const { upadateUserValidator } = require("../middlewares/validators/user");

const {
  getUserDetail,
  updateUser,
  getMyCampaign,
  getMyDonate,
} = require("../controllers/user");

const router = express.Router();

router.get("/", getUserDetail);
router.get("/myCampaign", getMyCampaign);
router.get("/myDonate", getMyDonate);
router.patch("/update", upadateUserValidator, updateUser);

module.exports = router;
