const config = require('config.json');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || config.connectionString, { useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true });
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