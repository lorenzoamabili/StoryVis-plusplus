const db = require('_helpers/db');
const Provenance = db.Provenance;

module.exports = {
    getAll,
    getById,
    create,
    delete: _delete
};

async function create(provenance) {

    const savedGraph = new Provenance(provenance);

    await savedGraph.save();
}

async function getAll({ limit = 100, skip = 0 } = {}) {
    return await Provenance.find().sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id) {
    return await Provenance.findById(id);
}

async function _delete(id) {
    await Provenance.findByIdAndDelete(id);
}