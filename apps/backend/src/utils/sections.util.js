/**
 * Page.sections is a TEXT column holding a JSON array. The API always exposes
 * it as an array, and always stores it as a JSON string.
 */
const MAX_SECTIONS_BYTES = 2 * 1024 * 1024;

function parseSections(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function serializeSections(value) {
  const arr = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(arr)) throw { status: 400, message: "sections must be an array" };
  const json = JSON.stringify(arr);
  if (json.length > MAX_SECTIONS_BYTES) throw { status: 413, message: "Page content is too large" };
  return json;
}

/** Page row → API shape (sections as array). */
function withSections(page) {
  return page ? { ...page, sections: parseSections(page.sections) } : page;
}

module.exports = { parseSections, serializeSections, withSections };
