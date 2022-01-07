const express = require("express");

const { createCommentValidator } = require("../middlewares/validators/comment");
const authentication = require("../middlewares/auth/auth");
const { getAllComment, createComment } = require("../controllers/comment");

const router = express.Router();

router.get("/", getAllComment);
router.post("/:id", authentication, createCommentValidator, createComment);

module.exports = router;
