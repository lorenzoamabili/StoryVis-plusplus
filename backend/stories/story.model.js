const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    story: String,
    graph: String,
    IDcreator: String,
    createdDate: { type: Date, default: Date.now }
});

schema.index({ IDcreator: 1, createdDate: -1 });

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Story', schema);