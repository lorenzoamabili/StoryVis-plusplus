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

async function getAll({ limit = 100, skip = 0, userId, isAdmin } = {}) {
    const filter = isAdmin ? {} : { IDcreator: userId };
    return await TextReportStudy.find(filter).sort({ createdDate: -1 }).skip(skip).limit(limit);
}

async function getById(id, userId, isAdmin) {
    const report = await TextReportStudy.findById(id);
    if (!report) return null;
    if (!isAdmin && String(report.IDcreator) !== userId) return null;
    return report;
}

async function _delete(id, userId, isAdmin) {
    const report = await TextReportStudy.findById(id);
    if (!report) return false;
    if (!isAdmin && String(report.IDcreator) !== userId) return false;
    await report.deleteOne();
    return true;
}