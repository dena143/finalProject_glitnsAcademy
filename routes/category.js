const express = require("express");

const { getAllCategory } = require("../controllers/category");

const router = express.Router();

router.route("/").get(getAllCategory);

module.exports = router;
