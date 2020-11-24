const db = require('_helpers/db');
const TextReportStudy = db.TextReportStudy;

module.exports = {
    getAll,
    getById,
    create,
    delete: _delete
};

async function create(textReportStudy) {

    const savedTextReport = new TextReportStudy(textReportStudy);

    await savedTextReport.save();
}

async function getAll() {
    return await TextReportStudy.find();
}

async function getById(id) {
    return await TextReportStudy.findById(id);
}

async function _delete(id) {
    await TextReportStudy.findByIdAndRemove(id);
}