const db = require('_helpers/db');
const StoryStudy = db.StoryStudy;

module.exports = { getAll, getById, create, delete: _delete };

async function create(story) {
    const saved = new StoryStudy(story);
    await saved.save();
}

async function getAll({ limit = 100, skip = 0, IDcreator } = {}) {
    const filter = IDcreator ? { IDcreator } : {};
    return await StoryStudy.find(filter).sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id) {
    return await StoryStudy.findById(id);
}

async function _delete(id) {
    await StoryStudy.findByIdAndDelete(id);
}
