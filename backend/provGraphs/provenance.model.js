const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    serializedGraph: String,
    IDcreator: Number,
    findingsCoord: [{
        coordinates: [{x: Number, y: Number, z: Number}],
        sliceIndex: Number,
        measurementID: Number,
        viewName: String,
        measurementType: String
    }],
    timeStart: Number,
    timeEnd: Number,    
    createdDate: { type: Date, default: Date.now }
});

schema.index({ IDcreator: 1 });
schema.index({ createdDate: -1 });

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Provenance', schema);