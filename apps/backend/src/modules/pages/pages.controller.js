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

function sanitizePageUpdate(body) {
  const patch = { ...body };
  // Validate URL fields — only allow http/https
  const urlFields = ["pageBgImage", "privacyPolicyUrl", "termsUrl"];
  for (const field of urlFields) {
    if (patch[field] !== undefined && patch[field] !== "") {
      try {
        const u = new URL(patch[field]);
        if (u.protocol !== "http:" && u.protocol !== "https:") {
          delete patch[field];
        }
      } catch {
        delete patch[field]; // malformed URL — drop it
      }
    }
  }
  // Pixel IDs: alphanumeric, dashes, underscores only
  const pixelFields = [
    "fbPixelId",
    "googleAdsId",
    "gtmId",
    "tiktokPixelId",
    "snapchatPixelId",
  ];
  const pixelRe = /^[A-Za-z0-9_\-]{1,80}$/;
  for (const field of pixelFields) {
    if (patch[field] !== undefined && patch[field] !== "") {
      if (!pixelRe.test(String(patch[field]))) delete patch[field];
    }
  }
  return patch;
}

async function handleUpdate(req, res) {
  res.json(await updatePage(req.params.id, sanitizePageUpdate(req.body)));
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
