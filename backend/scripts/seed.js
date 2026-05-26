require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
require('rootpath')();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('config.json');

const uri = process.env.MONGODB_URI || config.connectionString;

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    hash:     { type: String, required: true },
    role:     { type: String, required: true },
    group:    { type: String, required: true },
    createdDate: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const ADMIN_USERNAME = process.env.SEED_ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASS;
const ADMIN_GROUP    = process.env.SEED_ADMIN_GROUP || 'A';

async function seed() {
    if (!ADMIN_PASSWORD) {
        console.error('ERROR: SEED_ADMIN_PASS env var is required');
        process.exit(1);
    }

    await mongoose.connect(uri, {
        useUnifiedTopology: true,
        useCreateIndex: true,
        useNewUrlParser: true,
    });

    const existing = await User.findOne({ username: ADMIN_USERNAME });
    if (existing) {
        console.log(`User "${ADMIN_USERNAME}" already exists — skipping seed.`);
        await mongoose.disconnect();
        return;
    }

    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    await User.create({ username: ADMIN_USERNAME, hash, role: 'Admin', group: ADMIN_GROUP });

    console.log(`Admin user "${ADMIN_USERNAME}" created successfully.`);
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
