const db = require('_helpers/db');
const Story = db.Story;

module.exports = {
    getAll,
    getById,
    create,
    delete: _delete
};

async function create(story) {
    const savedStory = new Story(story);
    await savedStory.save();
}

async function getAll({ limit = 100, skip = 0, userId, isAdmin } = {}) {
    const filter = isAdmin ? {} : { IDcreator: userId };
    return await Story.find(filter).sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id, userId, isAdmin) {
    const story = await Story.findById(id);
    if (!story) return null;
    if (!isAdmin && String(story.IDcreator) !== userId) return null;
    return story;
}

async function _delete(id, userId, isAdmin) {
    const story = await Story.findById(id);
    if (!story) return false;
    if (!isAdmin && String(story.IDcreator) !== userId) return false;
    await story.deleteOne();
    return true;
}