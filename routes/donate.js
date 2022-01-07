const express = require("express");

const { createDonateValidator } = require("../middlewares/validators/donate");

const { createDonate, showStatusPayment } = require("../controllers/donate");

const router = express.Router();

router.get("/status", showStatusPayment);
router.post("/:id", createDonateValidator, createDonate);

module.exports = router;
