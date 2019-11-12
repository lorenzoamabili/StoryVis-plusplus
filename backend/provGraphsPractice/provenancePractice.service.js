const db = require('_helpers/db');
const ProvenancePractice = db.ProvenancePractice;

module.exports = {
    getAll,
    getById,
    create,
    delete: _delete
};

async function create(provenancePractice) {

    const savedGraph = new ProvenancePractice(provenancePractice);

    await savedGraph.save();
}

async function getAll() {
    return await ProvenancePractice.find();
}

async function getById(id) {
    return await ProvenancePractice.findById(id);
}

async function _delete(id) {
    await ProvenancePractice.findByIdAndRemove(id);
}