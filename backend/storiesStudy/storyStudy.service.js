const db = require('_helpers/db');
const StoryStudy = db.StoryStudy;

module.exports = {
    getAll,
    getById,
    create,
    delete: _delete
};

async function create(storyStudy) {
    const savedStory = new StoryStudy(storyStudy);
    await savedStory.save();
}

async function getAll({ limit = 100, skip = 0, userId, isAdmin } = {}) {
    const filter = isAdmin ? {} : { IDcreator: userId };
    return await StoryStudy.find(filter).sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id, userId, isAdmin) {
    const story = await StoryStudy.findById(id);
    if (!story) return null;
    if (!isAdmin && String(story.IDcreator) !== userId) return null;
    return story;
}

async function _delete(id, userId, isAdmin) {
    const story = await StoryStudy.findById(id);
    if (!story) return false;
    if (!isAdmin && String(story.IDcreator) !== userId) return false;
    await story.deleteOne();
    return true;
}