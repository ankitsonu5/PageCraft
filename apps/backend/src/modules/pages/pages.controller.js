const {
  listPages,
  getPage,
  createPage,
  updatePage,
  publishPage,
  deletePage,
} = require("./pages.service");

async function handleList(req, res) {
  res.json(await listPages(req.query.projectId));
}

async function handleGet(req, res) {
  res.json(await getPage(req.params.id));
}

async function handleCreate(req, res) {
  const page = await createPage(req.body);
  res.status(201).json(page);
}

async function handleUpdate(req, res) {
  res.json(await updatePage(req.params.id, req.body));
}

async function handlePublish(req, res) {
  res.json(await publishPage(req.params.id));
}

async function handleDelete(req, res) {
  await deletePage(req.params.id);
  res.status(204).end();
}

module.exports = {
  handleList,
  handleGet,
  handleCreate,
  handleUpdate,
  handlePublish,
  handleDelete,
};
