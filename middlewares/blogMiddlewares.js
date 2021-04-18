const jwt = require('jsonwebtoken');
const User = require('../models/User');

const checkUser = (req, res, next) => {
    const token = req.cookies['jwt-token'];
    
    if (token) {
        jwt.verify(token, 'public_blogs_secret_key', async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                const user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

const requireAuth = (req, res, next) => {
    const token = req.cookies['jwt-token'];

    if (token) {
        jwt.verify(token, 'public_blogs_secret_key', async (err, decodedToken) => {
            if (err) {
                res.redirect('/login');
            } else {
                // console.log(req.path, decodedToken);
                const user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        })
    } else {
        if (req.method === "GET") {
            res.redirect('/login');
        } else if (req.method === "POST") { // 用於 leave_message 的 post 請求
            res.json({errors: '請先登入使用者!'});
        }
    }
};

module.exports = {
    checkUser,
    requireAuth,
}