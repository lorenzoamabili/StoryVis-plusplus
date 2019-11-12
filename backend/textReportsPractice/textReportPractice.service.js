const db = require('_helpers/db');
const TextReportPractice = db.TextReportPractice;

module.exports = {
    getAll,
    getById,
    create,
    delete: _delete
};

async function create(textReportPractice) {

    const savedTextReport = new TextReportPractice(textReportPractice);

    await savedTextReport.save();
}

async function getAll() {
    return await TextReportPractice.find();
}

async function getById(id) {
    return await TextReportPractice.findById(id);
}

async function _delete(id) {
    await TextReportPractice.findByIdAndRemove(id);
}