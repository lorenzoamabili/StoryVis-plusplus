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

async function getAll({ limit = 100, skip = 0 } = {}) {
    return await Story.find().sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id) {
    return await Story.findById(id);
}

async function _delete(id) {
    await Story.findByIdAndDelete(id);
}