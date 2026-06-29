const db = require('_helpers/db');
const TextReportStudy = db.TextReportStudy;

module.exports = { getAll, getById, create, delete: _delete };

async function create(textReport) {
    const saved = new TextReportStudy(textReport);
    await saved.save();
}

async function getAll({ limit = 100, skip = 0, IDcreator } = {}) {
    const filter = IDcreator ? { IDcreator } : {};
    return await TextReportStudy.find(filter).sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id) {
    return await TextReportStudy.findById(id);
}

async function _delete(id) {
    await TextReportStudy.findByIdAndDelete(id);
}
