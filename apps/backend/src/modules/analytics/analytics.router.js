const express = require("express");
const { handleOverview, handleGet, handleExport } = require("./analytics.controller");

const router = express.Router();

router.get("/overview", handleOverview);
router.get("/export", handleExport);
router.get("/:pageId", handleGet);

module.exports = router;
