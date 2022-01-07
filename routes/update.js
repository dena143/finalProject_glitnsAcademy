const express = require("express");

const { createUpdate } = require("../controllers/update");
const { createUpdateValidators } = require("../middlewares/validators/update");

const router = express.Router();

router.route("/:id").post(createUpdateValidators, createUpdate);

module.exports = router;
