const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const pollsRouter = require("./polls");
const usersRouter = require("./users");

router.use("/test-db", testDbRouter);
router.use("/polls", pollsRouter);
router.use("/users", usersRouter);

module.exports = router;
