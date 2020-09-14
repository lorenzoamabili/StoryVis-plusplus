const config = require('config.json');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || config.connectionString, { useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true });
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../users/user.model'),
    Provenance: require('../provGraphs/provenance.model'),
    Story: require('../stories/story.model'),
    ProvenancePractice: require('../provGraphsPractice/provenancePractice.model'),
    StoryPractice: require('../storiesPractice/storyPractice.model'),
    TextReport: require('../textReports/textReport.model'),
    TextReportPractice: require('../textReportsPractice/textReportPractice.model')
};