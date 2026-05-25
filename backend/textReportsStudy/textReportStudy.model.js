const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    textReport: String,
    IDcreator: Number,
    createdDate: { type: Date, default: Date.now }
});

schema.index({ IDcreator: 1 });
schema.index({ createdDate: -1 });

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TextReportStudy', schema);