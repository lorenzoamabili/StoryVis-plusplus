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
async function getAll() {
    return await StoryStudy.find();
}

async function getById(id) {
    return await StoryStudy.findById(id);
}

async function _delete(id) {
    await StoryStudy.findByIdAndRemove(id);
}