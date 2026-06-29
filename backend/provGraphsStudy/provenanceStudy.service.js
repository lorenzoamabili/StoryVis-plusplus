const db = require('_helpers/db');
const ProvenanceStudy = db.ProvenanceStudy;

module.exports = { getAll, getById, create, delete: _delete };

async function create(provenance) {
    const saved = new ProvenanceStudy(provenance);
    await saved.save();
}

async function getAll({ limit = 100, skip = 0, IDcreator } = {}) {
    const filter = IDcreator ? { IDcreator } : {};
    return await ProvenanceStudy.find(filter).select('-serializedGraph').sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id) {
    return await ProvenanceStudy.findById(id);
}

async function _delete(id) {
    await ProvenanceStudy.findByIdAndDelete(id);
}
