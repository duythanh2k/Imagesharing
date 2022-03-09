const express = require("express");
const router  = express.Router();

const auth = require("../Middleware/authen.middleware");
const posts   = require("../controllers/post.controller");

router.get("/:id/comments", auth.isAuth, posts.getAllCmtDesc);
router.delete("/:id/comments/:comment_id", auth.isAuth, posts.deleteComment);
router.post("/:id/comments/:comment_id/like", auth.isAuth, posts.likeComment);

module.exports = router;