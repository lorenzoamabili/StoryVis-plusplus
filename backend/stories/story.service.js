const db = require('_helpers/db');
const Story = db.Story;

module.exports = { getAll, getById, create, delete: _delete };

async function create(story) {
    const saved = new Story(story);
    await saved.save();
}

async function getAll({ limit = 100, skip = 0, IDcreator } = {}) {
    const filter = IDcreator ? { IDcreator } : {};
    return await Story.find(filter).sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id) {
    return await Story.findById(id);
}

async function _delete(id) {
    await Story.findByIdAndDelete(id);
}
