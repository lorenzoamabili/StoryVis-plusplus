const express = require('express');
const routerUsers = express.Router();
const userService = require('./user.service');
const authorize = require('_helpers/authorize');

const VALID_ROLES = ['Admin', 'User', 'Student', 'Instructor'];
const VALID_GROUPS = ['A', 'B', 'Control', 'Experimental'];

// routes
routerUsers.post('/authenticate', authenticate);
routerUsers.post('/register', register);
routerUsers.get('/', authorize('Admin'), getAll);
routerUsers.get('/current', (req, res) => res.sendStatus(404));
routerUsers.get('/:id', authorize(), getById);
routerUsers.delete('/:id', authorize('Admin'), _delete);

module.exports = routerUsers;

function authenticate(req, res, next) {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Username or password is incorrect' });
    }
    userService.authenticate({ username, password })
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    const { username, password, role, group, inviteCode } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    const requiredInvite = process.env.INVITE_CODE;
    if (requiredInvite && inviteCode !== requiredInvite) {
        return res.status(403).json({ message: 'Invalid invite code' });
    }
    if (role && !VALID_ROLES.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }
    if (group && !VALID_GROUPS.includes(group)) {
        return res.status(400).json({ message: 'Invalid group' });
    }
    userService.create({ username, password, role: role || 'User', group: group || 'A' })
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    const limit = Math.max(Math.min(parseInt(req.query.limit) || 200, 1000), 0);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    userService.getAll({ limit, skip })
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}