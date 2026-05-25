const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;

const secret = process.env.JWT_SECRET || config.secret;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    delete: _delete
};

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, secret, { expiresIn: '7d' });
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getAll({ limit = 200, skip = 0 } = {}) {
    return await User.find().select('-hash').skip(skip).limit(limit);
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam) {
    // validate — generic error to avoid user enumeration
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username or password is invalid';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}


async function _delete(id) {
    await User.findByIdAndDelete(id);
}