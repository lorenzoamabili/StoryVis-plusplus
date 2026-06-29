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

async function getAll({ limit = 100, skip = 0, userId, isAdmin } = {}) {
    const filter = isAdmin ? {} : { IDcreator: userId };
    return await Provenance.find(filter).select('-serializedGraph').sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id, userId, isAdmin) {
    const graph = await Provenance.findById(id);
    if (!graph) return null;
    if (!isAdmin && String(graph.IDcreator) !== userId) return null;
    return graph;
}

async function _delete(id, userId, isAdmin) {
    const graph = await Provenance.findById(id);
    if (!graph) return false;
    if (!isAdmin && String(graph.IDcreator) !== userId) return false;
    await graph.deleteOne();
    return true;
}