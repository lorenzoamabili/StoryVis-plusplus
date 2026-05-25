const config = require('config.json');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || config.connectionString;
mongoose.connect(uri, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    maxPoolSize: 10,
    minPoolSize: 2,
}).catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
});
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../users/user.model'),
    Provenance: require('../provGraphs/provenance.model'),
    Story: require('../stories/story.model'),
    ProvenanceStudy: require('../provGraphsStudy/provenanceStudy.model'),
    StoryStudy: require('../storiesStudy/storyStudy.model'),
    TextReport: require('../textReports/textReport.model'),
    TextReportStudy: require('../textReportsStudy/textReportStudy.model')
};