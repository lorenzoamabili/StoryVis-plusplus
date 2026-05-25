const expressJwt = require('express-jwt');
const config = require('config.json');
const userService = require('../users/user.service');

const secret = process.env.JWT_SECRET || config.secret;

// In-memory revocation cache: userId -> true, expires after 1h
const revokedCache = new Map();

module.exports = jwt;

function jwt() {
    return expressJwt({ secret, algorithms: ['HS256'], isRevoked }).unless({
        path: [
            { url: '/ai/chat', methods: ['POST'] },
            { url: '/users/authenticate', methods: ['POST'] },
            { url: '/users/register', methods: ['POST'] },
            { url: '/health', methods: ['GET'] },
        ]
    });
}

async function isRevoked(req, payload, done) {
    const userId = String(payload.sub);

    if (revokedCache.has(userId)) {
        return done(null, true);
    }

    const user = await userService.getById(userId);
    if (!user) {
        revokedCache.set(userId, true);
        setTimeout(() => revokedCache.delete(userId), 3600_000);
        return done(null, true);
    }

    done();
};