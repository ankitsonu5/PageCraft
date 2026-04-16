const express = require("express");
const {
  handleList,
  handleGet,
  handleCreate,
  handleUpdate,
  handleDelete,
} = require("./projects.controller");

const router = express.Router();

router.get("/", handleList);
router.post("/", handleCreate);
router.get("/:id", handleGet);
router.patch("/:id", handleUpdate);
router.delete("/:id", handleDelete);

module.exports = router;
