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

async function getAll({ limit = 100, skip = 0 } = {}) {
    return await TextReportStudy.find().sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id) {
    return await TextReportStudy.findById(id);
}

async function _delete(id) {
    await TextReportStudy.findByIdAndDelete(id);
}