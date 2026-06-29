const db = require('_helpers/db');
const Provenance = db.Provenance;

module.exports = { getAll, getById, create, delete: _delete };

async function create(provenance) {
    const saved = new Provenance(provenance);
    await saved.save();
}

async function getAll({ limit = 100, skip = 0, IDcreator } = {}) {
    const filter = IDcreator ? { IDcreator } : {};
    return await Provenance.find(filter).select('-serializedGraph').sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id) {
    return await Provenance.findById(id);
}

async function _delete(id) {
    await Provenance.findByIdAndDelete(id);
}
