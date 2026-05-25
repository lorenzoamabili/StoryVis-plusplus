const expressJwt = require('express-jwt');
const config = require('config.json');

const secret = process.env.JWT_SECRET || config.secret;

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        expressJwt({ secret, algorithms: ['HS256'] }),

        (req, res, next) => {
            if (!req.user || !req.user.role) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            next();
        }
    ];
}