const db = require('_helpers/db');
const StoryPractice = db.StoryPractice;

module.exports = {
    getAll,
    getById,
    create,
    delete: _delete
};

async function create(storyPractice) {

    const savedStory = new StoryPractice(storyPractice);

    await savedStory.save();
}
async function getAll() {
    return await StoryPractice.find();
}

async function getById(id) {
    return await StoryPractice.findById(id);
}

async function _delete(id) {
    await StoryPractice.findByIdAndRemove(id);
}