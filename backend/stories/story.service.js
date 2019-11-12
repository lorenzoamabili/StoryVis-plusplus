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

async function getAll() {
    return await Story.find();
}

async function getById(id) {
    return await Story.findById(id);
}

async function _delete(id) {
    await Story.findByIdAndRemove(id);
}