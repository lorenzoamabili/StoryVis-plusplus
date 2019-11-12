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

async function getAll() {
    return await TextReport.find();
}

async function getById(id) {
    return await TextReport.findById(id);
}

async function _delete(id) {
    await TextReport.findByIdAndRemove(id);
}