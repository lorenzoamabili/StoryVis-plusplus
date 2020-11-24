const db = require('_helpers/db');
const ProvenanceStudy = db.ProvenanceStudy;

module.exports = {
    getAll,
    getById,
    create,
    delete: _delete
};

async function create(provenanceStudy) {

    const savedGraph = new ProvenanceStudy(provenanceStudy);

    await savedGraph.save();
}

async function getAll() {
    return await ProvenanceStudy.find();
}

async function getById(id) {
    return await ProvenanceStudy.findById(id);
}

async function _delete(id) {
    await ProvenanceStudy.findByIdAndRemove(id);
}