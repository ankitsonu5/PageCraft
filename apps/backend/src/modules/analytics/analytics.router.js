const express = require("express");
const { handleGet } = require("./analytics.controller");

const router = express.Router();

router.get("/:pageId", handleGet);

module.exports = router;
