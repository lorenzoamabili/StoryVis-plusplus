const db = require('_helpers/db');
const TextReport = db.TextReport;

module.exports = {
    getAll,
    getById,
    create,
    delete: _delete
};

async function create(textReport) {

    const savedTextReport = new TextReport(textReport);

    await savedTextReport.save();
}

async function getAll({ limit = 100, skip = 0 } = {}) {
    return await TextReport.find().sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id) {
    return await TextReport.findById(id);
}

async function _delete(id) {
    await TextReport.findByIdAndDelete(id);
}