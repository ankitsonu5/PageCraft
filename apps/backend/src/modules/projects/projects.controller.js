const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("./projects.service");

async function handleList(req, res) {
  res.json(await listProjects());
}

async function handleGet(req, res) {
  res.json(await getProject(req.params.id));
}

async function handleCreate(req, res) {
  const project = await createProject(req.body);
  res.status(201).json(project);
}

async function handleUpdate(req, res) {
  res.json(await updateProject(req.params.id, req.body));
}

async function handleDelete(req, res) {
  await deleteProject(req.params.id);
  res.status(204).end();
}

module.exports = {
  handleList,
  handleGet,
  handleCreate,
  handleUpdate,
  handleDelete,
};
