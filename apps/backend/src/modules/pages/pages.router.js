const express = require("express");
const {
  handleList,
  handleGet,
  handleCreate,
  handleUpdate,
  handlePublish,
  handleDuplicate,
  handleDelete,
} = require("./pages.controller");

const router = express.Router();

router.get("/", handleList);
router.post("/", handleCreate);
router.get("/:id", handleGet);
router.patch("/:id", handleUpdate);
router.post("/:id/publish", handlePublish);
router.post("/:id/duplicate", handleDuplicate);
router.delete("/:id", handleDelete);

module.exports = router;
